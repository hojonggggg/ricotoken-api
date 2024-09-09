import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CancelStakingDto {  
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ example: '0x386b2f05e275f45788ff013b5e40f846ea7f522c8d3bced6d3b9738351dc67f2', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;
}