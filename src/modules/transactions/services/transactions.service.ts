import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '@/modules/repositories/repositories/transaction.repository';
import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';
import { TransactionErrors } from '../errors/transaction.errors';
import { GetTransactionsQueryDto } from '../dto/get-transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getTransactionById(id: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw TransactionErrors.notFoundById(id);
    }
    return transaction;
  }

  async getTransactionByHash(
    chainId: string,
    transactionHash: string,
  ): Promise<TransactionEntity> {
    const transaction =
      await this.transactionRepository.findByChainIdAndTransactionHash(
        chainId,
        transactionHash,
      );
    if (!transaction) {
      throw TransactionErrors.notFoundByHash(transactionHash);
    }
    return transaction;
  }

  async getTransactions(query: GetTransactionsQueryDto): Promise<{
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      chainId,
      address,
      operation,
      fromBlock,
      toBlock,
      tokenAddress,
      status,
    } = query;

    const [transactions, total] =
      await this.transactionRepository.findWithPagination({
        page,
        limit,
        chainId,
        address,
        operation,
        fromBlock,
        toBlock,
        tokenAddress,
        status,
      });

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  async getTransactionsByChainId(
    chainId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [transactions, total] =
      await this.transactionRepository.findByChainIdWithPagination(
        chainId,
        page,
        limit,
      );

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  async getTransactionsByAddress(
    address: string,
    page = 1,
    limit = 10,
  ): Promise<{
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [transactions, total] =
      await this.transactionRepository.findByAddressWithPagination(
        address,
        page,
        limit,
      );

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  async getTransactionsByBlockRange(
    chainId: string,
    fromBlock: number,
    toBlock: number,
    page = 1,
    limit = 10,
  ): Promise<{
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [transactions, total] =
      await this.transactionRepository.findByBlockRangeWithPagination(
        chainId,
        fromBlock,
        toBlock,
        page,
        limit,
      );

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  async saveTransaction(
    transaction: TransactionEntity,
  ): Promise<TransactionEntity> {
    return this.transactionRepository.save(transaction);
  }
}
