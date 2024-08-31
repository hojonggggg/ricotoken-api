import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'newPassword123', 
    description: 'The new password of the user',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}