import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import TestContractABI from './abi/Test.json';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('RPC_URL'),
    );
    this.signer = new ethers.Wallet(
      this.configService.get<string>('PRIVATE_KEY'),
      this.provider,
    );
    
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    this.contract = new ethers.Contract(contractAddress, TestContractABI, this.signer);
  }

  async mint(to: string) {
    const metaDataURL = this.configService.get<string>('META_DATA_URL');
    console.log({to, metaDataURL});
    const tx = await this.contract.safeMint(to, metaDataURL);
    const receipt = await tx.wait();
    const txHash = receipt.hash;
    const mintEvent = receipt.logs.find(log => log.fragment.name === 'Mint');
    const tokenId = mintEvent.args[0];
    return { txHash, tokenId };
  } 

  async claim(to: string, reward: string): Promise<string> {
    try {
      const tx = await this.contract.claim(to, ethers.parseUnits(reward, 18));
      console.log({tx});
      const receipt = await tx.wait();
      console.log({receipt});
      return receipt.hash;
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  }

}
