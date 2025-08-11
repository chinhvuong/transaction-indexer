import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckMissingTransactionParamDto {
  @ApiProperty({
    description: 'Chain ID',
    example: '1',
  })
  @IsString()
  chainId: string;

  @ApiProperty({
    description: 'Transaction hash to check',
    example: '0x1234567890abcdef...',
  })
  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}

export class CheckMissingTransactionResponseDto {
  @ApiProperty({
    description: 'Whether the transaction was found and saved',
    example: true,
  })
  found: boolean;

  @ApiProperty({
    description: 'Transaction details if found',
    example: {
      id: 'uuid',
      transactionHash: '0x1234567890abcdef...',
      blockNumber: 18000000,
      status: 'CONFIRMED',
      confirmations: 12,
    },
    required: false,
  })
  transaction?: any;

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Transaction found and saved successfully',
  })
  message: string;
}
