import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class JoinStakingDto {  
  @ApiProperty({ example: '1', description: 'NFT Token ID' })
  @IsNumber()
  nftId: number;

  @ApiProperty({ example: '0x6a15801095127f7f6d129dbf29c5676cbd023b0e4c3304d97d3db20d9463bea9', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;
}