import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

import { IpTrackerService } from '../services/ip-tracker.service';

@Injectable()
export class IpTrackerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IpTrackerMiddleware.name);

  constructor(private readonly ipTrackerService: IpTrackerService) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const ip =
      req.headers['x-real-ip']?.toString() ||
      req.ips?.join(',') ||
      req.socket.remoteAddress ||
      'unknown';
    this.logger.log(`IP: ${ip} - Endpoint: ${req.originalUrl}`);
    const endpoint = req.url;

    const isBlocked = await this.ipTrackerService.isIpBlocked(ip);
    if (isBlocked) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.ipTrackerService.trackRequest(ip, endpoint);
    next();
  }
}
