import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Query,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MintingService } from './minting.service';
import { MintingConfig } from './entities/minting-config.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';
import { Minting } from './entities/minting.entity';
import { CreateMintingStep1Dto, CreateMintingStep2Dto } from './dto/create-minting.dto';

@ApiTags('minting')
@Controller('minting')
export class MintingController {
  constructor(private readonly mintingService: MintingService) {}

  @Get('is-active')
  @ApiOperation({ summary: 'NFT 판매 상태' })
  @ApiResponse({ status: 200 })
  async getIsActive() {
    const config = await this.mintingService.getMintingConfig();
    return { isActive: config.isMintingActive };
  }

  @Get('remaining-supply')
  @ApiOperation({ summary: '발행 가능한 NFT 총 수량' })
  @ApiResponse({ status: 200 })
  async getRemainingSupply(): Promise<any> {
    const remainingSupply = await this.mintingService.getRemainingSupply();
    return { remainingSupply: remainingSupply };
  }

  @Get('price')
  @ApiOperation({ summary: 'NFT 민팅 가격' })
  @ApiResponse({ status: 200 })
  async getPrice(): Promise<any> {
    return await this.mintingService.getPrice();
  }

  @Post('step1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '민팅 STEP1' })
  @ApiResponse({ status: 200, type: [Minting] })
  async mintingStep1(
    @Body() createMintingStep1Dto: CreateMintingStep1Dto,
    @Request() req,
  ) {
    const { userId, walletAddress } = req.user;
    return await this.mintingService.mintingStep1(
      userId,
      walletAddress,
      createMintingStep1Dto,
    );
  }

  @Post('step2')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '민팅 STEP2' })
  @ApiResponse({ status: 200, type: [Minting] })
  async mintingStep2(@Body() createMintingStep2Dto: CreateMintingStep2Dto) {
    return await this.mintingService.mintingStep2(createMintingStep2Dto);
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
