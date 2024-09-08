import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { MintingService } from 'src/domains/minting/minting.service';
import { Minting } from 'src/domains/minting/entities/minting.entity';
import { NftService } from 'src/domains/nft/nft.service';
import { Nft } from 'src/domains/nft/entities/nft.entity';
import { StakingConfig } from 'src/domains/staking/entities/staking-config.entity';
import { Staking } from 'src/domains/staking/entities/staking.entity';
import { Reward } from 'src/domains/staking/entities/reward.entity';
import { Cron } from '@nestjs/schedule';
import { ethers, Interface } from 'ethers';
const provider = new ethers.JsonRpcProvider(
  'https://bsc-dataseed3.binance.org/',
);
import * as dotenv from 'dotenv';
dotenv.config();
import { convertToDecimal18 } from '../shared/functions';

@Injectable()
export class DaemonService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mintingService: MintingService,
    private readonly nftService: NftService,
    @InjectRepository(Minting)
    private mintingRepository: Repository<Minting>,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(StakingConfig)
    private stakingConfigRepository: Repository<StakingConfig>,
    @InjectRepository(Staking)
    private stakingRepository: Repository<Staking>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
  ) {}

  async test() {
    const contractAddress = '0xdDd59c4eCf09E0b6E7F8f3B73518A41dB12Bd71b';
    const stakeAbi = ['function stake(uint nftId)'];
    const contract = new ethers.Contract(contractAddress, stakeAbi, provider);
    console.log({ contract });
  }

  async mintingScan() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const mintings = await this.mintingRepository.find({
        where: { status: 'CINFIRMING' },
      });

      if (mintings.length > 0) {
        for await (let minting of mintings) {
          await this.txChk(minting);

          //await this.syncTracker(networkId, trackingType, blockNumber);
          //await this.blockNumberUpdate(networkId, trackingType, blockNumber);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async txChk(minting: Minting) {
    console.log({ minting });
    const { userId, txHash, walletAddress, amount, fiat, price } = minting;
    const txReceipt = await provider.getTransactionReceipt(txHash);
    if (txReceipt) {
      const txStatus = txReceipt.status;
      if (txStatus === 1) {
        const tx = await provider.getTransaction(txHash);
        const inputData = tx.data;

        // transfer 함수의 ABI 정의
        const transferAbi = ['function transfer(address to, uint amount)'];
        const iface = new Interface(transferAbi);

        // data를 디코딩
        const decodedData = iface.parseTransaction({ data: inputData });

        const txFrom = tx.from;
        const txTo = decodedData.args[0];
        const value = decodedData.args[1];
        const txAmount = value.toString();

        const _serviceWalletAddress = process.env.SERVICE_WALLET_ADDRESS;
        const _ricoWalletAddress = process.env.RICO_CONTRACT_ADDRESS;
        const _usdtWalletAddress = process.env.USDT_CONTRACT_ADDRESS;
        
        let txFiat;
        if (tx.to.toLowerCase() === _ricoWalletAddress.toLowerCase()) {
          txFiat = 'RICO';
        } else if (tx.to.toLowerCase() === _usdtWalletAddress.toLowerCase()) {
          txFiat = 'USDT';
        }
        
        if (
          txFrom.toLowerCase() === walletAddress.toLowerCase() &&
          txTo.toLowerCase() === _serviceWalletAddress.toLowerCase() &&
          txFiat === fiat &&
          txAmount === price
        ) {
          const mintingId = minting.id;
          const nftPromises = Array.from(
            { length: amount },
            async () =>
              await this.nftService.createNft(userId, walletAddress, mintingId),
          );

          await Promise.all(nftPromises);
          const status = 'SUCCESS';
          await this.mintingService.updateMintingStatus(mintingId, status);
        }
      }
    }
  }

  async minting() {
    /*
     * 수량 적용
     * 민팅 후 상태는 ACTIVE
     */
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const nfts = await this.nftRepository.find({
        where: { status: 'WAIT' },
      });

      if (nfts.length > 0) {
        for await (let nft of nfts) {
          const uid = nft.uid;

          

          await this.nftRepository.update(
            { uid }, { nftId: uid, status: 'ACTIVE' }
          )

          //await this.syncTracker(networkId, trackingType, blockNumber);
          //await this.blockNumberUpdate(networkId, trackingType, blockNumber);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reward(currentTime) {
    /*
     * 보상 적용
     */
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const config = await this.stakingConfigRepository.findOne({
        where: { id: 1 },
      });

      const dailyReward = config.rewardAmount;
      const timeReward = await this.calculateTenMinuteReward(dailyReward);
      console.log({dailyReward, timeReward});

      const stakings = await this.stakingRepository.find({ where: { status: 'Staked' } });
      if (stakings.length > 0) {
        for (const staking of stakings) {
          await this.distributeReward(staking, timeReward);
        }
        await this.createReward(timeReward, currentTime);
      } else {
        await this.createReward(timeReward, currentTime);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async calculateTenMinuteReward(dailyReward: number) {
    const minutesInADay = 1440; // 하루는 1440분
    const intervalInMinutes = 10; // 10분 간격
    const intervalsPerDay = minutesInADay / intervalInMinutes; // 하루에 10분 간격으로 몇 번인지 계산

    // dailyReward를 144개의 간격으로 나눠서 보상 계산
    const rewardPerInterval = dailyReward / intervalsPerDay;

    // 소수점 5자리까지 고정해서 반환
    return parseFloat(rewardPerInterval.toFixed(5));
  }

  async distributeReward(staking, timeReward) {
    const { id, reward } = staking;
    const newReward = parseFloat(reward) + timeReward;
    
    await this.stakingRepository.update(
      { id }, { reward: newReward }
    );
    
  }

  async createReward(reward: number, createdAt: Date) {
    await this.rewardRepository.save({
      reward,
      createdAt
    });
  }

  @Cron('*/3 * * * * *')
  async handleMintingDaemon() {
    const currentTime = new Date();
    //console.log({ currentTime });

    await this.mintingScan();
    await this.minting();
  }

  @Cron('*/10 * * * *')
  async handleRewardDaemon() {
    const currentTime = new Date();
    console.log({ currentTime });

    await this.reward(currentTime);
  }
}
