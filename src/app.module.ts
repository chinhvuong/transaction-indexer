import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configDatabase } from '@/shared/configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvConfig, validate } from '@/shared/configs/env.config';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    // system modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => configDatabase,
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        type: 'single',
        url: configService.get('REDIS_URL'),
      }),
    }),
    // feature modules
    AuthModule,
    UsersModule,
    RepositoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
