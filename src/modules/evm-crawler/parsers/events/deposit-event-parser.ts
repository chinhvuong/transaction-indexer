import { ethers } from 'ethers';
import { BaseEventParser } from '../base-event-parser';
import { ParsedEvent } from '../types';
import { TRANSACTION_OPERATION } from '@/modules/transactions/entities/transaction.entity';

export interface DepositEventData extends ParsedEvent {
  operation: TRANSACTION_OPERATION.DEPOSIT;
  tokenAddress?: string;
  decimals?: number;
  amount: string;
  rawAmount: string;
  address: string;
}

export class DepositEventParser extends BaseEventParser {
  protected readonly eventName = 'Deposit';
  // abi: event Deposit(address indexed user, address indexed tokenAddress, uint256 amount, uint8 decimals)

  protected parseEvent(event: ethers.EventLog): ParsedEvent | null {
    try {
      const args = event.args;
      if (!args) {
        return null;
      }

      const baseData = this.extractBasicEventData(event);
      return {
        ...baseData,
        operation: TRANSACTION_OPERATION.DEPOSIT,
        tokenAddress: this.extractTokenAddress(args),
        amount: this.extractAmount(args),
        rawAmount: this.extractRawAmount(args),
        address: this.extractUserAddress(args),
        decimals: this.extractDecimals(args),
      } as DepositEventData;
    } catch (error) {
      console.error('Error parsing deposit event:', error);
      return null;
    }
  }

  private extractDecimals(args: unknown): number | undefined {
    if (Array.isArray(args) && args[3]) {
      return Number(args[3]);
    }
    return undefined;
  }

  private extractRawAmount(args: unknown): string | undefined {
    if (Array.isArray(args) && args[2]) {
      return String(args[2]);
    }
    return undefined;
  }

  private extractTokenAddress(args: ethers.Result): string | undefined {
    if (Array.isArray(args) && args[1]) {
      return String(args[1]);
    }
    return undefined;
  }

  private extractAmount(args: ethers.Result): string | undefined {
    const rawAmount = this.extractRawAmount(args);
    if (!rawAmount) {
      return undefined;
    }
    const decimals = this.extractDecimals(args) || 18;
    const amount = ethers.formatUnits(rawAmount, decimals);
    return amount;
  }

  private extractUserAddress(args: ethers.Result): string | undefined {
    if (Array.isArray(args) && args[0]) {
      return String(args[0]);
    }
    return undefined;
  }
}
