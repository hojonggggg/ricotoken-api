import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AllowedIp } from './entities/allowed-ip.entity';
import { AdminLog } from './entities/admin-log.entity';
import { AdminIpGuard } from './guards/admin-ip.guard';
import { MintingService } from '../minting/minting.service';
import { Minting } from '../minting/entities/minting.entity';
import { MintingConfig } from '../minting/entities/minting-config.entity';
import { NftService } from '../nft/nft.service';
import { Nft } from '../nft/entities/nft.entity';
import { StakingService } from '../staking/staking.service';
import { Staking } from '../staking/entities/staking.entity';
import { StakingConfig } from '../staking/entities/staking-config.entity';
import { StakingStat } from '../staking/entities/staking-stat.entity';
import { StakingHistory } from '../staking/entities/staking-history.entity';
import { Claim } from '../staking/entities/claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllowedIp, AdminLog, Minting, MintingConfig, Nft, Staking, StakingConfig, StakingStat, StakingHistory, Claim])],
  controllers: [AdminsController],
  providers: [AdminIpGuard, AdminsService, MintingService, NftService, StakingService],
  exports: [AdminIpGuard, AdminsService],
})
export class AdminsModule {}