import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateStakingConfigDto {
  @ApiProperty({ example: 5, description: 'The reward amount for staking' })
  @IsNumber()
  @Min(0)
  rewardAmount: number;
}