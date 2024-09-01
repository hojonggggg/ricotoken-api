import { ApiProperty } from '@nestjs/swagger';
import { StakingHistory } from '../entities/staking-history.entity';

export class PaginationResponseDto {
  @ApiProperty({ type: [StakingHistory] })
  logs: StakingHistory[];

  @ApiProperty({ example: 100, description: '전체 로그 수' })
  total: number;
}