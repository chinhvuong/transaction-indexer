import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class GetTransactionsByBlocksParamDto {
  @ApiProperty({ description: 'Chain ID' })
  @IsString()
  chainId: string;
}

export class GetTransactionsByBlocksQueryDto extends PaginationDto {
  @ApiProperty({ description: 'From block number' })
  @IsNumber()
  @Min(0)
  fromBlock: number;

  @ApiProperty({ description: 'To block number' })
  @IsNumber()
  @Min(0)
  toBlock: number;

  @ApiProperty({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ description: 'Page size', default: 10 })
  @IsNumber()
  @Min(1)
  limit: number = 10;
}

export class GetTransactionsByBlocksResponseDto {
  @ApiProperty({ description: 'List of transactions', type: [Object] })
  transactions: any[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  limit: number;
}
