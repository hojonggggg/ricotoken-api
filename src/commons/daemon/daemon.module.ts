import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaemonService } from './daemon.service';
import { MintingService } from 'src/domains/minting/minting.service';
import { MintingConfig } from 'src/domains/minting/entities/minting-config.entity';
import { Minting } from 'src/domains/minting/entities/minting.entity';
import { NftService } from 'src/domains/nft/nft.service';
import { Nft } from 'src/domains/nft/entities/nft.entity';
import { StakingConfig } from 'src/domains/staking/entities/staking-config.entity';
import { Staking } from 'src/domains/staking/entities/staking.entity';
import { Reward } from 'src/domains/staking/entities/reward.entity';
import { BlockchainService } from 'src/domains/blockchain/blockchain.service';
import { Claim } from 'src/domains/staking/entities/claim.entity';
import { StakingHistory } from 'src/domains/staking/entities/staking-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MintingConfig, Minting, Nft, StakingConfig, Staking, Reward, Claim, StakingHistory])],
  providers: [DaemonService, MintingService, NftService, BlockchainService]
})
export class DaemonModule {}
