import { Module } from '@nestjs/common';
import { EvmCrawlerService } from './services/evm-crawler.service';
import { EventParsingService } from './services/event-parsing.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { Logger } from '@nestjs/common';

@Module({
  imports: [TransactionsModule],
  providers: [EvmCrawlerService, EventParsingService, Logger],
  exports: [EvmCrawlerService, EventParsingService, Logger],
})
export class EvmCrawlerModule {}
