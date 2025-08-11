# EVM Crawler - Blockchain Authentication & Transaction System

A comprehensive blockchain authentication and transaction crawling system built with NestJS, supporting multiple chains (EVM, Solana) with wallet-based authentication, secure withdrawal processing, and real-time transaction monitoring.

## Features

### 🔐 Wallet-Based Authentication
- **Multi-chain Support**: EVM (Ethereum, Polygon, BSC) and Solana
- **Signature Verification**: Secure login using wallet signatures
- **Nonce-based Security**: Prevents replay attacks
- **Role-based Access Control**: User, Admin, Moderator, Super Admin roles
- **Super Admin Configuration**: Environment-based super admin addresses

### 💰 Balance Management
- **Multi-token Support**: Native tokens and ERC-20 tokens
- **Balance Types**: Available, Pending, and Locked balances
- **Real-time Updates**: Automatic balance updates on transaction confirmations
- **Binance-style Interface**: Similar to exchange balance display

### 🔄 Transaction Crawling
- **Chain Reorganization Handling**: Automatic detection and rollback
- **Configurable Confirmations**: Different confirmation requirements per chain
- **Missing Transaction API**: Check and crawl specific transactions
- **Resume Capability**: Continues from last processed block after downtime
- **Batch Processing**: Efficient bulk transaction processing

### 💸 Withdrawal System
- **Security Measures**: 
  - Redis-based race condition prevention
  - Daily withdrawal limits
  - Minimum/maximum amount validation
  - Balance locking during processing
- **Multi-chain Support**: Withdrawals to any supported chain
- **Transaction Tracking**: Full withdrawal history and status
- **Error Handling**: Automatic rollback on failures

### 🏗️ Architecture
- **Modular Design**: Scalable module-based architecture
- **Extensible**: Easy to add new chains and tokens
- **Type Safety**: Full TypeScript implementation
- **API Documentation**: Comprehensive Swagger documentation

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional)

### Environment Configuration

Create a `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=evm_crawler

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=3600s

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Confirmation Settings
ETHEREUM_REQUIRED_CONFIRMATIONS=12
POLYGON_REQUIRED_CONFIRMATIONS=256
BSC_REQUIRED_CONFIRMATIONS=15
SOLANA_REQUIRED_CONFIRMATIONS=32

# Crawler Settings
CRAWLER_POLLING_INTERVAL=10000
CRAWLER_BATCH_SIZE=100

# Withdrawal Settings
MAX_WITHDRAWAL_ATTEMPTS=3
WITHDRAWAL_PRIVATE_KEY=your-withdrawal-private-key

# Super Admin Addresses (comma-separated)
SUPER_ADMIN_ADDRESSES=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6,0x1234567890abcdef
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:run

# Start development server
npm run start:dev
```

### Docker Setup

```bash
# Start development environment
npm run docker:start:dev

# View logs
npm run docker:logs:dev
```

## API Endpoints

### Authentication

#### Get Nonce for Wallet Login
```http
POST /auth/get-nonce
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "chainType": "EVM"
}
```

#### Wallet Login
```http
POST /auth/wallet-login
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "chainType": "EVM",
  "chainId": "1",
  "message": "Login to EVM Crawler\n\nNonce: 1234567890",
  "signature": "0x1234567890abcdef..."
}
```

### Blockchain Operations

#### Check Transaction
```http
POST /crawler/check-transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "txHash": "0x1234567890abcdef...",
  "chainId": "1",
  "chainType": "EVM"
}
```

#### Get Blockchain Balance
```http
GET /blockchain/balance/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6/1/EVM
Authorization: Bearer <token>
```

### Withdrawal Operations

#### Create Withdrawal Request
```http
POST /withdrawal/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "toAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": "0.1",
  "chainType": "EVM",
  "chainId": "1",
  "tokenSymbol": "ETH"
}
```

#### Get Balance
```http
GET /withdrawal/balance?chainType=EVM&chainId=1&tokenSymbol=ETH
Authorization: Bearer <token>
```

#### Get Withdrawal History
```http
GET /withdrawal/history?page=1&limit=10
Authorization: Bearer <token>
```

## System Architecture

### Modules

1. **Auth Module**: Wallet authentication and session management
2. **Blockchain Module**: Multi-chain operations and signature verification
3. **Crawler Module**: Transaction monitoring and chain reorganization handling
4. **Withdrawal Module**: Secure withdrawal processing with race condition prevention
5. **Users Module**: User management and balance tracking

### Database Schema

#### Users
- `walletAddress` (Primary Key): User's wallet address
- `chainType`: EVM or SOLANA
- `role`: USER, ADMIN, MODERATOR, SUPER_ADMIN
- `status`: ACTIVE, INACTIVE, SUSPENDED, PENDING

#### Transactions
- `txHash`: Transaction hash
- `chainType`: Chain type
- `chainId`: Chain identifier
- `status`: PENDING, CONFIRMED, FAILED, CANCELLED, REORGED
- `confirmations`: Number of confirmations
- `requiredConfirmations`: Required confirmations for this chain

#### Balances
- `userWalletAddress`: User's wallet address
- `chainType`: Chain type
- `tokenSymbol`: Token symbol
- `availableBalance`: Available balance
- `pendingBalance`: Pending balance
- `lockedBalance`: Locked balance (for withdrawals)

#### Withdrawal Requests
- `userWalletAddress`: User's wallet address
- `toAddress`: Destination address
- `amount`: Withdrawal amount
- `status`: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REJECTED
- `txHash`: Blockchain transaction hash

## Security Features

### Authentication Security
- **Nonce-based**: Prevents replay attacks
- **Signature Verification**: Cryptographically secure
- **Session Management**: Secure session handling
- **Role-based Access**: Granular permission control

### Withdrawal Security
- **Race Condition Prevention**: Redis-based locking
- **Balance Locking**: Prevents double-spending
- **Daily Limits**: Configurable withdrawal limits
- **Amount Validation**: Minimum/maximum amount checks
- **IP Tracking**: Request tracking for security

### Transaction Security
- **Chain Reorganization Handling**: Automatic rollback
- **Confirmation Requirements**: Chain-specific confirmation counts
- **Error Recovery**: Automatic retry mechanisms
- **Audit Trail**: Complete transaction history

## Adding New Chains

### 1. Update Environment Configuration
Add new RPC URLs and confirmation settings:

```env
NEW_CHAIN_RPC_URL=https://rpc.newchain.com
NEW_CHAIN_REQUIRED_CONFIRMATIONS=20
```

### 2. Update Blockchain Service
Add chain configuration in `BlockchainService`:

```typescript
getRequiredConfirmations(chainId: string): number {
  const chainConfigs = {
    '1': this.configService.get('ETHEREUM_REQUIRED_CONFIRMATIONS'),
    '137': this.configService.get('POLYGON_REQUIRED_CONFIRMATIONS'),
    'new-chain-id': this.configService.get('NEW_CHAIN_REQUIRED_CONFIRMATIONS'),
  };
  return chainConfigs[chainId] || 12;
}
```

### 3. Update Withdrawal Service
Add withdrawal limits in `WithdrawalService`:

```typescript
private getMinimumWithdrawal(chainId: string): number {
  const minAmounts = {
    '1': 0.001,
    'new-chain-id': 0.01,
  };
  return minAmounts[chainId] || 0.001;
}
```

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Migrations
```bash
# Generate migration
npm run db:generate --name=add_new_feature

# Run migrations
npm run db:run

# Revert migrations
npm run db:revert
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Production Docker
```bash
# Build and start production
npm run docker:start:prod

# View production logs
npm run docker:logs:prod
```

### Environment Setup
```bash
# Setup domain and SSL
npm run docker:setup-domain
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
