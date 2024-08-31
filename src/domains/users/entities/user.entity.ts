import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'password123', description: 'The hashed password of the user' })
  @Column()
  password: string;

  @ApiProperty({ example: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', description: 'The wallet address of the user' })
  @Column({ name: 'wallet_address' })
  walletAddress: string;

  @ApiProperty({ example: false, description: 'Whether the user is an admin or not' })
  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The creation date of the user' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The last update date of the user' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}