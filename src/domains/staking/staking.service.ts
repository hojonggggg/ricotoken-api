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
import { CancelStakingDto } from './dto/cancel-staking.dto';
import { Claim } from './entities/claim.entity';
import { ClaimStakingDto } from './dto/claim-staking.dto';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';
import { convertToDecimal18, stringToBignumber } from 'src/commons/shared/functions';

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

      const { nftId, txHash } = cancelStakingDto;
      const staking = await this.stakingRepository.findOne({ where: { nftId, userId } });
      if (!staking) {
        throw new NotFoundException(`Staking with ID "${nftId}" not found`);
      }
      staking.status = 'Unstaked';
      await this.stakingRepository.save(staking);

      //const nftId = staking.nftId;
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

  async cancelMintings(userId: number, cancelStakingsDto: CancelStakingDto): Promise<void> {
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
    const [stakings, total] = await this.stakingRepository.findAndCount({ where: { status: 'Staked' } });
    console.log({stakings, total});
    return total;
  }

  async getAPY() {
    const config = await this.stakingConfigRepository.findOne({ where: { id: 1 } });
    const dailyReward = config.rewardAmount;
    const yearReward = dailyReward * 365;
    const price = await this.mintingService.getPrice();
    const ricoPrice = price.usdtPrice;
    const nriPrice = +ricoPrice * 25000;
    console.log({dailyReward, yearReward, ricoPrice, nriPrice});
    const top = yearReward * (+ricoPrice) * 100;
    const bottom = nriPrice;
    const apy = top / bottom;
    console.log({top, bottom, apy});
    return apy;
  }

  async getClaimFee() {
    const claimConfig = await this.getStakingConfig();
    const { claimFee } = claimConfig;
    return claimFee;
  }

  async getStats(): Promise<any> {
    const stat = await this.stakingStatRepository.findOne({ where: { id: 1 } });
    const price = await this.mintingService.getPrice();
    const ricoPrice = price.usdtPrice;
    const stats = {
      total: {
        totalStaked: await this.getTotalStakingCount(),
        dailyReward: (await (this.getStakingConfig())).rewardAmount,
        apy: await this.getAPY()
      },
      nriStat: {
        nriPrice: +ricoPrice * 25000,
        calculatedSupply: await this.mintingService.getCalculatedSupply(),
      },
      ricoStat: {
        ricoPrice: +ricoPrice
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

    const transformedHistorys = historys.map(history => {
      return {
        ...history,
        txHash: history.txHash ?? '', // column1이 null이면 빈 문자열로 대체
        amount: history.amount ?? '', // column2도 동일하게 처리
        // 추가로 처리할 다른 컬럼들
      };
    });

    return {
      data: transformedHistorys,
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
        //.andWhere("stakings.status = :status", { status: 'Staked' })
        .getRawOne();
      const { totalReward } = staking;
      console.log({totalReward});
      //let balance = convertToDecimal18(totalReward);
      let balance = totalReward;
      const claimFee = await this.getClaimFee();
      console.log({balance, claimFee});

      if (stringToBignumber(balance).isGreaterThan(stringToBignumber(claimFee))) {
        balance = (stringToBignumber(balance).minus(stringToBignumber(claimFee))).toFixed();
        console.log({balance});
        
        await this.stakingRepository.update({ userId }, { reward: 0 });
        const claim = await this.claimRepository.create({
          userId,
          walletAddress,
          balance,
          status: 'WAIT'
        });
        await this.claimRepository.save(claim);
        await this.stakingHistoryRepository.save({userId, action: 'Claim', amount: balance, claimId: claim.id});
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async claim(userId: number, walletAddress: string, stakingId: number, claimStakingDto: ClaimStakingDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();



      const staking = await this.stakingRepository.findOne({ where: { id: stakingId, userId }});
      const { reward } = staking;
      staking.reward = 0;
      let balance = convertToDecimal18(reward);

      
      const claimFee = await this.getClaimFee();
      console.log({balance, claimFee});

      if (stringToBignumber(balance).isGreaterThan(stringToBignumber(claimFee))) {
        balance = (stringToBignumber(balance).minus(stringToBignumber(claimFee))).toFixed();
      }

      await this.stakingRepository.save(staking);
      await this.claimRepository.save({
        userId,
        walletAddress,
        balance,
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
    //return await this.stakingHistoryRepository.save({userId, action, txHash, amount});
    return await this.stakingHistoryRepository.save({userId, action, amount, txHash});
  }
}