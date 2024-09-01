import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from '../admins/admins.service';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';
import { AllowedIp } from '../admins/entities/allowed-ip.entity';
import { AdminLog } from '../admins/entities/admin-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staking, StakingConfig, StakingStat, StakingHistory, AllowedIp, AdminLog])],
  providers: [AdminsService, StakingService],
  controllers: [StakingController],
  exports: [StakingService],
})
export class StakingModule {}