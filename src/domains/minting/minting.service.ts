import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Minting } from './entities/minting.entity';
import { MintingConfig } from './entities/minting-config.entity';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';
import { CreateMintingDto } from './dto/create-minting.dto';

@Injectable()
export class MintingService {
  constructor(
    @InjectRepository(Minting)
    private mintingRepository: Repository<Minting>,
    @InjectRepository(MintingConfig)
    private mintingConfigRepository: Repository<MintingConfig>
  ) {}

  async getMintingConfig(): Promise<MintingConfig> {
    const config = await this.mintingConfigRepository.findOne({ where: { id: 1 } });
    if (!config) {
      throw new NotFoundException('Minting configuration not found');
    }
    return config;
  }

  async updateMintingConfig(updateMintingConfigDto: UpdateMintingConfigDto): Promise<MintingConfig> {
    let config = await this.mintingConfigRepository.findOne({ where: { id: 1 } });
    if (!config) {
      config = this.mintingConfigRepository.create({ id: 1, ...updateMintingConfigDto });
    } else {
      Object.assign(config, updateMintingConfigDto);
    }
    return this.mintingConfigRepository.save(config);
  }

  async minting(createMintingDto: CreateMintingDto): Promise<Minting> {
    const minting = this.mintingRepository.create({
      ...createMintingDto
    });

    const remainingSupply = await this.getRemainingSupply();
    const amount = minting.amount;
    const newRemainingSupply = remainingSupply - amount;
    
    ////수량 적용


    return this.mintingRepository.save(minting);
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
    return 456;
  }

  async getRemainingSupply() {
    const calculatedSupply = await this.getCalculatedSupply();
    const remainingSupply = 50000 - calculatedSupply;
    return remainingSupply;
  }
}