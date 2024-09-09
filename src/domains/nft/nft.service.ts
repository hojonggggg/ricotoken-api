import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nft } from './entities/nft.entity';
//import { StakingService } from '../staking/staking.service';
import { Staking } from '../staking/entities/staking.entity';
import { convertToDecimal18, stringToBignumber } from 'src/commons/shared/functions';

@Injectable()
export class NftService {
  constructor(
    //private stakingService: StakingService,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(Staking)
    private stakingRepository: Repository<Staking>,
  ) {}

  async createNft(userId: number, walletAddress: string, mintingId: number, nftId: number, txHash: string, status: string) {
    await this.nftRepository.save({ userId, walletAddress, mintingId, nftId, txHash, status });
  }

  async findNftsByUserId(userId: number): Promise<any> {
    const activeNfts = await this.nftRepository.find({ 
      select: ['nftId'],
      where: { userId, status: 'ACTIVE' } 
    });
    const inactiveNfts = await this.nftRepository.find({ 
      select: ['nftId'],
      where: { userId, status: 'INACTIVE' } 
    });
    const reward = await this.getReward(userId);
    const nfts = {
      active: activeNfts || {},
      inactive: inactiveNfts || {},
      reward: reward
    }
    return nfts;
  }

  async getReward(userId:number) {
    const staking = await this.stakingRepository
      .createQueryBuilder("stakings")
      .select("SUM(stakings.reward)", "totalReward")
      .where("stakings.userId = :userId", { userId })
      //.andWhere("stakings.status = :status", { status: 'Staked' })
      .getRawOne();
    const { totalReward } = staking;
    console.log({totalReward});
    //let balance = convertToDecimal18(totalReward);
    //console.log({balance});
    return totalReward;
  }

  async findNftByUid(uid: number): Promise<any> {
    return await this.nftRepository.findOne({ where: { uid } });
  }

  async updateNftStatusByNftId(nftId: number, status: string, newStatus: string) {
    await this.nftRepository.update({ nftId, status }, { status: newStatus });
  }

  async updateNftsStatusByUserId(userId: number, status: string, newStatus: string) {
    await this.nftRepository.update({ userId, status }, { status: newStatus });
  }


}
