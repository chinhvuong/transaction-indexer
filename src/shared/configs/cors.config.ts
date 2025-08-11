import { INestApplication } from '@nestjs/common';

const whiteList = [
  'http://localhost:3000',
  // TODO: Add production domains
];

export function configCors(app: INestApplication) {
  app.enableCors({
    origin: whiteList,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
}
