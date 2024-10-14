import { Signer } from 'ethers';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { IDepositRefund } from '~typechain-types/contracts/IDepositRefund';
import { WEB3Vesting } from '~typechain-types/contracts/WEB3Vesting';
import { WEB3Vesting__factory } from '~typechain-types/factories/contracts/WEB3Vesting__factory';

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

export interface WEB3VestingContext {
  web3VestingFactory: WEB3Vesting__factory;
  web3VestingAddress: string;
  ownerWEB3Vesting: WEB3Vesting;
  user1WEB3Vesting: WEB3Vesting;
  user2WEB3Vesting: WEB3Vesting;
  user3WEB3Vesting: WEB3Vesting;
  owner2WEB3Vesting: WEB3Vesting;
}

export interface DepositRefundContext {
  depositRefundAddress: string;
  ownerDepositRefund: IDepositRefund;
  user1DepositRefund: IDepositRefund;
  user2DepositRefund: IDepositRefund;
  user3DepositRefund: IDepositRefund;
  owner2DepositRefund: IDepositRefund;
}

export type ContextBase = Users & ERC20TokenContext & WEB3VestingContext;
