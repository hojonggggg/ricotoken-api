import { ApiProperty } from '@nestjs/swagger';
import { AdminLog } from '../entities/admin-log.entity';

export class PaginationResponseDto {
  @ApiProperty({ type: [AdminLog] })
  logs: AdminLog[];

  @ApiProperty({ example: 100, description: '전체 로그 수' })
  total: number;
}