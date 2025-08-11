import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/shared/base/base.entity';
import { SessionEntity } from './session.entity';

export enum USER_ROLE {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum CHAIN_TYPE {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  walletAddress: string;

  @Column({ type: 'varchar', length: 50 })
  chainType: CHAIN_TYPE;

  @Column({
    type: 'enum',
    enum: USER_ROLE,
    default: USER_ROLE.USER,
  })
  role: USER_ROLE;

  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.ACTIVE,
  })
  status: USER_STATUS;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;
  // Relations
  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];
}
