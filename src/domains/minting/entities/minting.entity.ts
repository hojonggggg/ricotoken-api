import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mintings')
export class Minting {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column({ name: 'nft_id' })
  nftId: number;

  @Column({ name: 'tx_hash' })
  txHash: string;
  
  @Column()
  fiat: string;

  @Column('decimal', { precision: 18, scale: 5 })
  balance: number;
  
  @Column()
  status: string;
}