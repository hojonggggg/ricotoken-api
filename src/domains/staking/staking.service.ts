import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { UpdateStakingConfigDto } from './dto/update-staking-config.dto';
import { AdminsService } from '../admins/admins.service';
import { MintingService } from '../minting/minting.service';
import { NftService } from '../nft/nft.service';
import { JoinStakingDto } from './dto/join-staking.dto';
import { CancelStakingDto } from './dto/cancel-staking.dto';
import { ClaimStakingDto } from './dto/claim-staking.dto';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';

@Injectable()
export class StakingService {
  constructor(
    @InjectRepository(Staking)
    private stakingRepository: Repository<Staking>,
    @InjectRepository(StakingConfig)
    private stakingConfigRepository: Repository<StakingConfig>,
    @InjectRepository(StakingStat)
    private stakingStatRepository: Repository<StakingStat>,
    @InjectRepository(StakingHistory)
    private stakingHistoryRepository: Repository<StakingHistory>,
    private adminsService: AdminsService,
    private mintingService: MintingService,
    private nftService: NftService,
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

  async join(userId: number, walletAddress: string, joinStakingDto: JoinStakingDto): Promise<Staking> {
    const staking = await this.stakingRepository.save({
      ...joinStakingDto
    });
    const { nftId, txHash } = joinStakingDto;
    const actionId = staking.id;
    const action = 'Staked';
    await this.nftService.updateNftStatus(nftId, 'INACTIVE');
    await this.createHistory(userId, nftId, actionId, action, txHash, null);
    return staking;
  }

  //async findAllFromAdmin(page: number = 1, limit: number = 10) {
  async findAllFromAdmin(paginationQuery) {
    const { page, limit } = paginationQuery;
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

  async find(id, userId) {
    return await this.stakingRepository.findOne({ where: { id, userId }, });
  }

  async findAllFromUser(userId, walletAddress, paginationQuery) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [stakings, total] = await this.stakingRepository.findAndCount({
      where: { userId: userId, walletAddress: walletAddress },
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

  async cancel(userId: number, cancelStakingDto: CancelStakingDto): Promise<void> {
    const { id, txHash } = cancelStakingDto;
    const staking = await this.stakingRepository.findOne({ where: { id, userId } });
    if (!staking) {
      throw new NotFoundException(`Staking with ID "${id}" not found`);
    }
    staking.status = 'Unstaked';
    await this.stakingRepository.save(staking);

    const nftId = staking.nftId;
    await this.nftService.updateNftStatus(nftId, 'ACTIVE');
    await this.createHistory(userId, nftId, id, "Unstaked", txHash, null);
  }

  async getTotalStakingCount() {
    return 123;
  }

  async getAPY() {
    return 12;
  }

  async getStats(): Promise<any> {
    const stat = await this.stakingStatRepository.findOne({ where: { id: 1 } });
    const stats = {
      total: {
        totalStaked: await this.getTotalStakingCount(),
        dailyReward: (await (this.getStakingConfig())).rewardAmount,
        apy: await this.getAPY()
      },
      nriStat: {
        nriPrice: stat.nriPrice,
        calculatedSupply: await this.mintingService.getCalculatedSupply(),
      },
      ricoStat: {
        ricoPrice: stat.ricoPrice
      }
    }
    return stats;
  }

  async getHistorys(userId: number, paginationQuery): Promise<any> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [historys, total] = await this.stakingHistoryRepository.findAndCount({
      where: { userId: userId },
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: historys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHistory(userId: number, nftId: number, paginationQuery): Promise<any> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [historys, total] = await this.stakingHistoryRepository.findAndCount({
      where: { userId, nftId },
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: historys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBalance(userId: number) {
    return this.stakingRepository.count({ where: { userId, status: 'Staked' } });
  }

  async claims(userId: number, claimStakingDto: ClaimStakingDto): Promise<void> {
    //const stakings = await this.stakingRepository.find({ where: { userId, status: 'Staked' } });
    const totalReward = await this.stakingRepository
      .createQueryBuilder("stakings")
      .select("SUM(stakings.reward)", "totalReward")
      .where("stakings.userId = :userId", { userId })
      .andWhere("stakings.status = :status", { status: 'Staked' })
      .getRawOne();
    console.log({totalReward});
  }

  async claim(userId: number, id: number, claimStakingDto: ClaimStakingDto): Promise<void> {
    const { txHash } = claimStakingDto;
    const staking = await this.stakingRepository.findOne({ where: { id, userId }});
    const stakingId = id;
    const { nftId, reward } = staking;
    staking.reward = 0;
    await this.stakingRepository.save(staking);
    const action = 'Claim';
    const amount = reward.toString();
    await this.createHistory(stakingId, userId, nftId, action, txHash, amount);
  }

  async createHistory(stakingId: number, userId: number, nftId: number, action: string, txHash: string, amount: string): Promise<StakingHistory> {
    return await this.stakingHistoryRepository.save({stakingId, userId, nftId, action, txHash, amount});
  }
}