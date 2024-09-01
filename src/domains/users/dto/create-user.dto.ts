import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', 
    description: 'The wallet address of the user', 
    required: false 
  })
  @IsOptional()
  @IsString()
  walletAddress: string;

  @ApiProperty({ example: false, description: 'Whether the user is an admin or not', required: false })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}