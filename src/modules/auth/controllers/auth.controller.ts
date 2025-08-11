import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from '@/modules/auth/services/auth.service';
import {
  RefreshTokenBodyDto,
  RefreshTokenResponseDto,
} from '@/modules/auth/dto/refresh-token.dto';
import {
  WalletLoginBodyDto,
  WalletLoginResponseDto,
} from '@/modules/auth/dto/wallet-login.dto';
import {
  GetNonceBodyDto,
  GetNonceResponseDto,
} from '@/modules/auth/dto/get-nonce.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenBodyDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Get nonce for wallet authentication' })
  @ApiBody({ type: GetNonceBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Nonce generated successfully',
    type: GetNonceResponseDto,
  })
  @Post('get-nonce')
  @HttpCode(HttpStatus.OK)
  async getNonce(@Body() getNonceDto: GetNonceBodyDto) {
    return this.authService.getNonce(getNonceDto);
  }

  @ApiOperation({ summary: 'Login with wallet signature' })
  @ApiBody({ type: WalletLoginBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Wallet login successful',
    type: WalletLoginResponseDto,
  })
  @Post('wallet-login')
  @HttpCode(HttpStatus.OK)
  async walletLogin(
    @Body() walletLoginDto: WalletLoginBodyDto,
    @Req() req: Request,
  ) {
    return this.authService.walletLogin(walletLoginDto, {
      userAgent: req.headers['user-agent'] as string,
      ip: (req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.ip) as string,
      deviceId: req.headers['device-id'] as string,
      fingerprint: req.headers['fingerprint'] as string,
    });
  }
}
