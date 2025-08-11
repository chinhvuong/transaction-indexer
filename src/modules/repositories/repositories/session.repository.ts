import { Injectable } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import { SessionEntity } from '@/modules/users/entities/session.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SessionRepository extends AbstractRepository<SessionEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(SessionEntity, dataSource);
  }

  async findActiveSession(
    sessionId: string,
    userId: string,
  ): Promise<SessionEntity | null> {
    return this.findOne({
      where: {
        id: sessionId,
        userId,
        isActive: true,
      },
    });
  }

  async findActiveSessionsByUserId(userId: string): Promise<SessionEntity[]> {
    return this.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        lastActive: 'DESC',
      },
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.update(sessionId, { isActive: false });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.update({ userId, isActive: true }, { isActive: false });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    await this.update(sessionId, { lastActive: new Date() });
  }

  async cleanExpiredSessions(expirationDate: Date): Promise<void> {
    await this.delete({
      lastActive: LessThan(expirationDate),
      isActive: false,
    });
  }
}
