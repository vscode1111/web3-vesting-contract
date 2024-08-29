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

const deployType: DeployType = (process.env.ENV as DeployType) ?? 'main';

console.log('ENV', deployType);

export const chainTokenDescription: Record<DeployNetworkKey, TokenAddressDescription> = {
  mainnet: getTokenDescription(Token.tSQR),
  bsc: getTokenDescription(Token.tSQR),
};

export const { address: tokenAddress, decimals: tokenDecimals } =
  chainTokenDescription[defaultNetwork];

// const isProd = deployType === ('prod' as any);
// if (isProd) {
//   throw 'Are you sure? It is PROD!';
// }

const priceDiv = BigInt(1);
export const now = dayjs();
const startDate = now.add(3, 'minutes');
const refundStartDate = startDate.add(1, 'minutes');
const refundCloseDate = startDate.add(10, 'minutes');

const unlockPeriod = 10 * 30 * DAYS;
const claimFrequency = 1 * MINUTES;

export const contractConfigDeployMap: Record<DeployType, Partial<ContractConfig>> = {
  test: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //s-owner2
    startDate: toUnixTime(startDate.toDate()),
    cliffPeriod: 90 * DAYS,
    firstUnlockPercent: calculatePercentForContract(10),
    unlockPeriod: 30 * DAYS,
    unlockPeriodPercent: calculatePercentForContract(20),
    availableRefund: true,
    refundStartDate: toUnixTime(refundStartDate.toDate()),
    refundCloseDate: toUnixTime(refundCloseDate.toDate()),
  },
  main: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //s-owner2
    startDate: toUnixTime(startDate.toDate()),
    // startDate: 1724081639,
    // erc20Token: '0xa7D4078926d6fB63d843F17811893E29Cdb2fecA', //Temp01 - mainnet
    erc20Token: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(50),
    unlockPeriod: 5 * MINUTES,
    unlockPeriodPercent: calculatePercentForContract(0.001),
    availableRefund: true,
    refundStartDate: toUnixTime(startDate.toDate()),
    refundCloseDate: toUnixTime(refundCloseDate.toDate()),
  },
  stage: {
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //s-owner2
    erc20Token: '0x2B72867c32CF673F7b02d208B26889fEd353B1f8', //SQR
    startDate: toUnixTime(now.add(2, 'minutes').toDate()),
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(25),
    unlockPeriod: 1 * MINUTES,
    unlockPeriodPercent: calculatePercentForContract(25),
  },
  prod: {
    // newOwner: MATAN_WALLET_COMMON,
    newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //s-owner2
    erc20Token: '0xea3eed8616877f5d3c4aebf5a799f2e8d6de9a5e', //SQR
    // startDate: toUnixTime(now.add(5, 'minutes').toDate()),
    startDate: toUnixTimeUtc(new Date(2024, 7, 29, 16, 0, 0)),
    cliffPeriod: 0,
    firstUnlockPercent: calculatePercentForContract(0),
    unlockPeriod: claimFrequency,
    unlockPeriodPercent: calculatePercentForContract(100 / (unlockPeriod / claimFrequency)),
    availableRefund: true,
    refundStartDate: toUnixTimeUtc(new Date(2024, 7, 29, 16, 0, 0)),
    refundCloseDate: toUnixTimeUtc(new Date(2024, 8, 27, 16, 0, 0)),
  },
};

const extContractConfig = contractConfigDeployMap[deployType];

export const contractConfig: ContractConfig = {
  newOwner: '0x627Ab3fbC3979158f451347aeA288B0A3A47E1EF', //s-owner2
  erc20Token: tokenAddress,
  startDate: toUnixTime(now.add(1, 'days').toDate()),
  cliffPeriod: 90 * DAYS,
  firstUnlockPercent: calculatePercentForContract(10),
  unlockPeriod: 30 * DAYS,
  unlockPeriodPercent: calculatePercentForContract(20),
  availableRefund: false,
  refundStartDate: 0,
  refundCloseDate: 0,
  ...extContractConfig,
};

export function getContractArgs(contractConfig: ContractConfig): DeployContractArgs {
  return [contractConfig];
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
  now,
  totalAccountBalance: tokenConfig.initMint,
  companyVesting: toWei(120_000, tokenDecimals),
  allocation1: toWei(30_000, tokenDecimals) / priceDiv,
  allocation2: toWei(20_000, tokenDecimals) / priceDiv,
  allocation3: toWei(50_000, tokenDecimals) / priceDiv,
  balanceDelta: toWei(0.01, tokenDecimals),
  timeDelta: 30,
  nowPlus1m: toUnixTime(now.add(1, 'minute').toDate()),
  startDatePlus1m: addSecondsToUnixTime(contractConfig.startDate, 1 * MINUTES),
  timeShift: 10,
};
