import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/shared/base/base.entity';

export enum TRANSACTION_OPERATION {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export enum TRANSACTION_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

@Entity('transactions')
@Index(['transactionHash'], { unique: true })
@Index(['address'])
@Index(['operation'])
@Index(['tokenAddress'])
@Index(['contractAddress'])
export class TransactionEntity extends BaseEntity {
  @Column({ name: 'address', type: 'varchar', length: 42 })
  address: string;

  @Column({
    name: 'amount',
    type: 'numeric',
    precision: 65,
    scale: 18,
    default: '0',
  })
  amount: string; // divided by decimals

  @Column({
    name: 'raw_amount',
    type: 'numeric',
    precision: 78, // 2^256 -1 ~ 10^77
    scale: 0,
    default: '0',
  })
  rawAmount: string; // not divided by decimals yet

  @Column({
    name: 'operation',
    type: 'enum',
    enum: TRANSACTION_OPERATION,
  })
  operation: TRANSACTION_OPERATION;

  @Column({ name: 'transaction_hash', type: 'varchar', length: 66 })
  transactionHash: string;

  @Column({ name: 'chain_id', type: 'varchar', length: 50 })
  chainId: string;

  @Column({ name: 'block_number', type: 'bigint' })
  blockNumber: number;

  @Column({ name: 'block_time', type: 'bigint' })
  blockTime: number;

  @Column({ name: 'block_hash', type: 'varchar', length: 66 })
  blockHash: string;

  @Column({
    name: 'token_address',
    type: 'varchar',
    length: 42,
    nullable: true,
  })
  tokenAddress: string;

  @Column({ name: 'token_decimals', type: 'integer', default: 18 })
  tokenDecimals: number;

  @Column({
    name: 'contract_address',
    type: 'varchar',
    length: 42,
    nullable: true,
  })
  contractAddress: string;

  @Column({ name: 'confirmations', type: 'integer', default: 0 })
  confirmations: number;

  @Column({ name: 'require_confirmations', type: 'integer', default: 12 })
  requireConfirmations: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: TRANSACTION_STATUS,
    default: TRANSACTION_STATUS.PENDING,
  })
  status: TRANSACTION_STATUS;
}
