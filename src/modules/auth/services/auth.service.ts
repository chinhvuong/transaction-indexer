import { Injectable, Logger } from '@nestjs/common';
import { AuthErrors } from '../errors/auth.errors';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  USER_ROLE,
  USER_STATUS,
  UserEntity,
} from '@/modules/users/entities/user.entity';
import { UserRepository } from '@/modules/repositories/repositories/user.repository';
import { SessionRepository } from '@/modules/repositories/repositories/session.repository';
import { WalletLoginBodyDto } from '../dto/wallet-login.dto';
import { GetNonceBodyDto } from '../dto/get-nonce.dto';

import { RefreshTokenBodyDto } from '../dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '@/shared/configs/env.config';
import { JwtPayload, RefreshTokenPayload } from '@/modules/auth/types';
import { SessionEntity } from '@/modules/users/entities/session.entity';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import { accessTokenPayloadExpiredKey, nonceKey } from '../constants/cache';
import { NONCE_EXPIRATION_TIME } from '../constants';
import { SignatureVerifierFactory } from '../signature-verifiers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS: number;
  private readonly REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS: number;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly ACCESS_TOKEN_SECRET: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentConfig>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS =
      +this.configService.getOrThrow<number>(
        'ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS',
      );
    this.REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS =
      +this.configService.getOrThrow<number>(
        'REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
      );
    this.REFRESH_TOKEN_SECRET = this.configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );
    this.ACCESS_TOKEN_SECRET = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );
  }

  async getNonce(getNonceDto: GetNonceBodyDto) {
    const { walletAddress, chainType } = getNonceDto;

    const nonce =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    await this.redis.setex(
      nonceKey(walletAddress, chainType),
      NONCE_EXPIRATION_TIME,
      nonce,
    );

    return {
      nonce,
      message: this.generateMessage(nonce),
    };
  }

  async walletLogin(
    walletLoginDto: WalletLoginBodyDto,
    deviceInfo: {
      userAgent?: string;
      ip?: string;
      deviceId?: string;
      fingerprint?: string;
    },
  ) {
    const { walletAddress, chainType, signature } = walletLoginDto;
    const nonceCacheKey = nonceKey(walletAddress, chainType);
    const nonce = await this.redis.get(nonceCacheKey);
    if (!nonce) {
      throw AuthErrors.invalidNonce();
    }
    const message = this.generateMessage(nonce);
    const verifier = SignatureVerifierFactory.getVerifier(chainType);
    const isValidSignature = verifier.verifySignature(
      message,
      signature,
      walletAddress,
    );

    if (!isValidSignature) {
      throw AuthErrors.invalidSignature();
    }
    await this.redis.del(nonceCacheKey);

    let user = await this.userRepository.findByWalletAddress(walletAddress);

    if (!user) {
      user = this.userRepository.create({
        walletAddress: walletAddress.toLowerCase(),
        chainType,
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });
      await this.userRepository.save(user);
    }

    const session = await this.sessionRepository.save({
      userId: user.id,
      refreshTokenHash: '',
      isActive: true,
      lastActive: new Date(),
      deviceInfo,
    });

    const result = await this.generateTokens(user, session);

    return result;
  }

  async refresh(refreshTokenDto: RefreshTokenBodyDto) {
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        refreshTokenDto.refreshToken,
        { secret: this.REFRESH_TOKEN_SECRET, ignoreExpiration: false },
      );
      const user = await this.userRepository.findOne({
        where: { id: decoded.id },
      });
      if (!user) {
        throw AuthErrors.userNotFound(decoded.id);
      }
      const session = await this.sessionRepository.findOne({
        where: { id: decoded.sessionId, isActive: true },
      });
      if (!session) {
        throw AuthErrors.sessionInvalid(decoded.sessionId);
      }
      // TODO: Detect new device
      const isRefreshTokenValid = await bcrypt.compare(
        refreshTokenDto.refreshToken.split('.')[2], // signature
        session.refreshTokenHash,
      );
      if (!isRefreshTokenValid) {
        this.logger.warn(
          `Replay attack detected for user ${user.id} and session ${decoded.sessionId}`,
        );
        await this.sessionRepository.deactivateAllUserSessions(user.id);
        throw AuthErrors.replayRefreshToken(decoded.sessionId);
      }

      const result = await this.generateTokens(user, session);
      await this.redis.del(accessTokenPayloadExpiredKey(user.id)); // clear cache

      return result;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw AuthErrors.invalidRefreshToken();
      }
      throw error;
    }
  }

  private async generateTokens(user: UserEntity, session: SessionEntity) {
    const accessTokenPayload: JwtPayload = {
      id: user.id,
      role: user.role,
      walletAddress: user.walletAddress,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.ACCESS_TOKEN_SECRET,
      expiresIn: `${this.ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS}s`,
    });

    const refreshTokenPayload: RefreshTokenPayload = {
      id: user.id,
      sessionId: session.id,
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.REFRESH_TOKEN_SECRET,
      expiresIn: `${this.REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS}s`,
    });
    session.lastActive = new Date();
    // bcrypt only uses the first 72 bytes of the input string.
    // so we need to use the signature of the refresh token
    session.refreshTokenHash = await bcrypt.hash(
      refreshToken.split('.')[2],
      10,
    );
    await this.sessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
      profile: accessTokenPayload,
      accessTokenExpiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS,
      refreshTokenExpiresIn: this.REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS,
    };
  }

  private generateMessage(nonce: string) {
    return `Login to XXX \n\nNonce: ${nonce}`;
  }
}
