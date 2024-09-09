import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('staking_config')
export class StakingConfig {
  @ApiProperty({ example: 1, description: 'The unique identifier of the staking configuration' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 5, description: 'The reward amount for staking' })
  @Column('decimal', { precision: 18, scale: 5, name: 'reward_amount' })
  rewardAmount: number;

  @ApiProperty()
  @Column({ name: 'claim_fee'})
  claimFee: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Last update time of the configuration' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}