import { NestFactory } from '@nestjs/core';
import { EvmCrawlerModule } from './evm-crawler.module';
import { EvmCrawlerService } from './services/evm-crawler.service';
import { Logger } from '@nestjs/common';
import { Network, getChainConfig } from './configs/chain-configs';
import { ConfigService } from '@nestjs/config';

/**
 * Main entry point for the EVM deposit/withdraw crawler
 * This can be used as a standalone crawler or imported into the main API
 */
export async function startEvmCrawler(): Promise<void> {
  const logger = new Logger('EvmCrawlerMain');

  try {
    logger.log(`Starting EVM crawler...`);

    const app = await NestFactory.createApplicationContext(EvmCrawlerModule);
    const configService = app.get(ConfigService);
    const network = configService.get<string>('NETWORK');

    const crawlerService = app.get(EvmCrawlerService);

    const chainConfig = getChainConfig(network as Network);

    await crawlerService.start(chainConfig);

    logger.log(`EVM crawler completed successfully for ${network}`);

    // await app.close();
  } catch (error) {
    logger.error(`Error starting EVM crawler:`, error);
    throw error;
  }
}

/**
 * Example usage:
 *
 * import { startEvmCrawler } from './crawler-main';
 * import { Network } from './configs/chain-configs';
 *
 * const config = {
 *   network: Network.ETHEREUM,
 *   rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY',
 * };
 *
 * startEvmCrawler(config);
 */
