import { ethers } from 'ethers';
import { BaseEventParser } from '../base-event-parser';
import { ParsedEvent } from '../types';
import { TRANSACTION_OPERATION } from '@/modules/transactions/entities/transaction.entity';

export interface WithdrawEventData extends ParsedEvent {
  operation: TRANSACTION_OPERATION.WITHDRAW;
  tokenAddress?: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  address: string;
}

export class WithdrawEventParser extends BaseEventParser {
  protected readonly eventName = 'Withdraw';
  // abi: event Withdraw(address indexed user, address indexed tokenAddress, uint256 amount, uint8 decimals)

  protected parseEvent(event: ethers.EventLog): ParsedEvent | null {
    try {
      const args = event.args;
      if (!args) {
        return null;
      }

      const baseData = this.extractBasicEventData(event);
      return {
        ...baseData,
        operation: TRANSACTION_OPERATION.WITHDRAW,
        tokenAddress: this.extractTokenAddress(args),
        amount: this.extractAmount(args),
        rawAmount: this.extractRawAmount(args),
        decimals: this.extractDecimals(args),
        address: this.extractUserAddress(args),
      } as WithdrawEventData;
    } catch (error) {
      console.error('Error parsing withdraw event:', error);
      return null;
    }
  }

  private extractTokenAddress(args: ethers.Result): string | undefined {
    if (Array.isArray(args) && args[1]) {
      return String(args[1]);
    }
    return undefined;
  }

  private extractDecimals(args: ethers.Result): number | undefined {
    if (Array.isArray(args) && args[3]) {
      return Number(args[3]);
    }
    return undefined;
  }

  private extractRawAmount(args: ethers.Result): string | undefined {
    if (Array.isArray(args) && args[2]) {
      return String(args[2]);
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
