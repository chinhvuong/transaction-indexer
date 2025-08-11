import { Module } from '@nestjs/common';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
