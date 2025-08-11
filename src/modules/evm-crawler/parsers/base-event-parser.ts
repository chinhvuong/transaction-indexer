import { ethers } from 'ethers';
import { ParsedEvent } from './types';

export interface IEventParser {
  canParse(event: ethers.EventLog): boolean;
  parse(event: ethers.EventLog): ParsedEvent | null;
  getEventName(): string;
}

export abstract class BaseEventParser implements IEventParser {
  protected abstract readonly eventName: string;

  canParse(event: ethers.EventLog): boolean {
    return event.eventName === this.eventName;
  }

  parse(event: ethers.EventLog): ParsedEvent | null {
    if (!this.canParse(event)) {
      return null;
    }

    try {
      return this.parseEvent(event);
    } catch (error) {
      console.error(`Error parsing ${this.eventName} event:`, error);
      return null;
    }
  }

  getEventName(): string {
    return this.eventName;
  }

  protected abstract parseEvent(event: ethers.EventLog): ParsedEvent | null;

  protected extractBasicEventData(
    event: ethers.EventLog,
  ): Partial<ParsedEvent> {
    return {
      eventName: event.eventName || this.eventName,
      contractAddress: event.address,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      blockHash: event.blockHash,
    };
  }
}
