import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import TNRIContractABI from './abi/TNRI.json';

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
    this.contract = new ethers.Contract(contractAddress, TNRIContractABI, this.signer);
  }

  async mint(to: string, amount: number) {
    const metaDataURL = this.configService.get<string>('META_DATA_URL');
    console.log({to, metaDataURL});
    const tx = await this.contract.mint(to, amount, metaDataURL);
    const receipt = await tx.wait();
    const txHash = receipt.hash;
    /*
    const mintEvent = receipt.logs.find(log => log.fragment.name === 'Mint');
    console.log({mintEvent});
    const tokenId = mintEvent.args[0];
    const tokenIds = mintEvent.args.tokenId.toString();
    console.log({tokenIds});
    */
    if (receipt.logs) {
      const mintEvents = receipt.logs.filter(log => log.fragment.name === 'Mint');
      
      if (mintEvents.length > 0) {
        const tokenIds = mintEvents.map(event => event.args.tokenId.toString());
        console.log("Minted Token IDs:", tokenIds);
        return { txHash, tokenIds };
      } else {
        console.log("No Mint events found in the logs");
      }
    } else {
      console.log("No logs found in the receipt");
    }
    // 이벤트에서 tokenId 확인
    /*
  const tokenIds = receipt.events
  .filter((event) => event.event === 'Mint')  // Mint 이벤트 필터
  .map((event) => event.args.tokenId.toString());  // tokenId 추출
    */
  //console.log({tokenIds});
    //return { txHash, tokenId };
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
