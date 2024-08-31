import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stakings')
export class Staking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'nft_id' })
  nftId: number;

  @Column({ name: 'tx_hash' })
  txHash: string;

  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column()
  status: string;
}