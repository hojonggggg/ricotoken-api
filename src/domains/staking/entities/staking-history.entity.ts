import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('staking_history')
export class StakingHistory {
  @ApiProperty({ example: 1, description: '' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 2, description: '' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: 'staking or claim table id' })
  @Column({ name: 'action_id' })
  actionId: number;

  @ApiProperty({ description: 'Staked OR Unstaked OR Claim' })
  @Column()
  action: string;

  @ApiProperty()
  @Column()
  amount: string;

  @ApiProperty()
  @Column({ name: 'tx_hash' })
  txHash: string;
}