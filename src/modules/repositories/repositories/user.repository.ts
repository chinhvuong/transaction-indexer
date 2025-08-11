import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import {
  UserEntity,
  USER_ROLE,
  USER_STATUS,
} from '@/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends AbstractRepository<UserEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserEntity, dataSource);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { id },
      select: ['id', 'chainType', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async findActiveUsers(): Promise<UserEntity[]> {
    return this.find({
      where: { status: USER_STATUS.ACTIVE },
      select: ['id', 'chainType', 'status', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUsersWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[UserEntity[], number]> {
    return this.findAndCount({
      select: ['id', 'chainType', 'status', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async searchUsers(searchTerm: string): Promise<UserEntity[]> {
    return this.createQueryBuilder('user')
      .where('user.email ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('user.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('user.username ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.name',
        'user.role',
        'user.avatar',
        'user.status',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async updateUserStatus(id: string, status: USER_STATUS): Promise<void> {
    await this.update(id, { status });
  }

  async updateUserRole(id: string, role: USER_ROLE): Promise<void> {
    await this.update(id, { role });
  }

  async findByWalletAddress(walletAddress: string): Promise<UserEntity | null> {
    return this.findOne({
      where: { walletAddress: walletAddress.toLowerCase() },
      select: [
        'walletAddress',
        'chainType',
        'id',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }
}
