import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('nfts')
export class Nft {
  @PrimaryGeneratedColumn()
  uid: number;
  
  @Column({ name: 'nft_id' })
  nftId: number;
  
  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'minting_id' })
  mintingId: number;

  @Column({ name: 'tx_hash' })
  txHash: string;
  
  @Column()
  status: string;

  @Column({ name: 'wallet_address' })
  walletAddress: string;
}