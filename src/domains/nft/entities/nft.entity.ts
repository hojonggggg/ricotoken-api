import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('nfts')
export class Nft {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ name: 'token_id' })
  tokenId: number;
  
  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'minting_id' })
  mintingId: number;

  @Column({ name: 'tx_hash' })
  txHash: string;
  
  @Column()
  status: string;
}