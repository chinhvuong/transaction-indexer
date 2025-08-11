import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): FastifyRequest {
    return context.switchToHttp().getRequest();
  }
}
