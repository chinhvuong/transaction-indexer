import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EnvConfig } from '@/shared/configs/env.config';

import { JwtPayload } from '../types';
import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import Redis from 'ioredis';
import { accessTokenPayloadExpiredKey } from '../constants/cache';
import { AuthErrors } from '../errors/auth.errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvConfig>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: String(configService.get<string>('ACCESS_TOKEN_SECRET')),
    });
  }

  async validate(payload: JwtPayload) {
    const key = accessTokenPayloadExpiredKey(payload.id);
    const isExpired = await this.redis.get(key);
    if (isExpired) {
      // role, permissions has been changed or user has been deleted
      throw AuthErrors.invalidCredentials();
    }
    return payload;
  }
}
