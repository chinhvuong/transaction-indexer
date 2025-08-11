import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { CHAIN_TYPE } from '@/modules/users/entities/user.entity';

export class GetNonceBodyDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Chain type',
    example: 'EVM',
    enum: CHAIN_TYPE,
  })
  @IsEnum(CHAIN_TYPE)
  chainType: CHAIN_TYPE;
}

export class GetNonceResponseDto {
  @ApiProperty({
    description: 'Nonce for signature',
    example: '1234567890',
  })
  nonce: string;

  @ApiProperty({
    description: 'Message to sign',
    example: 'Login to XXX \n\nNonce: 1234567890',
  })
  message: string;
}
