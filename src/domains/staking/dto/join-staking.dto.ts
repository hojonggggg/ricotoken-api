import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class JoinStakingDto {
  @ApiProperty({ example: '0x4F7855Dec6168703Dd2c964e5C33A18CA2230a3C', description: '사용자 지갑 주소' })
  @IsString()
  walletAddress: string;
    
  @ApiProperty({ example: '1', description: 'NFT Token ID' })
  @IsNumber()
  nftId: number;
}