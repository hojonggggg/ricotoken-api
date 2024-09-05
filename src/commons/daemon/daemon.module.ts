import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaemonService } from './daemon.service';
import { MintingService } from 'src/domains/minting/minting.service';
import { MintingConfig } from 'src/domains/minting/entities/minting-config.entity';
import { Minting } from 'src/domains/minting/entities/minting.entity';
import { NftService } from 'src/domains/nft/nft.service';
import { Nft } from 'src/domains/nft/entities/nft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MintingConfig, Minting, Nft])],
  providers: [DaemonService, MintingService, NftService]
})
export class DaemonModule {}
