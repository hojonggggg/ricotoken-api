import { Controller, Get, Put, Body, UseGuards, Query, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MintingService } from './minting.service';
import { MintingConfig } from './entities/minting-config.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';
import { Minting } from './entities/minting.entity';
import { CreateMintingDto } from './dto/create-minting.dto';

@ApiTags('minting')
@Controller('minting')
export class MintingController {
  constructor(private readonly mintingService: MintingService) {}
  /*
  @Get('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard, AdminIpGuard)
  @ApiBearerAuth()
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 설정 정보 조회' })
  @ApiResponse({ status: 200, description: 'Returns the current minting configuration', type: MintingConfig })
  async getMintingConfig(): Promise<MintingConfig> {
    return this.mintingService.getMintingConfig();
  }

  @Put('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard, AdminIpGuard)
  @ApiBearerAuth()
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 설정 정보 수정' })
  @ApiResponse({ status: 200, description: 'The minting configuration has been successfully updated', type: MintingConfig })
  async updateMintingConfig(@Body() updateDto: UpdateMintingConfigDto): Promise<MintingConfig> {
    return this.mintingService.updateMintingConfig(updateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard, AdminIpGuard)
  @ApiBearerAuth()
  @AdminRoute()
  @ApiOperation({ summary: '[ADMIN] 민팅 목록 조회' })
  @ApiResponse({ status: 200, description: 'Return all stakings.', type: [Minting] })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.mintingService.findAll();
  }
  */

  @Get('minting-active')
  @ApiOperation({ summary: 'NFT 판매 상태' })
  @ApiResponse({ status: 200, type: MintingConfig }) 
  async getMintingActive() {
    const config = await this.mintingService.getMintingConfig();
    return { isActive: config.isMintingActive }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '민팅' })
  @ApiResponse({ status: 200, type: [Minting] })
  async minting(@Body() createMintingDto: CreateMintingDto, @Request() req) {
    const { userId, walletAddress } = req.user;
    createMintingDto.userId = userId;
    createMintingDto.walletAddress = walletAddress;
    return this.mintingService.minting(createMintingDto);
  }
}