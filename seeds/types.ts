export interface ContractConfig {
  newOwner: string;
  erc20Token: string;
  startDate: number;
  cliffPeriod: number;
  firstUnlockPercent: bigint;
  unlockPeriod: number;
  unlockPeriodPercent: bigint;
  availableRefund: boolean;
  refundStartDate: number;
  refundCloseDate: number;
}

export type DeployContractArgs = [ContractConfig];

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
