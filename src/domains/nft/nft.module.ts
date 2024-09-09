import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { Nft } from './entities/nft.entity';
import { Staking } from '../staking/entities/staking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nft, Staking])],
  providers: [NftService],
  controllers: [NftController],
  exports: [NftService],
})
export class NftModule {}