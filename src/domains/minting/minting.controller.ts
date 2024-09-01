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

  @Get('is-active')
  @ApiOperation({ summary: 'NFT 판매 상태' })
  @ApiResponse({ status: 200, type: MintingConfig }) 
  async getIsActive() {
    const config = await this.mintingService.getMintingConfig();
    return { isActive: config.isMintingActive }
  }
  
  @Get('remaining-supply')
  @ApiOperation({ summary: '발행 가능한 NFT 총 수량' })
  @ApiResponse({ status: 200 })
  async getRemainingSupply(): Promise<any> {
    const remainingSupply = await this.mintingService.getRemainingSupply();
    return { remainingSupply: remainingSupply };
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
  /*
  @Get('calculated-supply')
  @ApiOperation({ summary: '발행된 NFT 총 수량' })
  @ApiResponse({ status: 200 })
  async getCalculatedSupply(): Promise<any> {
    const calculatedSupply = await this.mintingService.getCalculatedSupply();
    return { calculatedSupply: calculatedSupply };
  }
  */
}