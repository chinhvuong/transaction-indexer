export enum Network {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  SEPOLIA = 'sepolia',
  BSC_TESTNET = 'bsc-testnet',
  POLYGON_MUMBAI = 'polygon-mumbai',
}

export interface ChainConfig {
  chainId: string;
  name: string;
  rpcUrls: string[];
  requiredConfirmations: number;
  pollingInterval: number;
  batchSize: number;
  reorgDepth: number;
  restartDelay: number;
  maxRetries: number;
  retryDelay: number;
  contract: string; // address
  startBlock: number;
}

const CHAIN_CONFIGS: Record<Network, ChainConfig> = {
  [Network.ETHEREUM]: {
    chainId: '1',
    name: 'Ethereum Mainnet',
    requiredConfirmations: 12,
    rpcUrls: process.env.ETHEREUM_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 100,
    reorgDepth: 12,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
  [Network.POLYGON]: {
    chainId: '137',
    name: 'Polygon Mainnet',
    requiredConfirmations: 256,
    rpcUrls: process.env.POLYGON_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 100,
    reorgDepth: 256,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
  [Network.BSC]: {
    chainId: '56',
    name: 'BNB Smart Chain',
    requiredConfirmations: 15,
    rpcUrls: process.env.BSC_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 100,
    reorgDepth: 15,
    restartDelay: 2000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  [Network.ARBITRUM]: {
    chainId: '42161',
    name: 'Arbitrum One',
    requiredConfirmations: 12,
    rpcUrls: process.env.ARBITRUM_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 100,
    reorgDepth: 12,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
  [Network.OPTIMISM]: {
    chainId: '10',
    name: 'Optimism',
    requiredConfirmations: 12,
    rpcUrls: process.env.OPTIMISM_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 100,
    reorgDepth: 12,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
  [Network.SEPOLIA]: {
    chainId: '11155111',
    name: 'Sepolia Testnet',
    requiredConfirmations: 12,
    rpcUrls: process.env.SEPOLIA_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 50,
    reorgDepth: 12,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
  [Network.BSC_TESTNET]: {
    chainId: '97',
    name: 'BSC Testnet',
    requiredConfirmations: 12,
    rpcUrls: process.env.BSC_TESTNET_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 50,
    reorgDepth: 12,
    restartDelay: 2000,
    maxRetries: 3,
    retryDelay: 1000,
  },
  [Network.POLYGON_MUMBAI]: {
    chainId: '80001',
    name: 'Polygon Mumbai',
    requiredConfirmations: 256,
    rpcUrls: process.env.POLYGON_MUMBAI_RPC_URLS?.split(',') || [],
    contract: '0x0000000000000000000000000000000000000000', // TODO: add contract address
    startBlock: 18000000,
    pollingInterval: 10000,
    batchSize: 50,
    reorgDepth: 256,
    restartDelay: 5000,
    maxRetries: 3,
    retryDelay: 2000,
  },
};

export function getChainConfig(network: Network): ChainConfig {
  return CHAIN_CONFIGS[network];
}
