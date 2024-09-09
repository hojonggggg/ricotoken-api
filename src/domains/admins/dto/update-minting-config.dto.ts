import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateMintingConfigDto {
  @ApiProperty({ example: 100, description: 'The token price' })
  @IsString()
  usdtPrice: string;

  @ApiProperty({ example: 1000, description: 'The NFT sale amount' })
  @IsNumber()
  @Min(0)
  nftPriceAmount: number;

  @ApiProperty({ example: true, description: 'Whether minting is active' })
  @IsBoolean()
  isMintingActive: boolean;
}