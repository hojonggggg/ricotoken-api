import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './domains/users/users.module';
import { AuthModule } from './domains/auth/auth.module';
import { AdminsModule } from './domains/admins/admins.module';
import { MintingModule } from './domains/minting/minting.module';
import { StakingModule } from './domains/staking/staking.module';
import { BlockchainModule } from './domains/blockchain/blockchain.module';
import { NftModule } from './domains/nft/nft.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DaemonModule } from './commons/daemon/daemon.module';
import configuration from './commons/config/configuration';
import * as moment from 'moment-timezone';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        moment.tz.setDefault('Asia/Seoul');
        return {
          type: 'mysql',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('database.synchronize'),
          timezone: '-09:00',
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    AdminsModule,
    UsersModule,
    MintingModule,
    NftModule,
    StakingModule,
    ScheduleModule.forRoot(),
    BlockchainModule,
    DaemonModule
  ],
})
export class AppModule {}