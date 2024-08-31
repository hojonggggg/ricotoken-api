import { ApiProperty } from '@nestjs/swagger';

export class StakingListDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nftId: number;

  @ApiProperty()
  txHash: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  fiat: string;

  @ApiProperty()
  walletAddress: string;
}