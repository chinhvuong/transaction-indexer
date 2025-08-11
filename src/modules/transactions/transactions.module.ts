import { Module } from '@nestjs/common';
import { TransactionRepository } from '@/modules/repositories/repositories/transaction.repository';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { EvmFallbackCrawlerService } from '@/modules/evm-crawler/services/evm-fallback-crawler.service';
import { EventParsingService } from '../evm-crawler/services/event-parsing.service';

@Module({
  providers: [
    TransactionRepository,
    TransactionsService,
    EvmFallbackCrawlerService,
    EventParsingService,
  ],
  controllers: [TransactionsController],
  exports: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {}
