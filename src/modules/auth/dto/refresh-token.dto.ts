import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { WalletLoginResponseDto } from './wallet-login.dto';

// Request DTOs
export class RefreshTokenBodyDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResponseDto extends WalletLoginResponseDto {}
