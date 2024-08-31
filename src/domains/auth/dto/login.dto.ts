import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { LoginType } from '../enums/login-type.enum';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'admin OR user',
    enum: LoginType,
    enumName: 'LoginType',
  })
  @IsEnum(LoginType, { message: 'Type must be either admin or user' })
  type: LoginType;

  @ApiProperty({ example: 'admin@test.com', description: '관리자 이메일' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test123', description: '관리자 비밀번호' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '0x4F7855Dec6168703Dd2c964e5C33A18CA2230a3C',
    description: '사용자 지갑 주소',
  })
  @IsOptional()
  @IsString()
  walletAddress: string;
}
