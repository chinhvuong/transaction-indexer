import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, DataSource } from 'typeorm';
import {
  TransactionEntity,
  TRANSACTION_OPERATION,
  TRANSACTION_STATUS,
} from '@/modules/transactions/entities/transaction.entity';
import { AbstractRepository } from '@/shared/base/abstract.repository';

@Injectable()
export class TransactionRepository extends AbstractRepository<TransactionEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(TransactionEntity, dataSource);
  }

  async findByChainIdAndTransactionHash(
    chainId: string,
    transactionHash: string,
  ): Promise<TransactionEntity | null> {
    return this.findOne({
      where: { chainId, transactionHash },
    });
  }

  async findByChainId(chainId: string): Promise<TransactionEntity[]> {
    return this.find({
      where: { chainId },
      order: { blockNumber: 'DESC' },
    });
  }

  async findByAddress(address: string): Promise<TransactionEntity[]> {
    return this.find({
      where: { address },
      order: { blockNumber: 'DESC' },
    });
  }

  async findByBlockRange(
    chainId: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<TransactionEntity[]> {
    return this.find({
      where: {
        chainId,
        blockNumber: Between(fromBlock, toBlock),
      },
      order: { blockNumber: 'ASC' },
    });
  }

  async findWithPagination(options: {
    page: number;
    limit: number;
    chainId?: string;
    address?: string;
    operation?: TRANSACTION_OPERATION;
    fromBlock?: number;
    toBlock?: number;
    tokenAddress?: string;
    status?: TRANSACTION_STATUS;
  }): Promise<[TransactionEntity[], number]> {
    const {
      page,
      limit,
      chainId,
      address,
      operation,
      fromBlock,
      toBlock,
      tokenAddress,
      status,
    } = options;

    const whereConditions: FindOptionsWhere<TransactionEntity> = {};

    if (chainId) whereConditions.chainId = chainId;
    if (address) whereConditions.address = address;
    if (operation) whereConditions.operation = operation;
    if (fromBlock && toBlock) {
      whereConditions.blockNumber = Between(fromBlock, toBlock);
    }
    if (tokenAddress) whereConditions.tokenAddress = tokenAddress;
    if (status) whereConditions.status = status;

    return this.findAndCount({
      where: whereConditions,
      order: { blockNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findByChainIdWithPagination(
    chainId: string,
    page: number,
    limit: number,
  ): Promise<[TransactionEntity[], number]> {
    return this.findAndCount({
      where: { chainId },
      order: { blockNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findByAddressWithPagination(
    address: string,
    page: number,
    limit: number,
  ): Promise<[TransactionEntity[], number]> {
    return this.findAndCount({
      where: { address },
      order: { blockNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findByBlockRangeWithPagination(
    chainId: string,
    fromBlock: number,
    toBlock: number,
    page: number,
    limit: number,
  ): Promise<[TransactionEntity[], number]> {
    return this.findAndCount({
      where: {
        chainId,
        blockNumber: Between(fromBlock, toBlock),
      },
      order: { blockNumber: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    return this.findOne({
      where: { id },
    });
  }
}
