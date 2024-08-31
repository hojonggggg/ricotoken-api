import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('allowed_ips')
export class AllowedIp {
  @ApiProperty({ example: 1, description: '허용된 IP의 고유 식별자' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: '이 IP와 연관된 사용자의 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ example: '192.168.1.1', description: '허용된 IP 주소' })
  @Column()
  ip: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: '허용된 IP 등록 일시' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: '허용된 IP 정보 최종 수정 일시' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}