import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from '@/app.module';
import { configSwagger } from '@/shared/configs/api-doc.config';
import { configCors } from './shared/configs/cors.config';
import { SimpleErrorFilter } from '@/shared/filters/simple-error.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new SimpleErrorFilter());

  configCors(app);
  configSwagger(app);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
