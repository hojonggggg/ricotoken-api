import { Controller, Get, Post, Put, Body, UseGuards, Ip, Request, Query, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';
import { AdminIpGuard } from '../admins/guards/admin-ip.guard';
import { AdminRoute } from 'src/commons/decorators/admin-route.decorator';
import { StakingService } from './staking.service';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateStakingConfigDto } from './dto/update-staking-config.dto';
import { JoinStakingDto } from './dto/join-staking.dto';

@ApiTags('staking')
@Controller('staking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get('config')
  @UseGuards(IsAdminGuard, AdminIpGuard)
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 스테이킹 설정 정보 조회' })
  @ApiResponse({ status: 200, type: StakingConfig })
  async getStakingConfig(): Promise<StakingConfig> {
    return this.stakingService.getStakingConfig();
  }

  @Put('config')
  @UseGuards(IsAdminGuard, AdminIpGuard)
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 스테이킹 설정 정보 수정' })
  @ApiResponse({ status: 200, type: StakingConfig })
  async updateStakingConfig(
    @Body() updateDto: UpdateStakingConfigDto, 
    @Ip() ip: string,
    @Request() req
  ): Promise<StakingConfig> {
    const userId = req.user.userId;
    return this.stakingService.updateStakingConfig(userId, updateDto, ip);
  }

  @Get('all')
  @UseGuards(IsAdminGuard, AdminIpGuard)
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 스테이킹 목록 조회' })
  @ApiResponse({ status: 200, type: [Staking] })
  async findAllFromAdmin(@Query() paginationQuery: PaginationQueryDto) {
    return this.stakingService.findAllFromAdmin();
  }

  @Post('join')
  @ApiOperation({ summary: '[USER] 스테이킹 참여' })
  @ApiResponse({ status: 200, type: [Staking] })
  async join(@Body() joinStakingDto: JoinStakingDto, @Request() req) {
    const userId = req.user.userId;
    return this.stakingService.join(userId, joinStakingDto);
  }

  @Get()
  @ApiOperation({ summary: '[USER] 스테이킹 참여 내역 조회' })
  @ApiResponse({ status: 200, type: [Staking] })
  async findAllFromUser(@Query() paginationQuery: PaginationQueryDto, @Request() req) {
    const userId = req.user.userId;
    return this.stakingService.findAllFromUser(userId, paginationQuery);
  }

  @Patch('cancel/:id')
  @ApiOperation({ summary: '[USER] 스테이킹 해지' })
  @ApiResponse({ status: 200 })
  async cancel(@Param('id') id: number, @Request() req) {
    const userId = req.user.userId;
    await this.stakingService.cancel(id, userId);
    return { message: 'Staking successfully canceled' };
  }


}