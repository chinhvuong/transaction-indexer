import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { CHAIN_TYPE } from '@/modules/users/entities/user.entity';

export class WalletLoginBodyDto {
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
    enum: ['EVM', 'SOLANA'],
  })
  @IsIn(['EVM', 'SOLANA'])
  @IsNotEmpty()
  chainType: CHAIN_TYPE;

  @ApiProperty({
    description: 'Signature of the message',
    example: '0x1234567890abcdef...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class WalletLoginResponseDto {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User profile',
  })
  profile: {
    walletAddress: string;
    chainType: CHAIN_TYPE;
    role: string;
    name?: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  accessTokenExpiresIn: number;

  @ApiProperty({
    description: 'Refresh token expiration time in seconds',
    example: 604800,
  })
  refreshTokenExpiresIn: number;
}
