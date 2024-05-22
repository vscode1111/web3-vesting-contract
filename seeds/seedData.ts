import dayjs from 'dayjs';
import { DAYS, MINUTES, toUnixTime, toWei } from '~common';
import { ZERO } from '~constants';
import { DeployNetworkKey } from '~types';
import { addSecondsToUnixTime } from '~utils/common';
import { calculatePercentForContract } from '~utils/contract';
import { defaultNetwork } from '../hardhat.config';
import { ContractConfig, DeployContractArgs, DeployTokenArgs, TokenConfig } from './types';

type DeployType = 'test' | 'main' | 'stage' | 'prod';

const deployType: DeployType = (process.env.ENV as DeployType) ?? 'main';

console.log('ENV', deployType);

const isProd = deployType === ('prod' as any);

const chainDecimals: Record<DeployNetworkKey, number> = {
  bsc: 8,
};

export const erc20Decimals = chainDecimals[defaultNetwork];

if (isProd) {
  throw 'Are you sure? It is PROD!';
}

const priceDiv = BigInt(1);
export const now = dayjs();

export const contractConfigDeployMap: Record<DeployType, Partial<ContractConfig>> = {
  test: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    erc20Token: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
    startDate: toUnixTime(now.add(5, 'days').toDate()),
    cliffPeriod: 90 * DAYS,
    firstUnlockPercent: calculatePercentForContract(10),
    unlockPeriod: 30 * DAYS,
    unlockPeriodPercent: calculatePercentForContract(20),
  },
  main: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    erc20Token: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
    // startDate: toUnixTime(now.add(2, 'minutes').toDate()),
    startDate: 1715950237,
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(50),
    // unlockPeriod: 7 * DAYS,
    unlockPeriod: 1 * MINUTES,
    unlockPeriodPercent: calculatePercentForContract(0.001),
  },
  stage: {},
  prod: {
    newOwner: '0xA8B8455ad9a1FAb1d4a3B69eD30A52fBA82549Bb', //Matan
    erc20Token: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
  },
};

const extContractConfig = contractConfigDeployMap[deployType];

export const contractConfig: ContractConfig = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
  erc20Token: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c',
  startDate: toUnixTime(now.add(1, 'days').toDate()),
  cliffPeriod: 90 * DAYS,
  firstUnlockPercent: calculatePercentForContract(10),
  unlockPeriod: 30 * DAYS,
  unlockPeriodPercent: calculatePercentForContract(20),
  ...extContractConfig,
};

export function getContractArgs(contractConfig: ContractConfig): DeployContractArgs {
  const {
    newOwner,
    erc20Token,
    startDate,
    cliffPeriod: cliffDate,
    firstUnlockPercent,
    unlockPeriod,
    unlockPeriodPercent,
  } = contractConfig;

  return [
    newOwner,
    erc20Token,
    startDate,
    cliffDate,
    firstUnlockPercent,
    unlockPeriod,
    unlockPeriodPercent,
  ];
}

export const tokenConfig: TokenConfig = {
  name: 'empty',
  symbol: 'empty',
  newOwner: '0x81aFFCB2FaCEcCaE727Fa4b1B2ef534a1Da67791',
  initMint: toWei(1_000_000_000, erc20Decimals),
  decimals: erc20Decimals,
};

export function getTokenArgs(newOwner: string): DeployTokenArgs {
  return [
    tokenConfig.name,
    tokenConfig.symbol,
    newOwner,
    tokenConfig.initMint,
    tokenConfig.decimals,
  ];
}

export const seedData = {
  zero: ZERO,
  tiny: BigInt(1),
  totalAccountBalance: tokenConfig.initMint,
  companyVesting: toWei(120_000, erc20Decimals),
  allocation1: toWei(30_000, erc20Decimals) / priceDiv,
  allocation2: toWei(20_000, erc20Decimals) / priceDiv,
  allocation3: toWei(50_000, erc20Decimals) / priceDiv,
  balanceDelta: toWei(0.01, erc20Decimals),
  timeDelta: 30,
  nowPlus1m: toUnixTime(now.add(1, 'minute').toDate()),
  startDatePlus1m: addSecondsToUnixTime(contractConfig.startDate, 1 * MINUTES),
  // timeShift: 0,
};
