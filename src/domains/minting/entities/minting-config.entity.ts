import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('minting_config')
export class MintingConfig {
  @ApiProperty({ example: 1, description: 'The unique identifier of the minting configuration' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 100, description: 'The token price' })
  //@Column('decimal', { precision: 18, scale: 8 })
  @Column({ name: 'token_price' })
  tokenPrice: string;

  @ApiProperty({ example: 1000, description: 'The NFT sale amount' })
  //@Column('decimal', { precision: 18, scale: 8 })
  @Column({ name: 'nft_sale_amount' })
  nftSaleAmount: number;

  @ApiProperty({ example: true, description: 'Whether minting is active' })
  @Column({ name: 'is_minting_active', default: false })
  isMintingActive: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Last update time of the configuration' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}