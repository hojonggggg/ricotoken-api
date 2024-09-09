import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Minting } from './entities/minting.entity';
import { MintingConfig } from './entities/minting-config.entity';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';
import {
  CreateMintingStep1Dto,
  CreateMintingStep2Dto,
} from './dto/create-minting.dto';
import { calcPrice, convertToDecimal18 } from 'src/commons/shared/functions';
import { NftService } from '../nft/nft.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class MintingService {
  constructor(
    private readonly nftService: NftService,
    @InjectRepository(Minting)
    private mintingRepository: Repository<Minting>,
    @InjectRepository(MintingConfig)
    private mintingConfigRepository: Repository<MintingConfig>,
  ) {}

  async getMintingConfig(): Promise<MintingConfig> {
    const config = await this.mintingConfigRepository.findOne({
      where: { id: 1 },
    });
    if (!config) {
      throw new NotFoundException('Minting configuration not found');
    }
    return config;
  }

  async updateMintingConfig(
    updateMintingConfigDto: UpdateMintingConfigDto,
  ): Promise<MintingConfig> {
    let config = await this.mintingConfigRepository.findOne({
      where: { id: 1 },
    });
    if (!config) {
      config = this.mintingConfigRepository.create({
        id: 1,
        ...updateMintingConfigDto,
      });
    } else {
      Object.assign(config, updateMintingConfigDto);
    }
    return this.mintingConfigRepository.save(config);
  }

  async mintingStep1(
    userId: number,
    walletAddress: string,
    createMintingStep1Dto: CreateMintingStep1Dto,
  ): Promise<any> {
    /*
     * 민팅 가능 상태 확인
     */
    const mintingConfig = await this.getMintingConfig();
    const isMintingActive = mintingConfig.isMintingActive;

    if (!isMintingActive) {
      throw new Error('Minting inactive');
    }

    const { fiat, amount } = createMintingStep1Dto;
    const price = await calcPrice(fiat, amount);
    const priceToDecimal18 = await convertToDecimal18(price);

    const minting = await this.mintingRepository.save({
      userId,
      walletAddress,
      price: priceToDecimal18,
      ...createMintingStep1Dto,
    });

    const remainingSupply = await this.getRemainingSupply();
    const newRemainingSupply = remainingSupply - amount;
    
    /*
     * 수량 적용
     */


    //return this.mintingRepository.save(minting);
    const _serviceWalletAddress = process.env.SERVICE_WALLET_ADDRESS;
    return { id: minting.id, price: minting.price, fiat, toAddress: _serviceWalletAddress };
  }

  async mintingStep2(
    createMintingStep2Dto: CreateMintingStep2Dto,
  ): Promise<any> {
    const { id, txHash } = createMintingStep2Dto;

    //const minting = await this.findMintingById(id);
    //const { walletAddress, fiat, price } = minting;

    /*
     * 트랜잭션 검증은 데몬에서
     * const mintingId = minting.id;
     * await this.nftService.createNft(userId, walletAddress, mintingId);
     */

    return await this.mintingRepository.save({
      status: 'CINFIRMING', 
      ...createMintingStep2Dto,
    });
  }

  async findMintingById(id: number) {
    return await this.mintingRepository.findOne({ where: { id } });
  }

  async findAll(paginationQuery) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [mintings, total] = await this.mintingRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'DESC' }, // 정렬 옵션
    });

    return {
      data: mintings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCalculatedSupply() {
    const minting = await this.mintingRepository
      .createQueryBuilder("mintings")
      .select("SUM(mintings.amount)", "totalSupply")
      .where("mintings.status = 'SUCCESS'")
      .getRawOne();
    const { totalSupply } = minting;
    console.log({totalSupply});
    return totalSupply;
  }

  async getRemainingSupply() {
    const calculatedSupply = await this.getCalculatedSupply();
    const remainingSupply = 50000 - calculatedSupply;
    return remainingSupply;
  }

  async getPrice() {
    const config = await this.getMintingConfig();
    const { usdtPrice, nftPriceAmount } = config;
    return { nftSaleAmount: nftPriceAmount, usdtPrice };
  }

  async updateMintingStatus(mintingId: number, status: string) {
    await this.mintingRepository.update({ id: mintingId }, { status });
  }
}
