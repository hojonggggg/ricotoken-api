import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NftService } from './nft.service';

@ApiTags('nfts')
@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '보유한 NFT 전체 조회', description: 'active: 민팅 가능한 상태<br/>inactive: 민팅 불가능한 상태<br/>reward: 수령 가능한 보상' })
  @ApiResponse({ status: 200 }) 
  async findNftsByUserId(@Request() req): Promise<any> {
    const { userId } = req.user;
    return await this.nftService.findNftsByUserId(userId);
  }
}
