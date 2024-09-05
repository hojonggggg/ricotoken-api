import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column()
  balance: string;

  @Column({ name: 'tx_hash' })
  txHash: string;
  
  @Column()
  status: string;
  
  @Column()
  memo: string;
}