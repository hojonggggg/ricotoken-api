import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMintingDto {
  /*
  @ApiProperty({ example: '0x4F7855Dec6168703Dd2c964e5C33A18CA2230a3C', description: '사용자 지갑 주소' })
  @IsString()
  walletAddress: string;
  */
  /*
  @ApiProperty({ example: 123, description: 'NFT 토큰 ID' })
  @IsNumber()
  nftId: number;
  */
    
  @ApiProperty({ example: '0x123', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;

  @ApiProperty({ example: 'RICO', description: '구매 자산 유형' })
  @IsString()
  fiat: string;
    
  @ApiProperty({ example: '25000000000000000000000', description: '구매 가격' })
  @IsString()
  balance: string;
    
  @ApiProperty({ example: 1, description: '구매 수량' })
  @IsNumber()
  amount: number;

  userId: number;
  walletAddress: string;
}