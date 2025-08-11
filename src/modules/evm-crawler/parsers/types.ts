export interface ParsedEvent {
  eventName: string;
  contractAddress: string;
  blockNumber: number;
  transactionHash: string;
  blockHash: string;
  [key: string]: any;
}
