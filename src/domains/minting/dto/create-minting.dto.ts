import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMintingStep1Dto {
  /*
  @ApiProperty({ example: '0x123', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;
    
  @ApiProperty({ example: 1, description: '구매 수량' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'RICO', description: '구매 자산 유형' })
  @IsString()
  fiat: string;
    
  @ApiProperty({ example: '25000000000000000000000', description: '구매 가격' })
  @IsString()
  price: string;

  userId: number;
  walletAddress: string;
  */
  @ApiProperty({ example: 1, description: '구매 수량' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'RICO', description: '구매 자산 유형' })
  @IsString()
  fiat: string;
}

export class CreateMintingStep2Dto {
  @ApiProperty({ example: 1, description: '민팅 id' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: '0x386b2f05e275f45788ff013b5e40f846ea7f522c8d3bced6d3b9738351dc67f2', description: '트랜잭션 해시' })
  @IsString()
  txHash: string;
}