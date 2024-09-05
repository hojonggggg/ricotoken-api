import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { UpdateStakingConfigDto } from './dto/update-staking-config.dto';
import { AdminsService } from '../admins/admins.service';
import { MintingService } from '../minting/minting.service';
import { NftService } from '../nft/nft.service';
import { JoinStakingDto } from './dto/join-staking.dto';
import { CancelStakingDto, CancelStakingsDto } from './dto/cancel-staking.dto';
import { Claim } from './entities/claim.entity';
import { ClaimStakingDto } from './dto/claim-staking.dto';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';
import { convertToDecimal18 } from 'src/commons/shared/functions';

@Injectable()
export class StakingService {
  constructor(
    private readonly dataSource: DataSource,
    private adminsService: AdminsService,
    private mintingService: MintingService,
    private nftService: NftService,
    @InjectRepository(Staking)
    private stakingRepository: Repository<Staking>,
    @InjectRepository(StakingConfig)
    private stakingConfigRepository: Repository<StakingConfig>,
    @InjectRepository(StakingStat)
    private stakingStatRepository: Repository<StakingStat>,
    @InjectRepository(StakingHistory)
    private stakingHistoryRepository: Repository<StakingHistory>,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
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
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      //NFT ACTIVE 상태 확인

      const staking = await this.stakingRepository.save({
        userId, 
        walletAddress, 
        ...joinStakingDto
      });
      const { nftId, txHash } = joinStakingDto;
      const action = 'Staked';
      await this.nftService.updateNftStatusByNftId(nftId, 'ACTIVE', 'INACTIVE');
      await this.createHistory(userId, action, txHash, null);

      await queryRunner.commitTransaction();
      return staking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async cancelMinting(userId: number, cancelStakingDto: CancelStakingDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { id, txHash } = cancelStakingDto;
      const staking = await this.stakingRepository.findOne({ where: { id, userId } });
      if (!staking) {
        throw new NotFoundException(`Staking with ID "${id}" not found`);
      }
      staking.status = 'Unstaked';
      await this.stakingRepository.save(staking);

      const nftId = staking.nftId;
      const nftStatus = 'INACTIVE';
      const newNftStatus = 'ACTIVE';

      await this.nftService.updateNftStatusByNftId(nftId, nftStatus, newNftStatus);
      await this.createHistory(userId, "Unstaked", txHash, null);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelMintings(userId: number, cancelStakingsDto: CancelStakingsDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { txHash } = cancelStakingsDto;

      const stakingStatus = 'Staked';
      const newStakingStatus = 'Unstaked';
      await this.stakingRepository.update({ userId, status: stakingStatus }, { status: newStakingStatus });

      const nftStatus = 'INACTIVE';
      const newNftStatus = 'ACTIVE';
      //await this.nftService.updateNftStatus(nftId, 'ACTIVE');
      await this.nftService.updateNftsStatusByUserId(userId, nftStatus, newNftStatus);
      await this.createHistory(userId, "Unstaked", txHash, null);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      where: { userId },
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
      where: { userId },
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

  async claims(userId: number, walletAddress: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const staking = await this.stakingRepository
        .createQueryBuilder("stakings")
        .select("SUM(stakings.reward)", "totalReward")
        .where("stakings.userId = :userId", { userId })
        .andWhere("stakings.status = :status", { status: 'Staked' })
        .getRawOne();
      const { totalReward } = staking;
      console.log({totalReward});
      const balance = convertToDecimal18(totalReward);
      console.log({balance});

      await this.stakingRepository.update({ userId, status:'Staked' }, { reward: 0 });
      await this.claimRepository.save({
        userId,
        walletAddress,
        balance,
        status: 'WAIT'
      });
      
      /*
      const { txHash } = claimStakingDto;
      const action = 'Claim';
      const amount = totalReward.toString();
      await this.createHistory(userId, action, txHash, amount);
      */
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async claim(userId: number, walletAddress: string, stakingId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();



      const staking = await this.stakingRepository.findOne({ where: { id: stakingId, userId }});
      const { reward } = staking;
      staking.reward = 0;
      await this.stakingRepository.save(staking);
      await this.claimRepository.save({
        userId,
        walletAddress,
        amount: reward,
        status: 'WAIT'
      });
      /*
      const { txHash } = claimStakingDto;
      const action = 'Claim';
      const amount = reward.toString();
      await this.createHistory(userId, action, txHash, amount);
      */
     
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createHistory(userId: number, action: string, txHash: string, amount: string): Promise<StakingHistory> {
    return await this.stakingHistoryRepository.save({userId, action, txHash, amount});
  }
}