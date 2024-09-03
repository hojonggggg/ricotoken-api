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
import { CancelStakingDto } from './dto/cancel-staking.dto';
import { ClaimStakingDto } from './dto/claim-staking.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';

@ApiTags('staking')
@Controller()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get('staking/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 중인 NFT 개수' })
  @ApiResponse({ status: 200 })
  async getBalance(@Request() req): Promise<{ stakingBalance: number }> {
    const { userId } = req.user;
    const balance = await this.stakingService.getBalance(userId);
    return { stakingBalance: balance };
  }

  @Get('staking/stats')
  @ApiOperation({ summary: 'Stats 조회' })
  @ApiResponse({ status: 200, description: 'Stats 반환', type: [StakingStat] })
  async getStats(): Promise<any> {
    return await this.stakingService.getStats();
  }

  @Get('staking/historys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '히스토리 전체 조회' })
  @ApiResponse({ status: 200, description: '히스토리 반환', type: [StakingHistory] })
  async getHistorys(@Query() paginationQuery: PaginationQueryDto, @Request() req): Promise<PaginationResponseDto> {
    const userId = req.user.userId;
    return await this.stakingService.getHistorys(userId, paginationQuery);
  }

  @Get('staking/history/:nftId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '히스토리 조회' })
  @ApiResponse({ status: 200, type: [StakingHistory] })
  async getHistory(@Param('nftId') nftId: number, @Query() paginationQuery: PaginationQueryDto, @Request() req): Promise<PaginationResponseDto> {
    const { userId } = req.user;
    return await this.stakingService.getHistory(userId, nftId, paginationQuery);
  }

  @Get('stakings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 전체 조회' })
  @ApiResponse({ status: 200, type: [Staking] })
  async findAllFromUser(@Query() paginationQuery: PaginationQueryDto, @Request() req) {
    const { userId, walletAddress } = req.user;
    return await this.stakingService.findAllFromUser(userId, walletAddress, paginationQuery);
  }

  @Get('staking/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 조회' })
  @ApiResponse({ status: 200, type: [Staking] })
  async find(@Param('id') id: number, @Request() req) {
    const { userId, walletAddress } = req.user;
    return await this.stakingService.find(id, userId);
  }

  @Post('staking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 참여' })
  @ApiResponse({ status: 200, type: [Staking] })
  async join(@Body() joinStakingDto: JoinStakingDto, @Request() req) {
    const { userId, walletAddress } = req.user;
    return await this.stakingService.join(userId, walletAddress, joinStakingDto);
  }

  @Patch('staking/claims')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '보상 전체 수령' })
  @ApiResponse({ status: 200 })
  async claims(@Body() claimStakingDto: ClaimStakingDto, @Request() req) {
    const { userId } = req.user;
    await this.stakingService.claims(userId, claimStakingDto);
    return { message: 'SUCCESS' };
  }

  @Patch('staking/claim/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '보상 개별 수령' })
  @ApiResponse({ status: 200 })
  async claim(@Param('id') id: number, @Body() claimStakingDto: ClaimStakingDto, @Request() req) {
    const { userId } = req.user;
    await this.stakingService.claim(userId, id, claimStakingDto);
    return { message: 'SUCCESS' };
  }

  @Patch('staking/unstakeds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 전체 해지' })
  @ApiResponse({ status: 200 })
  async cancels(@Body() canelStakingDto: CancelStakingDto, @Request() req) {
    const userId = req.user.userId;
    await this.stakingService.cancel(userId, canelStakingDto);
    return { message: 'Staking successfully unstaked' };
  }

  @Patch('staking/unstaked/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '스테이킹 개별 해지' })
  @ApiResponse({ status: 200 })
  async cancel(@Body() canelStakingDto: CancelStakingDto, @Request() req) {
    const userId = req.user.userId;
    await this.stakingService.cancel(userId, canelStakingDto);
    return { message: 'Staking successfully unstaked' };
  }
}