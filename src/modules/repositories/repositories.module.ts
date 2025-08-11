import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/modules/users/entities/user.entity';
import { SessionEntity } from '@/modules/users/entities/session.entity';
import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';

import { UserRepository } from '@/modules/repositories/repositories/user.repository';
import { SessionRepository } from '@/modules/repositories/repositories/session.repository';
import { TransactionRepository } from '@/modules/repositories/repositories/transaction.repository';

const providers = [UserRepository, SessionRepository, TransactionRepository];
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SessionEntity, TransactionEntity]),
  ],
  providers,
  exports: providers,
})
export class RepositoriesModule {}
