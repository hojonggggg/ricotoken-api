import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  action: string;

  @Column()
  memo: string;

  @Column()
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}