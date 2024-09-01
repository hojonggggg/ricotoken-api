import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ClaimStakingDto {  
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ example: '0x123', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;
}