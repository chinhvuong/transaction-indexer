import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { IpTrackerMiddleware } from './middlewares/ip-tracker.middleware';
import { IpTrackerService } from './services/ip-tracker.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    RepositoriesModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, IpTrackerService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpTrackerMiddleware).forRoutes('*');
  }
}
