# EVM Crawler Module

This module provides a robust EVM blockchain crawler specifically designed for monitoring deposit/withdraw events from smart contracts. It features chain reorganization detection, efficient event parsing, and automatic transaction confirmation updates.

## Features

- **Multi-Chain Support**: Ethereum, Polygon, BSC, Arbitrum, Optimism, and testnets
- **Chain Reorganization Detection**: Automatically detects and handles chain reorgs
- **Event Parsing**: Configurable parsers for Deposit/Withdraw events
- **Confirmation Tracking**: Automatic updates of transaction confirmation counts
- **Block Hash Caching**: Efficient reorg detection with configurable depth
- **Batch Processing**: Processes blocks in configurable batches
- **Error Recovery**: Graceful handling of RPC failures and network issues

## Architecture

The EVM crawler module is designed with a clean separation of concerns:

### 1. Transactions Module (`../transactions/`)
- **Entity**: `TransactionEntity` - Stores transaction data with proper status tracking
- **Repository**: `TransactionRepository** - Database operations for transactions
- **Service**: `TransactionsService** - Business logic for transaction operations
- **Controller**: `TransactionsController** - REST API endpoints for transaction data

### 2. EVM Crawler Module (`./`)
- **Event Parsing Service**: `EventParsingService` - Parses blockchain events using configurable parsers
- **Crawler Service**: `EvmCrawlerService` - Handles blockchain crawling with reorg detection
- **Main Entry**: `crawler-main.ts` - Entry point for starting the crawler

## Core Components

### EvmCrawlerService

The main service that orchestrates the crawling process:

```typescript
@Injectable()
export class EvmCrawlerService {
  // Chain reorganization detection
  private async checkForReorg(): Promise<number | null>
  
  // Block processing with event extraction
  private async fetchEvents(fromBlock: number, toBlock: number)
  
  // State persistence and confirmation updates
  private async saveState(events: EventData[], latestBlock: number)
  
  // Automatic reorg rollback
  private async rollbackReorg(reorgBlock: number)
}
```

### EventParsingService

Service for parsing blockchain events using configurable parsers:

```typescript
@Injectable()
export class EventParsingService {
  // Parse events using registered parsers
  parseEvents(events: ethers.EventLog[]): ParsedEvent[]
  
  // Register custom event parsers
  registerParser(parser: BaseEventParser)
}
```

### Parser System

Configurable event parsing system:

```
src/modules/evm-crawler/parsers/
├── base-event-parser.ts          # Base parser class
├── event-parser-factory.ts       # Parser factory
├── types.ts                      # Parser type definitions
└── events/
    ├── deposit-event-parser.ts   # Deposit event parser
    └── withdraw-event-parser.ts  # Withdraw event parser
```

## Configuration

### Chain Configuration

```typescript
interface ChainConfig {
  chainId: string;                    // Chain identifier (e.g., '1' for Ethereum)
  name: string;                       // Chain name
  rpcUrls: string[];                  // RPC endpoint URLs
  contract: string;                   // Contract address to monitor
  startBlock: number;                 // Block to start crawling from
  requiredConfirmations: number;      // Required confirmations for finality
  pollingInterval: number;            // Delay between batches (ms)
  batchSize: number;                  // Blocks per batch
  reorgDepth: number;                 // Depth for reorg detection
  restartDelay: number;               // Delay before restart (ms)
  maxRetries: number;                 // Maximum retry attempts
  retryDelay: number;                 // Delay between retries (ms)
}
```

### Supported Networks

- **Ethereum Mainnet**: `Network.ETHEREUM` (Chain ID: 1)
- **Polygon**: `Network.POLYGON` (Chain ID: 137)
- **BSC**: `Network.BSC` (Chain ID: 56)
- **Arbitrum**: `Network.ARBITRUM` (Chain ID: 42161)
- **Optimism**: `Network.OPTIMISM` (Chain ID: 10)
- **Sepolia**: `Network.SEPOLIA` (Chain ID: 11155111)
- **BSC Testnet**: `Network.BSC_TESTNET` (Chain ID: 97)
- **Polygon Mumbai**: `Network.POLYGON_MUMBAI` (Chain ID: 80001)

## Usage

### Basic Usage

```typescript
import { startEvmCrawler } from './crawler-main';
import { Network } from './configs/chain-configs';

const config = {
  network: Network.ETHEREUM,
  rpcUrls: ['https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY'],
};

await startEvmCrawler(config);
```

### API Usage

The transactions module provides REST API endpoints:

```bash
# Get transaction by ID
GET /transactions/{id}

# Get transaction by hash
GET /transactions/hash/{chainId}/{txHash}

# Get transactions by chain ID
GET /transactions/chain/{chainId}

# Get transactions by address
GET /transactions/address/{address}

# Get transactions by block range
GET /transactions/blocks/{chainId}?fromBlock=1000&toBlock=2000

# Get all transactions with filters
GET /transactions?chainId=1&status=CONFIRMED&page=1&limit=10
```

## Database Schema

### Transaction Entity

```typescript
@Entity('transactions')
export class TransactionEntity {
  id: string;                           // UUID primary key
  address: string;                      // User address
  amount: string;                       // Formatted amount
  rawAmount: string;                    // Raw amount from blockchain
  operation: TRANSACTION_OPERATION;     // DEPOSIT or WITHDRAW
  transactionHash: string;              // Transaction hash
  chainId: string;                      // Chain identifier
  blockNumber: number;                  // Block number
  blockTime: number;                    // Block timestamp
  blockHash: string;                    // Block hash
  tokenAddress: string;                 // Token contract address
  tokenDecimals: number;                // Token decimal places
  contractAddress: string;              // Contract being monitored
  confirmations: number;                // Current confirmations
  requireConfirmations: number;         // Required confirmations
  status: TRANSACTION_STATUS;           // PENDING, CONFIRMED, or FAILED
  createdAt: Date;                      // Creation timestamp
  updatedAt: Date;                      // Update timestamp
}
```

## Chain Reorganization Handling

The crawler automatically detects and handles chain reorganizations:

### Reorg Detection
- **Block Hash Caching**: Maintains a cache of recent block hashes
- **Configurable Depth**: Uses `reorgDepth` from chain config
- **Hash Comparison**: Compares cached hashes with current blockchain state

### Reorg Recovery
- **Automatic Rollback**: Removes transactions from reorganized blocks
- **State Restoration**: Restores to last known good state
- **Continuation**: Resumes crawling from the last good block

```typescript
// Reorg detection logic
const reorgBlock = await this.checkForReorg();
if (reorgBlock !== null) {
  await this.rollbackReorg(reorgBlock);
  fromBlock = reorgBlock;
}
```

## Event Parsing

### Parser Architecture

The parser system is designed to be extensible:

```typescript
// Base parser class
export abstract class BaseEventParser {
  protected abstract readonly eventName: string;
  protected abstract parseEvent(event: ethers.EventLog): ParsedEvent | null;
}

// Deposit event parser
export class DepositEventParser extends BaseEventParser {
  protected readonly eventName = 'Deposit';
  protected parseEvent(event: ethers.EventLog): DepositEventData | null
}

// Withdraw event parser
export class WithdrawEventParser extends BaseEventParser {
  protected readonly eventName = 'Withdraw';
  protected parseEvent(event: ethers.EventLog): WithdrawEventData | null
}
```

### Event Data Structure

```typescript
interface DepositEventData extends ParsedEvent {
  operation: TRANSACTION_OPERATION.DEPOSIT;
  tokenAddress?: string;
  decimals?: number;
  amount: string;
  rawAmount: string;
  address: string;
}

interface WithdrawEventData extends ParsedEvent {
  operation: TRANSACTION_OPERATION.WITHDRAW;
  tokenAddress?: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  address: string;
}
```

## Performance Features

### Batch Processing
- **Configurable Batch Size**: Process blocks in manageable chunks
- **Memory Management**: Trim old block data to prevent memory leaks
- **Rate Limiting**: Respect RPC rate limits with configurable delays

### Caching
- **Block Hash Cache**: Efficient reorg detection
- **Redis Integration**: Persistent last processed block tracking
- **Smart Cleanup**: Automatic removal of old cache entries

### Error Handling
- **RPC Fallbacks**: Multiple RPC endpoints for redundancy
- **Graceful Degradation**: Continue processing on non-critical errors
- **Retry Logic**: Configurable retry attempts with exponential backoff

## Error Handling

The module uses a centralized error factory pattern:

```typescript
// Transaction errors
TransactionErrors.notFoundById(id);
TransactionErrors.notFoundByHash(hash);
TransactionErrors.invalidData(field);

// Crawler errors
CrawlerErrors.rpcFailure(message);
CrawlerErrors.parsingError(event);
CrawlerErrors.reorgDetected(blockNumber);
```

## Monitoring and Logging

### Logging Levels
- **Info**: Normal operation, block processing, event counts
- **Warning**: Reorg detection, RPC failures, parsing issues
- **Error**: Critical failures, database errors, configuration issues

### Key Metrics
- **Blocks Processed**: Total blocks processed per cycle
- **Events Found**: Number of deposit/withdraw events detected
- **Reorg Count**: Number of chain reorganizations detected
- **Processing Time**: Time per batch and per cycle
- **Error Rate**: RPC failures and parsing errors

## Integration

### Module Integration

```typescript
// In your main application
import { EvmCrawlerModule } from './modules/evm-crawler/evm-crawler.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    // ... other modules
    TransactionsModule,
    EvmCrawlerModule,
  ],
})
export class AppModule {}
```

### Service Usage

```typescript
// Use crawler service
@Injectable()
export class MyService {
  constructor(private evmCrawlerService: EvmCrawlerService) {}
  
  async startCrawler(chainConfig: ChainConfig) {
    await this.evmCrawlerService.start(chainConfig);
  }
}

// Use event parsing service
@Injectable()
export class EventService {
  constructor(private eventParsingService: EventParsingService) {}
  
  async parseEvents(logs: ethers.EventLog[]) {
    return this.eventParsingService.parseEvents(logs);
  }
}
```

## Development

### Adding New Event Types

1. **Create Parser**: Extend `BaseEventParser`
2. **Register Parser**: Add to `EventParsingService`
3. **Update Types**: Add new event data interfaces
4. **Test**: Verify parsing and database storage

### Adding New Chains

1. **Update Config**: Add to `chain-configs.ts`
2. **Set Parameters**: Configure RPC URLs and contract addresses
3. **Test**: Verify crawling and event parsing

### Customizing Parsers

```typescript
export class CustomEventParser extends BaseEventParser {
  protected readonly eventName = 'CustomEvent';
  
  protected parseEvent(event: ethers.EventLog): ParsedEvent | null {
    // Custom parsing logic
    const args = event.args;
    return {
      eventName: 'CustomEvent',
      contractAddress: event.address,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      blockHash: event.blockHash,
      // ... custom fields
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **RPC Failures**: Check RPC endpoint availability and rate limits
2. **Memory Issues**: Reduce batch size or increase cleanup frequency
3. **Parsing Errors**: Verify ABI configuration and event signatures
4. **Database Errors**: Check connection and transaction isolation

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
// Set log level
this.logger.setLogLevels(['debug', 'log', 'warn', 'error']);

// Enable verbose logging
this.logger.debug('Processing block', { blockNumber, events: events.length });
```

## Contributing

1. **Follow Architecture**: Maintain separation of concerns
2. **Add Tests**: Include unit and integration tests
3. **Update Documentation**: Keep README and inline docs current
4. **Error Handling**: Use centralized error patterns
5. **Performance**: Consider memory and RPC usage

## License

This module is part of the EVM Crawler project and follows the project's licensing terms. 