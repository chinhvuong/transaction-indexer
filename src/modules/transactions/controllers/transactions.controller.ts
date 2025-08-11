import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from '../services/transactions.service';
import {
  GetTransactionsByChainParamDto,
  GetTransactionsByChainQueryDto,
  GetTransactionsByChainResponseDto,
} from '@/modules/transactions/dto/get-transactions-by-chain.dto';
import {
  GetTransactionsByAddressParamDto,
  GetTransactionsByAddressQueryDto,
  GetTransactionsByAddressResponseDto,
} from '@/modules/transactions/dto/get-transactions-by-address.dto';
import {
  GetTransactionsByBlocksParamDto,
  GetTransactionsByBlocksQueryDto,
  GetTransactionsByBlocksResponseDto,
} from '@/modules/transactions/dto/get-transactions-by-blocks.dto';
import {
  GetTransactionParamDto,
  GetTransactionResponseDto,
} from '@/modules/transactions/dto/get-transaction.dto';
import {
  GetTransactionByHashParamDto,
  GetTransactionByHashResponseDto,
} from '@/modules/transactions/dto/get-transaction-by-hash.dto';
import {
  GetTransactionsQueryDto,
  GetTransactionsResponseDto,
} from '@/modules/transactions/dto/get-transactions.dto';
import {
  CheckMissingTransactionParamDto,
  CheckMissingTransactionResponseDto,
} from '@/modules/transactions/dto/check-missing-transaction.dto';
import { EvmFallbackCrawlerService } from '@/modules/evm-crawler/services/evm-fallback-crawler.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly evmFallbackCrawlerService: EvmFallbackCrawlerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, type: GetTransactionsResponseDto })
  async getTransactions(
    @Query() getTransactionsQueryDto: GetTransactionsQueryDto,
  ): Promise<GetTransactionsResponseDto> {
    return await this.transactionsService.getTransactions(
      getTransactionsQueryDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, type: GetTransactionResponseDto })
  async getTransactionById(
    @Param() getTransactionParamDto: GetTransactionParamDto,
  ): Promise<GetTransactionResponseDto> {
    const transaction = await this.transactionsService.getTransactionById(
      getTransactionParamDto.id,
    );
    return transaction as GetTransactionResponseDto;
  }

  @Get('hash/:chainId/:transactionHash')
  @ApiOperation({ summary: 'Get transaction by chain ID and hash' })
  @ApiResponse({ status: 200, type: GetTransactionByHashResponseDto })
  async getTransactionByHash(
    @Param() getTransactionByHashParamDto: GetTransactionByHashParamDto,
  ): Promise<GetTransactionByHashResponseDto> {
    const transaction = await this.transactionsService.getTransactionByHash(
      getTransactionByHashParamDto.chainId,
      getTransactionByHashParamDto.transactionHash,
    );
    return transaction as GetTransactionByHashResponseDto;
  }

  @Get('chain/:chainId')
  @ApiOperation({ summary: 'Get transactions by chain ID' })
  @ApiResponse({ status: 200, type: GetTransactionsByChainResponseDto })
  async getTransactionsByChainId(
    @Param() getTransactionsByChainParamDto: GetTransactionsByChainParamDto,
    @Query() getTransactionsByChainQueryDto: GetTransactionsByChainQueryDto,
  ): Promise<GetTransactionsByChainResponseDto> {
    return await this.transactionsService.getTransactionsByChainId(
      getTransactionsByChainParamDto.chainId,
      getTransactionsByChainQueryDto.page,
      getTransactionsByChainQueryDto.limit,
    );
  }

  @Get('address/:address')
  @ApiOperation({ summary: 'Get transactions by address' })
  @ApiResponse({ status: 200, type: GetTransactionsByAddressResponseDto })
  async getTransactionsByAddress(
    @Param() getTransactionsByAddressParamDto: GetTransactionsByAddressParamDto,
    @Query() getTransactionsByAddressQueryDto: GetTransactionsByAddressQueryDto,
  ): Promise<GetTransactionsByAddressResponseDto> {
    return await this.transactionsService.getTransactionsByAddress(
      getTransactionsByAddressParamDto.address,
      getTransactionsByAddressQueryDto.page,
      getTransactionsByAddressQueryDto.limit,
    );
  }

  @Get('blocks/:chainId')
  @ApiOperation({ summary: 'Get transactions by block range' })
  @ApiResponse({ status: 200, type: GetTransactionsByBlocksResponseDto })
  async getTransactionsByBlockRange(
    @Param() getTransactionsByBlocksParamDto: GetTransactionsByBlocksParamDto,
    @Query() getTransactionsByBlocksQueryDto: GetTransactionsByBlocksQueryDto,
  ): Promise<GetTransactionsByBlocksResponseDto> {
    return await this.transactionsService.getTransactionsByBlockRange(
      getTransactionsByBlocksParamDto.chainId,
      getTransactionsByBlocksQueryDto.fromBlock,
      getTransactionsByBlocksQueryDto.toBlock,
      getTransactionsByBlocksQueryDto.page,
      getTransactionsByBlocksQueryDto.limit,
    );
  }

  @Post('check-missing/:chainId/:transactionHash')
  @ApiOperation({ summary: 'Check and save missing transaction' })
  @ApiResponse({ status: 200, type: CheckMissingTransactionResponseDto })
  async checkMissingTransaction(
    @Param() checkMissingTransactionParamDto: CheckMissingTransactionParamDto,
  ): Promise<CheckMissingTransactionResponseDto> {
    return await this.evmFallbackCrawlerService.checkAndSaveMissingTransaction(
      checkMissingTransactionParamDto.chainId,
      checkMissingTransactionParamDto.transactionHash,
    );
  }
}
