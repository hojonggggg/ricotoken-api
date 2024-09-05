import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nft } from './entities/nft.entity';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
  ) {}

  async createNft(userId: number, walletAddress: string, mintingId: number) {
    await this.nftRepository.save({ userId, walletAddress, mintingId });
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
    const nfts = {
      active: activeNfts || {},
      inactive: inactiveNfts || {},
      reward: 0
    }
    return nfts;
  }

  async updateNftStatusByNftId(nftId: number, status: string, newStatus: string) {
    await this.nftRepository.update({ nftId, status }, { status: newStatus });
  }

  async updateNftsStatusByUserId(userId: number, status: string, newStatus: string) {
    await this.nftRepository.update({ userId, status }, { status: newStatus });
  }


}
