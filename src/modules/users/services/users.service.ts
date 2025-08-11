import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/shared/base/abstract.service';
import { UserEntity, USER_ROLE, USER_STATUS } from '@/modules/users/types';
import { UserRepository } from '@/modules/repositories/repositories/user.repository';

@Injectable()
export class UsersService extends AbstractService<UserEntity> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.userRepository.findActiveUsers();
  }

  async findUsersWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[UserEntity[], number]> {
    return this.userRepository.findUsersWithPagination(page, limit);
  }

  async searchUsers(searchTerm: string): Promise<UserEntity[]> {
    return this.userRepository.searchUsers(searchTerm);
  }

  async updateUserStatus(id: string, status: USER_STATUS): Promise<void> {
    await this.userRepository.updateUserStatus(id, status);
  }

  async updateUserRole(id: string, role: USER_ROLE): Promise<void> {
    await this.userRepository.updateUserRole(id, role);
  }
}
