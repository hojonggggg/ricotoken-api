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
import { StakingService } from '../staking/staking.service';
import { Staking } from '../staking/entities/staking.entity';
import { StakingConfig } from '../staking/entities/staking-config.entity';
import { StakingStat } from '../staking/entities/staking-stat.entity';
import { StakingHistory } from '../staking/entities/staking-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AllowedIp, AdminLog, Minting, MintingConfig, Staking, StakingConfig, StakingStat, StakingHistory])],
  controllers: [AdminsController],
  providers: [AdminIpGuard, AdminsService, MintingService, StakingService],
  exports: [AdminIpGuard, AdminsService],
})
export class AdminsModule {}