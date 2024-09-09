import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStakingConfigDto {
  @ApiProperty({ example: 5, description: 'The reward amount for staking' })
  @IsNumber()
  @Min(0)
  rewardAmount: number;

  @ApiProperty({ example: 5, description: 'The fee for claim' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  claimFee: number;
}