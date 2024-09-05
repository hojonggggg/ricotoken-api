import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { MintingService } from 'src/domains/minting/minting.service';
import { Minting } from 'src/domains/minting/entities/minting.entity';
import { NftService } from 'src/domains/nft/nft.service';
import { Cron } from '@nestjs/schedule';
import { ethers, Interface } from 'ethers';
const provider = new ethers.JsonRpcProvider(
  'https://bsc-dataseed3.binance.org/'
)
import * as dotenv from 'dotenv';
dotenv.config();
import { convert18Decimal } from '../shared/functions';

@Injectable()
export class DaemonService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mintingService: MintingService,
    private readonly nftService: NftService,
    @InjectRepository(Minting)
    private mintingRepository: Repository<Minting>,
  ) {}

  async mintingScan() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const mintings = await this.mintingRepository.find({ where: { status: 'CINFIRMING' } });

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
    const { userId, txHash, walletAddress, amount, fiat, price } = minting;
    const txReceipt = await provider.getTransactionReceipt(txHash);
    if (txReceipt) {
      const txStatus = txReceipt.status;
      if (txStatus === 1) {
        const tx = await provider.getTransaction(txHash);
        const inputData = tx.data;

        // transfer 함수의 ABI 정의
        const transferAbi = ["function transfer(address to, uint amount)"];
        const iface = new Interface(transferAbi);

        // data를 디코딩
        const decodedData = iface.parseTransaction({ data: inputData });

        const txFrom = tx.from;
        const txTo = decodedData.args[0];
        const value = decodedData.args[1];
        const txAmount = convert18Decimal(value);

        const _serviceWalletAddress = process.env.SERVICE_WALLET_ADDRESS;
        const _ricoWalletAddress = process.env.RICO_CONTRACT_ADDRESS;
        const _usdtWalletAddress = process.env.USDT_CONTRACT_ADDRESS;

        let txFiat;
        if ((tx.to).toLowerCase() === _ricoWalletAddress.toLowerCase()) {
          txFiat = 'RICO';
        } else if ((tx.to).toLowerCase() === _usdtWalletAddress.toLowerCase()) {
          txFiat = 'USDT';
        }

        if (
          txFrom.toLowerCase() === walletAddress.toLowerCase() 
          && txTo.toLowerCase() === _serviceWalletAddress.toLowerCase() 
          && txFiat === fiat 
          && txAmount === price
        ) {
          const mintingId = minting.id;
          const nftPromises = Array.from({ length: amount }, async () => 
            await this.nftService.createNft(userId, walletAddress, mintingId)
          )

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
  }

  @Cron('*/3 * * * * *')
  async handleDaemon() {
    const currentTime = new Date();
    console.log({ currentTime });

    await this.mintingScan();
  }
}
