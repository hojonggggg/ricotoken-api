import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';
import { AdminIpGuard } from '../admins/guards/admin-ip.guard';
import { AdminRoute } from 'src/commons/decorators/admin-route.decorator';
import { MintingService } from './minting.service';
import { MintingConfig } from './entities/minting-config.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';
import { Minting } from './entities/minting.entity';

@ApiTags('minting')
@Controller('minting')
@UseGuards(JwtAuthGuard, IsAdminGuard, AdminIpGuard)
@ApiBearerAuth()
export class MintingController {
  constructor(private readonly mintingService: MintingService) {}

  @Get('config')
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 설정 정보 조회' })
  @ApiResponse({ status: 200, description: 'Returns the current minting configuration', type: MintingConfig })
  async getMintingConfig(): Promise<MintingConfig> {
    return this.mintingService.getMintingConfig();
  }

  @Put('config')
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 설정 정보 수정' })
  @ApiResponse({ status: 200, description: 'The minting configuration has been successfully updated', type: MintingConfig })
  async updateMintingConfig(@Body() updateDto: UpdateMintingConfigDto): Promise<MintingConfig> {
    return this.mintingService.updateMintingConfig(updateDto);
  }

  @Get()
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 목록 조회' })
  @ApiResponse({ status: 200, description: 'Return all stakings.', type: [Minting] })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.mintingService.findAll();
  }
}