import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('staking_history')
export class StakingHistory {
  @ApiProperty({ example: 1, description: '' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'staking id' })
  @Column({ name: 'staking_id' })
  stakingId: number;

  @ApiProperty({ example: 2, description: '' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty()
  @Column({ name: 'nft_id' })
  nftId: number;

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