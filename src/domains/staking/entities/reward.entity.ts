import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  //@ApiProperty({ example: 5, description: 'The reward amount for staking' })
  @Column('decimal', { precision: 18, scale: 5 })
  reward: number;

  //@ApiProperty()
  @Column({ name: 'created_at' })
  createdAt: Date;
}