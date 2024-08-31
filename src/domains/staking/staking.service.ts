import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { UpdateStakingConfigDto } from './dto/update-staking-config.dto';
import { StakingListDto } from './dto/staking-list.dto';
import { AdminsService } from '../admins/admins.service';
import { JoinStakingDto } from './dto/join-staking.dto';

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(Staking)
    private stakingRepository: Repository<Staking>,
    @InjectRepository(StakingConfig)
    private stakingConfigRepository: Repository<StakingConfig>,
    private adminsService: AdminsService
  ) {}

  async getStakingConfig(): Promise<StakingConfig> {
    const config = await this.stakingConfigRepository.findOne({ where: { id: 1 } });
    if (!config) {
      throw new NotFoundException('Staking configuration not found');
    }
    return config;
  }

  async updateStakingConfig(userId: number, updateDto: UpdateStakingConfigDto, adminIp: string): Promise<StakingConfig> {
    let config = await this.stakingConfigRepository.findOne({ where: { id: 1 } });
    if (!config) {
      config = this.stakingConfigRepository.create({ id: 1, ...updateDto });
    } else {
      Object.assign(config, updateDto);
    }

    // Admin 액션 로깅
    const action = '스테이킹 보상 수정';
    const memo = updateDto.rewardAmount.toString();
    await this.adminsService.logAdminAction(userId, action, adminIp, memo);

    return this.stakingConfigRepository.save(config);
  }

  async join(userId: number, joinStakingDto: JoinStakingDto): Promise<Staking> {
    const staking = this.stakingRepository.create({
      userId,
      ...joinStakingDto
    });
    return this.stakingRepository.save(staking);
  }

  async findAllFromAdmin(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [stakings, total] = await this.stakingRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'DESC' }, // 정렬 옵션
    });

    return {
      data: stakings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /*
  async findAll(): Promise<StakingListDto[]> {
    const stakings = await this.stakingRepository.find();
    return stakings.map(staking => ({
      id: staking.id,
      nftId: staking.nftId,
      txHash: staking.txHash,
      amount: staking.amount,
      fiat: staking.fiat,
      walletAddress: staking.walletAddress
    }));
  }
  */

  async findAllFromUser(userId, paginationQuery) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [stakings, total] = await this.stakingRepository.findAndCount({
      where: { userId: userId },
      skip,
      take: limit,
      order: { id: 'DESC' }, // 정렬 옵션
    });

    return {
      data: stakings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancel(id: number, userId: number): Promise<void> {
    const staking = await this.stakingRepository.findOne({ where: { id, userId } });
    if (!staking) {
      throw new NotFoundException(`Staking with ID "${id}" not found`);
    }
    staking.status = 'Canceled';
    await this.stakingRepository.save(staking);
  }
}