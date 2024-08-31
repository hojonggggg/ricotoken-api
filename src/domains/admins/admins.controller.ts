import { Controller, Get, Post, Delete, Body, Param, UseGuards, Ip, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminIpGuard } from './guards/admin-ip.guard';
import { AdminsService } from './admins.service';
import { AllowedIp } from './entities/allowed-ip.entity';
import { AdminLog } from './entities/admin-log.entity';
import { CreateAllowedIpDto } from './dto/create-allowed-ip.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, AdminIpGuard)
@ApiBearerAuth()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('allowed-ips')
  @ApiOperation({ summary: '모든 허용된 IP 조회' })
  @ApiResponse({ status: 200, description: '모든 허용된 IP 반환', type: [AllowedIp] })
  async getAllAllowedIps(): Promise<AllowedIp[]> {
    return this.adminsService.getAllAllowedIps();
  }

  @Post('allowed-ips')
  @ApiOperation({ summary: '새로운 허용 IP 추가' })
  @ApiResponse({ status: 201, description: '허용 IP가 성공적으로 추가됨', type: AllowedIp })
  async addAllowedIp(
    @Body() createAllowedIpDto: CreateAllowedIpDto, 
    @Ip() ip: string,
    @Request() req
  ): Promise<AllowedIp> {
    const userId = req.user.userId;
    return this.adminsService.addAllowedIp(userId, createAllowedIpDto.ip, ip);
  }

  @Delete('allowed-ips/:id')
  @ApiOperation({ summary: '허용 IP 삭제' })
  @ApiResponse({ status: 200, description: '허용 IP가 성공적으로 삭제됨' })
  async removeAllowedIp(
    @Param('id') id: number, 
    @Ip() ip: string,
    @Request() req
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.adminsService.removeAllowedIp(userId, id, ip);
    return { message: 'Allowed IP successfully deleted' };
  }

  @Get('allowed-ips/:ip')
  @ApiOperation({ summary: '특정 IP의 허용 여부 확인' })
  @ApiResponse({ status: 200, description: 'IP의 허용 여부 반환', type: Boolean })
  async isAllowedIp(@Param('ip') ip: string): Promise<boolean> {
    return this.adminsService.isAllowedIp(ip);
  }

  @Get('logs')
  @ApiOperation({ summary: '관리자 로그 조회' })
  @ApiResponse({ status: 200, description: '관리자 로그 반환', type: [AdminLog] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAdminLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<PaginationResponseDto> {
    return this.adminsService.getAdminLogs(page, limit);
  }
}