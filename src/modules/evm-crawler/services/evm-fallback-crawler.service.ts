import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepository } from '@/modules/repositories/repositories/transaction.repository';
import {
  TransactionEntity,
  TRANSACTION_STATUS,
} from '@/modules/transactions/entities/transaction.entity';
import { EventParsingService } from './event-parsing.service';
import { callRpc } from '../utils/call-rpc';
import { ethers } from 'ethers';
import { ABI } from '../configs/abis';
import { ChainConfig } from '../configs/chain-configs';
import { getChainConfig, Network } from '../configs/chain-configs';
import { DepositEventData } from '../parsers/events/deposit-event-parser';
import { WithdrawEventData } from '../parsers/events/withdraw-event-parser';
import { ParsedEvent } from '../parsers/types';

@Injectable()
export class EvmFallbackCrawlerService {
  private readonly logger = new Logger(EvmFallbackCrawlerService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly eventParsingService: EventParsingService,
  ) {}

  async checkAndSaveMissingTransaction(
    chainId: string,
    transactionHash: string,
  ): Promise<{
    found: boolean;
    transaction?: TransactionEntity;
    message: string;
  }> {
    try {
      // First check if transaction already exists
      const existingTransaction =
        await this.transactionRepository.findByChainIdAndTransactionHash(
          chainId,
          transactionHash,
        );

      if (existingTransaction) {
        return {
          found: true,
          transaction: existingTransaction,
          message: 'Transaction already exists in database',
        };
      }

      // Get chain configuration
      const network = this.getNetworkByChainId(chainId);
      if (!network) {
        return {
          found: false,
          message: `Unsupported chain ID: ${chainId}`,
        };
      }

      const chainConfig = getChainConfig(network);

      // Fetch transaction receipt from blockchain
      const transactionReceipt = await this.fetchTransactionReceipt(
        chainConfig,
        transactionHash,
      );
      if (!transactionReceipt) {
        return {
          found: false,
          message: 'Transaction not found on blockchain',
        };
      }

      // Check if transaction contains relevant events (Deposit/Withdraw)
      const relevantEvents = this.extractRelevantEvents(
        chainConfig,
        transactionReceipt,
      );
      if (relevantEvents.length === 0) {
        return {
          found: false,
          message:
            'Transaction does not contain tracked events (Deposit/Withdraw)',
        };
      }

      // Get block information
      const block = await this.fetchBlock(
        chainConfig,
        transactionReceipt.blockNumber,
      );
      if (!block) {
        return {
          found: false,
          message: 'Block information not available',
        };
      }

      // Get latest block for confirmation calculation
      const latestBlock = await this.getLatestBlockNumber(chainConfig);

      // Parse events using the existing event parsing service
      const parsedEvents = this.eventParsingService.parseEvents(relevantEvents);
      if (parsedEvents.length === 0) {
        return {
          found: false,
          message: 'Failed to parse events from transaction',
        };
      }

      // Create and save transaction entities
      const savedTransactions: TransactionEntity[] = [];
      for (const parsedEvent of parsedEvents) {
        // Type guard to ensure we have the right event type
        if (this.isValidEventData(parsedEvent)) {
          const transaction = this.createTransactionEntity(
            parsedEvent,
            chainConfig,
            transactionReceipt,
            block,
            latestBlock,
          );

          const savedTransaction =
            await this.transactionRepository.save(transaction);
          savedTransactions.push(savedTransaction);
        }
      }

      this.logger.log(
        `Saved ${savedTransactions.length} missing transactions for hash: ${transactionHash}`,
      );

      return {
        found: true,
        transaction: savedTransactions[0], // Return first transaction for API response
        message: `Successfully saved ${savedTransactions.length} missing transaction(s)`,
      };
    } catch (error) {
      this.logger.error(
        `Error checking missing transaction ${transactionHash}:`,
        error,
      );
      return {
        found: false,
        message: `Error processing transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private getNetworkByChainId(chainId: string): Network | null {
    const networks = Object.values(Network);
    for (const network of networks) {
      const config = getChainConfig(network);
      if (config.chainId === chainId) {
        return network;
      }
    }
    return null;
  }

  private async fetchTransactionReceipt(
    chainConfig: ChainConfig,
    transactionHash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await callRpc(async (provider) => {
        return provider.getTransactionReceipt(transactionHash);
      }, chainConfig.rpcUrls);
    } catch (error) {
      this.logger.error(
        `Error fetching transaction receipt for ${transactionHash}:`,
        error,
      );
      return null;
    }
  }

  private extractRelevantEvents(
    chainConfig: ChainConfig,
    transactionReceipt: ethers.TransactionReceipt,
  ): ethers.EventLog[] {
    try {
      const contract = new ethers.Contract(chainConfig.contract, ABI);
      if (
        transactionReceipt.to?.toLowerCase() !==
        chainConfig.contract.toLowerCase()
      ) {
        return [];
      }
      // Get all events from the transaction receipt
      const events = transactionReceipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as ethers.LogDescription[];

      // Filter for relevant events (Deposit/Withdraw)
      const relevantEventNames = events.filter(
        (event) => event && ['Deposit', 'Withdraw'].includes(event.name),
      );

      // Convert LogDescription back to EventLog format for the parser
      const relevantEventLogs: ethers.EventLog[] = [];
      for (const event of relevantEventNames) {
        // Find the corresponding log entry
        const logEntry = transactionReceipt.logs.find((log) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return (
              parsed &&
              parsed.name === event.name &&
              parsed.args.toString() === event.args.toString()
            );
          } catch {
            return false;
          }
        });

        if (logEntry) {
          // Create EventLog from the log entry
          const eventLog = {
            ...logEntry,
            eventName: event.name,
            eventSignature: event.signature,
            args: event.args,
            interface: contract.interface,
          } as ethers.EventLog;

          relevantEventLogs.push(eventLog);
        }
      }

      return relevantEventLogs;
    } catch (error) {
      this.logger.error('Error extracting relevant events:', error);
      return [];
    }
  }

  private async fetchBlock(
    chainConfig: ChainConfig,
    blockNumber: number,
  ): Promise<ethers.Block | null> {
    try {
      return await callRpc(async (provider) => {
        return provider.getBlock(blockNumber);
      }, chainConfig.rpcUrls);
    } catch (error) {
      this.logger.error(`Error fetching block ${blockNumber}:`, error);
      return null;
    }
  }

  private async getLatestBlockNumber(
    chainConfig: ChainConfig,
  ): Promise<number> {
    try {
      return await callRpc(async (provider) => {
        return provider.getBlockNumber();
      }, chainConfig.rpcUrls);
    } catch (error) {
      this.logger.error('Error getting latest block number:', error);
      throw error;
    }
  }

  private isValidEventData(
    parsedEvent: ParsedEvent,
  ): parsedEvent is DepositEventData | WithdrawEventData {
    return (
      'operation' in parsedEvent &&
      'amount' in parsedEvent &&
      'rawAmount' in parsedEvent &&
      'address' in parsedEvent &&
      'tokenAddress' in parsedEvent &&
      'contractAddress' in parsedEvent
    );
  }

  private createTransactionEntity(
    parsedEvent: DepositEventData | WithdrawEventData,
    chainConfig: ChainConfig,
    transactionReceipt: ethers.TransactionReceipt,
    block: ethers.Block,
    latestBlock: number,
  ): TransactionEntity {
    const confirmations = latestBlock - block.number + 1;

    const transaction = new TransactionEntity();
    transaction.address = parsedEvent.address;
    transaction.amount = parsedEvent.amount;
    transaction.rawAmount = parsedEvent.rawAmount;
    transaction.operation = parsedEvent.operation;
    transaction.transactionHash = transactionReceipt.hash;
    transaction.chainId = chainConfig.chainId;
    transaction.blockNumber = block.number;
    transaction.blockTime = (block.timestamp || 0) * 1000;
    transaction.blockHash = block.hash || '';
    transaction.tokenAddress = parsedEvent.tokenAddress || '';
    transaction.tokenDecimals = parsedEvent.decimals || 18;
    transaction.contractAddress = parsedEvent.contractAddress;
    transaction.confirmations = confirmations;
    transaction.requireConfirmations = chainConfig.requiredConfirmations;
    transaction.status =
      confirmations >= chainConfig.requiredConfirmations
        ? TRANSACTION_STATUS.CONFIRMED
        : TRANSACTION_STATUS.PENDING;

    return transaction;
  }
}
