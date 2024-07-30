import dayjs from 'dayjs';
import { DAYS, MINUTES, toUnixTime, toUnixTimeUtc, toWei } from '~common';
import { TokenAddressDescription } from '~common-contract';
import { Token, ZERO } from '~constants';
import { DeployNetworkKey } from '~types';
import { addSecondsToUnixTime } from '~utils/common';
import { calculatePercentForContract, getTokenDescription } from '~utils/contracts';
import { defaultNetwork } from '../hardhat.config';
import { ContractConfig, DeployContractArgs, DeployTokenArgs, TokenConfig } from './types';

type DeployType = 'test' | 'main' | 'stage' | 'prod';

const deployType: DeployType = (process.env.ENV as DeployType) ?? 'prod';

console.log('ENV', deployType);

const isProd = deployType === ('prod' as any);

export const chainTokenDescription: Record<DeployNetworkKey, TokenAddressDescription> = {
  bsc: getTokenDescription(Token.tSQR),
};

export const { address: tokenAddress, decimals: tokenDecimals } =
  chainTokenDescription[defaultNetwork];

// if (isProd) {
//   throw 'Are you sure? It is PROD!';
// }

const priceDiv = BigInt(1);
export const now = dayjs();

export const contractConfigDeployMap: Record<DeployType, Partial<ContractConfig>> = {
  test: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    startDate: toUnixTime(now.add(5, 'days').toDate()),
    cliffPeriod: 90 * DAYS,
    firstUnlockPercent: calculatePercentForContract(10),
    unlockPeriod: 30 * DAYS,
    unlockPeriodPercent: calculatePercentForContract(20),
  },
  main: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    startDate: toUnixTime(now.add(2_000_000, 'minutes').toDate()),
    // startDate: 1718299329,
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(50),
    // unlockPeriod: 7 * DAYS,
    unlockPeriod: 1 * MINUTES,
    unlockPeriodPercent: calculatePercentForContract(0.001),
  },
  stage: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    erc20Token: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
    startDate: toUnixTime(now.add(2, 'minutes').toDate()),
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(25),
    unlockPeriod: 1 * MINUTES,
    unlockPeriodPercent: calculatePercentForContract(25),
  },
  prod: {
    // newOwner: '0xA8B8455ad9a1FAb1d4a3B69eD30A52fBA82549Bb', //Matan
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
    erc20Token: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
    // startDate: toUnixTime(now.add(5, 'minutes').toDate()),
    startDate: toUnixTimeUtc(new Date(2024, 6, 26, 14, 0, 0)),
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(25),
    unlockPeriod: 30 * DAYS,
    unlockPeriodPercent: calculatePercentForContract(25),
  },
};

const extContractConfig = contractConfigDeployMap[deployType];

export const contractConfig: ContractConfig = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF',
  erc20Token: tokenAddress,
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
  initMint: toWei(1_000_000_000, tokenDecimals),
  decimals: tokenDecimals,
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
  companyVesting: toWei(120_000, tokenDecimals),
  allocation1: toWei(30_000, tokenDecimals) / priceDiv,
  allocation2: toWei(20_000, tokenDecimals) / priceDiv,
  allocation3: toWei(50_000, tokenDecimals) / priceDiv,
  balanceDelta: toWei(0.01, tokenDecimals),
  timeDelta: 30,
  nowPlus1m: toUnixTime(now.add(1, 'minute').toDate()),
  startDatePlus1m: addSecondsToUnixTime(contractConfig.startDate, 1 * MINUTES),
  // timeShift: 0,
};
