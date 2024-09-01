import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from '../admins/admins.service';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';
import { Staking } from './entities/staking.entity';
import { StakingConfig } from './entities/staking-config.entity';
import { StakingStat } from './entities/staking-stat.entity';
import { StakingHistory } from './entities/staking-history.entity';
import { MintingService } from '../minting/minting.service';
import { Minting } from '../minting/entities/minting.entity';
import { MintingConfig } from '../minting/entities/minting-config.entity';
import { AllowedIp } from '../admins/entities/allowed-ip.entity';
import { AdminLog } from '../admins/entities/admin-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AllowedIp, 
      AdminLog, 
      Staking, 
      StakingConfig, 
      StakingStat, 
      StakingHistory, 
      Minting, 
      MintingConfig
    ]
  )],
  providers: [AdminsService, StakingService, MintingService],
  controllers: [StakingController],
  exports: [StakingService],
})
export class StakingModule {}