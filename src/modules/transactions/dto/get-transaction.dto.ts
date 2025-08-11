import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  TRANSACTION_OPERATION,
  TRANSACTION_STATUS,
} from '../entities/transaction.entity';

export class GetTransactionParamDto {
  @ApiProperty({ description: 'Transaction ID' })
  @IsUUID()
  id: string;
}

export class GetTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'User address' })
  address: string;

  @ApiProperty({ description: 'Amount (divided by decimals)' })
  amount: string;

  @ApiProperty({ description: 'Operation type', enum: TRANSACTION_OPERATION })
  operation: TRANSACTION_OPERATION;

  @ApiProperty({ description: 'Transaction hash' })
  transactionHash: string;

  @ApiProperty({ description: 'Chain ID' })
  chainId: string;

  @ApiProperty({ description: 'Block number' })
  blockNumber: number;

  @ApiProperty({ description: 'Block timestamp' })
  blockTime: number;

  @ApiProperty({ description: 'Raw amount (not divided by decimals)' })
  rawAmount: string;

  @ApiProperty({ description: 'Token address', required: false })
  tokenAddress?: string;

  @ApiProperty({ description: 'Token decimals' })
  tokenDecimals: number;

  @ApiProperty({ description: 'Contract address', required: false })
  contractAddress?: string;

  @ApiProperty({ description: 'Current confirmations' })
  confirmations: number;

  @ApiProperty({ description: 'Required confirmations' })
  requireConfirmations: number;

  @ApiProperty({ description: 'Transaction status', enum: TRANSACTION_STATUS })
  status: TRANSACTION_STATUS;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
}
