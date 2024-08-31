import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from '../admins/admins.service';
import { MintingService } from './minting.service';
import { MintingController } from './minting.controller';
import { Minting } from './entities/minting.entity';
import { MintingConfig } from './entities/minting-config.entity';
import { AllowedIp } from '../admins/entities/allowed-ip.entity';
import { AdminLog } from '../admins/entities/admin-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Minting, MintingConfig, AllowedIp, AdminLog])],
  providers: [AdminsService, MintingService],
  controllers: [MintingController],
  exports: [MintingService],
})
export class MintingModule {}