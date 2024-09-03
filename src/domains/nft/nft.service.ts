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

  async findNftsByUserId(userId: number): Promise<any> {
    const activeNfts = await this.nftRepository.find({ 
      select : ['nftId'],
      where: { userId, status: 'ACTIVE' } 
    });
    const inactiveNfts = await this.nftRepository.find({ 
      select : ['nftId'],
      where: { userId, status: 'INACTIVE' } 
    });
    const nfts = {
      active: activeNfts || {},
      inactive: inactiveNfts || {},
      reward: 0
    }
    return nfts;
  }

  async updateNftStatus(nftId: number, status: string) {
    await this.nftRepository.update({ nftId }, { status });
  }
}
