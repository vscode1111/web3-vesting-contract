import { Signer } from 'ethers';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';
import { SQRVesting__factory } from '~typechain-types/factories/contracts/SQRVesting__factory';

export interface Users {
  owner: Signer;
  ownerAddress: string;
  user1: Signer;
  user1Address: string;
  user2: Signer;
  user2Address: string;
  user3: Signer;
  user3Address: string;
  owner2: Signer;
  owner2Address: string;
}

export interface ERC20TokenContext {
  erc20TokenAddress: string;
  ownerERC20Token: ERC20Token;
  user1ERC20Token: ERC20Token;
  user2ERC20Token: ERC20Token;
  user3ERC20Token: ERC20Token;
  owner2ERC20Token: ERC20Token;
}

export interface SQRVestingContext {
  sqrVestingFactory: SQRVesting__factory;
  sqrVestingAddress: string;
  ownerSQRVesting: SQRVesting;
  user1SQRVesting: SQRVesting;
  user2SQRVesting: SQRVesting;
  user3SQRVesting: SQRVesting;
  owner2SQRVesting: SQRVesting;
}

export type ContextBase = Users & ERC20TokenContext & SQRVestingContext;
