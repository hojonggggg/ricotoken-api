import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mintings')
export class Minting {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @Column()
  amount: number;
  
  @Column()
  fiat: string;

  @Column()
  price: string;

  @Column({ name: 'tx_hash' })
  txHash: string;
  
  @Column()
  status: string;
}