import dayjs from 'dayjs';
import { toUnixTime, toWei } from '~common';
import { DAYS, MINUTES, ZERO } from '~constants';
import { DeployNetworkKey } from '~types';
import { addSeconsToUnixTime, calculatePercentForContract } from '~utils';
import { defaultNetwork } from '../hardhat.config';
import { ContractConfig, DeployContractArgs, DeployTokenArgs, TokenConfig } from './types';

const chainDecimals: Record<DeployNetworkKey, number> = {
  bsc: 8,
};

export const erc20Decimals = chainDecimals[defaultNetwork];

const isTest = true; //false - PROD!

if (!isTest) {
  throw 'Are you sure? It is PROD!';
}

const priceDiv = BigInt(1);
const userDiv = BigInt(2);
export const now = dayjs();

export const prodContractConfig: Partial<ContractConfig> = {
  newOwner: '0xA8B8455ad9a1FAb1d4a3B69eD30A52fBA82549Bb', //Matan
  erc20Token: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
};

//Test
export const mainContractConfig: Partial<ContractConfig> = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //My s-owner2
  erc20Token: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
};

const extContractConfig = isTest ? mainContractConfig : prodContractConfig;

export const contractConfig: ContractConfig = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
  erc20Token: '0x4072b57e9B3dA8eEB9F8998b69C868E9a1698E54',
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

export function getTokenArgs(newOnwer: string): DeployTokenArgs {
  return [
    tokenConfig.name,
    tokenConfig.symbol,
    newOnwer,
    tokenConfig.initMint,
    tokenConfig.decimals,
  ];
}

const userInitBalance = toWei(10_000, erc20Decimals) / priceDiv;
const allocation1 = toWei(30_000, erc20Decimals) / priceDiv;

export const seedData = {
  zero: ZERO,
  totalAccountBalance: tokenConfig.initMint,
  userInitBalance,
  companyVesting: toWei(100_000, erc20Decimals),
  allocation1,
  allocation2: allocation1 / userDiv,
  allocation3: allocation1 / userDiv / userDiv,
  balanceDelta: toWei(0.01, erc20Decimals),
  timeDelta: 30,
  nowPlus1m: toUnixTime(now.add(1, 'minute').toDate()),
  startDatePlus1m: addSeconsToUnixTime(contractConfig.startDate, 1 * MINUTES),
  timeShift: 10,
};
