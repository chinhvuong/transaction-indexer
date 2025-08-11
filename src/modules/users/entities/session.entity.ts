import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/shared/base/base.entity';
import { UserEntity } from './user.entity';

@Entity('sessions')
export class SessionEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  refreshTokenHash: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
    fingerprint?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
