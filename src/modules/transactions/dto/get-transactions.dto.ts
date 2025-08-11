import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import {
  TRANSACTION_OPERATION,
  TRANSACTION_STATUS,
} from '../entities/transaction.entity';

export class GetTransactionsQueryDto extends PaginationDto {
  @ApiProperty({ description: 'Chain ID', required: false })
  @IsOptional()
  @IsString()
  chainId?: string;

  @ApiProperty({ description: 'User address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Operation type',
    required: false,
    enum: TRANSACTION_OPERATION,
  })
  @IsOptional()
  @IsEnum(TRANSACTION_OPERATION)
  operation?: TRANSACTION_OPERATION;

  @ApiProperty({ description: 'From block number', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fromBlock?: number;

  @ApiProperty({ description: 'To block number', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  toBlock?: number;

  @ApiProperty({ description: 'Token address', required: false })
  @IsOptional()
  @IsString()
  tokenAddress?: string;

  @ApiProperty({
    description: 'Status',
    required: false,
    enum: TRANSACTION_STATUS,
  })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  status?: TRANSACTION_STATUS;
}

export class GetTransactionsResponseDto {
  @ApiProperty({ description: 'List of transactions', type: [Object] })
  transactions: any[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  limit: number;
}
