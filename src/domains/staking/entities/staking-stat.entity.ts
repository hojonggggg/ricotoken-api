import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('staking_stat')
export class StakingStat {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'rico_price' })
  ricoPrice: string;

  @ApiProperty()
  @Column({ name: 'nri_price' })
  nriPrice: string;

  @ApiProperty()
  @Column({ name: 'total_supply' })
  totalSupply: string;
}