import { Injectable, Logger } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  TransactionEntity,
  TRANSACTION_STATUS,
} from '@/modules/transactions/entities/transaction.entity';
import { ChainConfig } from '../configs/chain-configs';
import { EventParsingService } from './event-parsing.service';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { callRpc } from '../utils/call-rpc';
import { ethers } from 'ethers';
import { ABI } from '../configs/abis';
import { DepositEventData } from '../parsers/events/deposit-event-parser';
import { WithdrawEventData } from '../parsers/events/withdraw-event-parser';
import { isPsqlConflictError } from '@/shared/utils';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class EvmCrawlerService {
  private readonly logger = new Logger(EvmCrawlerService.name);
  private lastProcessedBlock: number = 0;
  private isRunning: boolean = false;
  private chain: ChainConfig;
  private contract: ethers.Contract;
  private blockMap: Map<
    number,
    { blockTime: number; blockHash: string; parentHash: string }
  > = new Map();
  private reorgDepth: number;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRedis()
    private redis: Redis,
    private eventParsingService: EventParsingService,
  ) {}

  public async start(chainConfig: ChainConfig): Promise<void> {
    this.chain = chainConfig;
    this.contract = new ethers.Contract(this.chain.contract, ABI);
    this.reorgDepth = this.chain.reorgDepth;

    if (this.isRunning) {
      this.logger.warn('Crawler is already running');
      return;
    }

    this.lastProcessedBlock = await this.loadLastProcessedBlock();

    try {
      this.logger.log(`Starting crawler for ${this.chain.chainId}`);
      await this.crawl();
    } catch (error) {
      this.logger.error(
        `Failed to start crawler for ${this.chain.chainId}:`,
        error,
      );
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.logger.log(`Stopping crawler for ${this.chain.chainId}`);
  }

  private async crawl(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Crawler is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting crawler cycle');

    try {
      const latestBlock = await this.getLatestBlockNumber();
      // const processUpTo = latestBlock - this.chain.requiredConfirmations;
      let fromBlock = this.lastProcessedBlock + 1;
      let toBlock = Math.min(fromBlock + this.chain.batchSize - 1, latestBlock);

      this.logger.log(
        `Crawler initialized - fromBlock: ${fromBlock}, toBlock: ${toBlock}, latestBlock: ${latestBlock}, batchSize: ${this.chain.batchSize}`,
      );

      const reorgBlock = await this.checkForReorg();
      if (reorgBlock !== null) {
        await this.rollbackReorg(reorgBlock);
        fromBlock = reorgBlock;
        toBlock = Math.min(fromBlock + this.chain.batchSize - 1, latestBlock);
      }

      while (fromBlock <= latestBlock) {
        this.logger.log(
          `Processing ${toBlock - fromBlock + 1} blocks ${fromBlock} → ${toBlock}, latestBlock: ${latestBlock}`,
        );

        const events = await this.fetchEvents(fromBlock, toBlock);
        const eventBlockNumbers = [
          ...new Set(events.map((event) => event.blockNumber)),
        ];
        await this.saveBlockMap(
          eventBlockNumbers,
          latestBlock,
          fromBlock,
          toBlock,
        );
        await this.saveState(events, latestBlock);

        await this.updateLastProcessedBlock(toBlock);
        this.lastProcessedBlock = toBlock;

        // Trim old block data
        const trimThreshold = latestBlock - this.chain.reorgDepth;
        this.blockMap = new Map(
          [...this.blockMap.entries()].filter(
            ([blockNum]) => blockNum > trimThreshold,
          ),
        );

        fromBlock = toBlock + 1;
        toBlock = Math.min(fromBlock + this.chain.batchSize - 1, latestBlock);

        await this.delay(this.chain.pollingInterval);
      }

      this.logger.log('Crawler cycle completed');

      void setTimeout(() => {
        this.isRunning = false;
        void this.crawl();
      }, this.chain.restartDelay);
    } catch (error) {
      this.logger.error('Critical crawler error', error);
      this.isRunning = false;
      void setTimeout(() => void this.crawl(), 5000);
    }
  }

  private async saveBlockMap(
    eventBlockNumbers: number[],
    latestBlock: number,
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    const reorgThreshold = latestBlock - this.chain.reorgDepth + 1;
    const additionalBlockNumbers: number[] = [];
    for (let b = Math.max(fromBlock, reorgThreshold); b <= toBlock; b++) {
      if (!eventBlockNumbers.includes(b)) {
        additionalBlockNumbers.push(b);
      }
    }
    const blockNumbers = [
      ...eventBlockNumbers,
      ...additionalBlockNumbers,
    ].filter((b) => !this.blockMap.has(b));
    if (blockNumbers.length > 0) {
      const blocks = await callRpc(async (provider) => {
        return Promise.all(
          blockNumbers.map((blockNumber) => provider.getBlock(blockNumber)),
        );
      }, this.chain.rpcUrls);

      for (const block of blocks) {
        if (block) {
          this.blockMap.set(block.number, {
            blockTime: block.timestamp * 1000,
            blockHash: block.hash || '',
            parentHash: block.parentHash || '',
          });
        }
      }
    }
    this.logger.log(`Saved ${blockNumbers.length} blocks to block map`);
  }

  private async getLatestBlockNumber(): Promise<number> {
    try {
      const blockNumber = await callRpc(
        async (provider) => provider.getBlockNumber(),
        this.chain.rpcUrls,
      );

      return blockNumber;
    } catch (error) {
      this.logger.error('Failed to get latest block number', error);
      throw error;
    }
  }

  private async fetchEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<(DepositEventData | WithdrawEventData)[]> {
    try {
      const allEvents = (await callRpc(async (provider) => {
        return this.contract
          .connect(provider)
          .queryFilter(['Deposit', 'Withdraw'], fromBlock, toBlock);
      }, this.chain.rpcUrls)) as ethers.EventLog[];

      return this.eventParsingService.parseEvents(allEvents) as (
        | DepositEventData
        | WithdrawEventData
      )[];
    } catch (error) {
      this.logger.error(
        `Error fetching events from ${fromBlock} to ${toBlock}:`,
        error,
      );
      throw error;
    }
  }

  private async checkForReorg(): Promise<number | null> {
    let deepestReorg: number | null = null;

    for (let i = 0; i < this.reorgDepth; i++) {
      const blockNumber = this.lastProcessedBlock - i;
      if (blockNumber < this.chain.startBlock) break;

      const cachedBlock = this.blockMap.get(blockNumber);
      if (!cachedBlock) continue;

      try {
        const currentBlock = await callRpc(
          async (provider) => provider.getBlock(blockNumber),
          this.chain.rpcUrls,
        );
        if (currentBlock?.hash !== cachedBlock.blockHash) {
          this.logger.warn(
            `Reorg detected at block ${blockNumber}. Expected hash: ${cachedBlock.blockHash}, Found: ${currentBlock?.hash}`,
          );
          deepestReorg = blockNumber;
        } else {
          this.blockMap.set(blockNumber, {
            blockTime: currentBlock?.timestamp * 1000 || 0,
            blockHash: currentBlock?.hash || '',
            parentHash: currentBlock?.parentHash || '',
          });
          break;
        }
      } catch (error) {
        this.logger.error(
          `Error checking reorg for block ${blockNumber}:`,
          error,
        );
        break;
      }
    }

    return deepestReorg;
  }

  private async rollbackReorg(reorgBlock: number): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(TransactionEntity, {
          chainId: this.chain.chainId,
          blockNumber: MoreThanOrEqual(reorgBlock),
        });
        this.logger.log(`Rolled back transactions from block ${reorgBlock}`);
      });
      this.blockMap = new Map(
        [...this.blockMap.entries()].filter(
          ([blockNum]) => blockNum < reorgBlock,
        ),
      );
      await this.updateLastProcessedBlock(reorgBlock - 1);
      this.lastProcessedBlock = reorgBlock - 1;
    } catch (error) {
      this.logger.error(`Error rolling back from block ${reorgBlock}:`, error);
      throw error;
    }
  }

  private async saveState(
    events: (DepositEventData | WithdrawEventData)[],
    latestBlock: number,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        // Save new events
        if (events.length > 0) {
          const confirmations = latestBlock - events[0].blockNumber + 1;

          const transactions = events.map((event) => {
            const blockInfo = this.blockMap.get(event.blockNumber);
            const transaction = {
              ...event,
              chainId: this.chain.chainId,
              blockTime: Number(blockInfo?.blockTime || 0),
              status:
                confirmations >= this.chain.requiredConfirmations
                  ? TRANSACTION_STATUS.CONFIRMED
                  : TRANSACTION_STATUS.PENDING,
              requireConfirmations: this.chain.requiredConfirmations,
              blockHash: blockInfo?.blockHash || '',
              confirmations,
            };
            return transaction;
          });

          try {
            await manager.save(TransactionEntity, transactions);
            this.logger.log(`Saved ${transactions.length} new events`);
          } catch (error) {
            if (isPsqlConflictError(error)) {
              for (const transaction of transactions) {
                await manager.upsert(TransactionEntity, transaction, {
                  conflictPaths: ['transaction_hash'],
                  skipUpdateIfNoValuesChanged: true,
                });
              }
              this.logger.log(
                `Upserted ${transactions.length} new events due to conflict`,
              );
            } else {
              throw error;
            }
          }
        } else {
          this.logger.log('No new events to save');
        }

        // Update confirmations for existing transactions that need updates
        const existingTransactions = await manager.find(TransactionEntity, {
          where: {
            chainId: this.chain.chainId,
            confirmations: LessThan(this.chain.requiredConfirmations),
          },
        });

        if (existingTransactions.length > 0) {
          const updatedTransactions = existingTransactions.map((tx) => {
            const confirmations = Math.min(
              latestBlock - tx.blockNumber + 1,
              tx.requireConfirmations,
            );
            return {
              ...tx,
              confirmations,
              status:
                confirmations >= this.chain.requiredConfirmations
                  ? TRANSACTION_STATUS.CONFIRMED
                  : TRANSACTION_STATUS.PENDING,
            };
          });

          await manager.save(TransactionEntity, updatedTransactions);
          this.logger.log(
            `Updated confirmations for ${updatedTransactions.length} existing transactions`,
          );
        } else {
          this.logger.log('No existing transactions need confirmation updates');
        }
      });
    } catch (error) {
      this.logger.error('Error in saveState:', error);
      throw error;
    }
  }

  private async loadLastProcessedBlock(): Promise<number> {
    const cacheKey = `last_processed_block:${this.chain.chainId}`;

    try {
      const cachedBlock = await this.redis.get(cacheKey);
      if (cachedBlock) {
        return parseInt(cachedBlock);
      }

      return await this.dataSource.transaction(async (manager) => {
        const latestTx = await manager.findOne(TransactionEntity, {
          where: { chainId: this.chain.chainId },
          order: { blockNumber: 'DESC' },
        });

        const lastBlock = latestTx
          ? latestTx.blockNumber
          : this.chain.startBlock - 1;

        await this.redis.set(cacheKey, lastBlock.toString());

        return lastBlock;
      });
    } catch (error) {
      this.logger.error('Error loading last processed block:', error);
      return this.chain.startBlock - 1;
    }
  }

  private async updateLastProcessedBlock(blockNumber: number): Promise<void> {
    const cacheKey = `last_processed_block:${this.chain.chainId}`;
    await this.redis.set(cacheKey, blockNumber.toString());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
