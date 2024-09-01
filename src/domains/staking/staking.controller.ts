import { Controller, Get, Post, Put, Body, UseGuards, Ip, Request, Query, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';
import { AdminIpGuard } from '../admins/guards/admin-ip.guard';
import { AdminRoute } from 'src/commons/decorators/admin-route.decorator';
import { StakingService } from './staking.service';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateStakingConfigDto } from './dto/update-staking-config.dto';
import { JoinStakingDto } from './dto/join-staking.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';

@ApiTags('staking')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Post('staking')
  @ApiOperation({ summary: '스테이킹 참여' })
  @ApiResponse({ status: 200, type: [Staking] })
  async join(@Body() joinStakingDto: JoinStakingDto, @Request() req) {
    const { userId, walletAddress } = req.user;
    joinStakingDto.userId = userId;
    joinStakingDto.walletAddress = walletAddress;
    return this.stakingService.join(joinStakingDto);
  }

  @Get('stakings/:walletAddress')
  @ApiOperation({ summary: '스테이킹 참여 내역 조회' })
  @ApiResponse({ status: 200, type: [Staking] })
  async findAllFromUser(@Param('walletAddress') walletAddress: string, @Query() paginationQuery: PaginationQueryDto, @Request() req) {
    console.log(walletAddress);
    console.log(req.user.walletAddress);
    if (walletAddress != req.user.walletAddress) {
      throw new UnauthorizedException('Access denied from this wallet address');
    }
    const userId = req.user.userId;
    return this.stakingService.findAllFromUser(userId, walletAddress, paginationQuery);
  }

  @Patch('staking/unstaked/:id')
  @ApiOperation({ summary: '스테이킹 해지' })
  @ApiResponse({ status: 200 })
  async cancel(@Param('id') id: number, @Request() req) {
    const userId = req.user.userId;
    await this.stakingService.cancel(id, userId);
    return { message: 'Staking successfully unstaked' };
  }
  /*
  @Get('staking/reward')
  @ApiOperation({ summary: '스테이킹 일일 보상량' })
  @ApiResponse({ status: 200, type: [StakingConfig] })
  async getDailyReward() {
    const config = await this.stakingService.getStakingConfig();
    return { dailyReward: config.rewardAmount }
  }
  */

  @Get('staking/stats')
  @ApiOperation({ summary: 'Stats 조회' })
  @ApiResponse({ status: 200, description: 'Stats 반환', type: [StakingStat] })
  async getStats(): Promise<any> {
    return this.stakingService.getStats();
  }

  @Get('staking/historys')
  @ApiOperation({ summary: '히스토리 조회' })
  @ApiResponse({ status: 200, description: '히스토리 반환', type: [StakingHistory] })
  async getHistorys(@Query() paginationQuery: PaginationQueryDto, @Request() req): Promise<PaginationResponseDto> {
    const userId = req.user.userId;
    return this.stakingService.getHistorys(userId, paginationQuery);
  }
}