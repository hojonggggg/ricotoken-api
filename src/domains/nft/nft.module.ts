import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { Nft } from './entities/nft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nft])],
  providers: [NftService],
  controllers: [NftController],
  exports: [NftService],
})
export class NftModule {}