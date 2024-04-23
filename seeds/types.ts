import { BigNumberish } from 'ethers';

export interface ContractConfig {
  newOwner: string;
  erc20Token: string;
  startDate: number;
  cliffDate: number;
  firstUnlockPercent: number;
  unlockPeriodPercent: number;
  unlockPeriod: number;
  afterPurchaseCliffDate: number;
}

export type DeployContractArgs = [
  newOwner: string,
  erc20Token: string,
  startDate: number,
  cliffDate: number,
  firstUnlockPercent: BigNumberish,
  unlockPeriodPercent: BigNumberish,
  unlockPeriod: number,
  afterPurchaseCliffDate: number,
];

export interface TokenConfig {
  name: string;
  symbol: string;
  newOwner: string;
  initMint: bigint;
  decimals: number;
}

export type DeployTokenArgs = [
  name_: string,
  symbol_: string,
  newOwner: string,
  initMint: bigint,
  decimals_: bigint | number,
];
