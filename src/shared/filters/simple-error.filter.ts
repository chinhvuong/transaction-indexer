import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-errors';

@Catch(AppError)
export class SimpleErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(SimpleErrorFilter.name);

  catch(exception: AppError<any>, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    this.logger.debug(
      `[${exception.statusCode}] ${exception.errorCode} - ${exception.message} | ${request.method} ${request.url}`,
      exception.stack,
    );

    const errorResponse = {
      success: false,
      error: {
        code: exception.errorCode,
        message: exception.message,
        statusCode: exception.statusCode,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    return response.status(exception.statusCode).send(errorResponse);
  }
}

// Usage in main.ts:
// app.useGlobalFilters(new SimpleErrorFilter());
