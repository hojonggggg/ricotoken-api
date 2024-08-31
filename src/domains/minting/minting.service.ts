import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Minting } from './entities/minting.entity';
import { MintingConfig } from './entities/minting-config.entity';
import { UpdateMintingConfigDto } from './dto/update-minting-config.dto';

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

  async updateMintingConfig(updateDto: UpdateMintingConfigDto): Promise<MintingConfig> {
    let config = await this.mintingConfigRepository.findOne({ where: { id: 1 } });
    if (!config) {
      config = this.mintingConfigRepository.create({ id: 1, ...updateDto });
    } else {
      Object.assign(config, updateDto);
    }
    return this.mintingConfigRepository.save(config);
  }

  async findAll(page: number = 1, limit: number = 10) {
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
}