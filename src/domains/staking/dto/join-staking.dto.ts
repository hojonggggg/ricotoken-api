import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class JoinStakingDto {  
  @ApiProperty({ example: '1', description: 'NFT Token ID' })
  @IsNumber()
  nftId: number;

  @ApiProperty({ example: '0x123', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;

  userId: number;
  walletAddress: string;
}