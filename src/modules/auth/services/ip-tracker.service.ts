import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis/dist/redis.decorators';
import Redis from 'ioredis';

@Injectable()
export class IpTrackerService {
  private readonly logger = new Logger(IpTrackerService.name);
  private readonly SUSPICIOUS_THRESHOLD = 12000;
  private readonly BLOCK_DURATION_IN_SECONDS = 300;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async trackRequest(ip: string, endpoint: string): Promise<void> {
    const key = `ip:${ip}:${endpoint}`;
    const blockKey = `blocked:${ip}`;

    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked) {
      this.logger.warn(`Blocked IP ${ip} attempted to access ${endpoint}`);
      return;
    }

    const count = await this.redis.incr(key);
    await this.redis.expire(key, 60); // Reset after 1 minute

    if (count >= this.SUSPICIOUS_THRESHOLD) {
      this.logger.warn(
        `Suspicious activity detected from IP ${ip} on ${endpoint} - ${count} requests`,
      );

      await this.redis.setex(blockKey, this.BLOCK_DURATION_IN_SECONDS, '1');
      this.logger.warn(
        `IP ${ip} has been blocked for ${this.BLOCK_DURATION_IN_SECONDS} seconds. Redis key: ${blockKey}`,
      );
    }

    if (count > this.SUSPICIOUS_THRESHOLD * 0.8) {
      this.logger.debug(
        `High request count from IP ${ip} on ${endpoint} - ${count} requests`,
      );
    }
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    const blockKey = `blocked:${ip}`;
    return !!(await this.redis.get(blockKey));
  }

  async getRequestCount(ip: string, endpoint: string): Promise<number> {
    const key = `ip:${ip}:${endpoint}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }
}
