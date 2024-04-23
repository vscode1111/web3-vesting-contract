import dayjs from 'dayjs';
import { toUnixTime, toWei } from '~common';
import { MINUTES } from '~constants';
import { DeployNetworkKey } from '~types';
import { addSeconsToUnixTime } from '~utils';
import { defaultNetwork } from '../hardhat.config';
import { ContractConfig, DeployContractArgs, DeployTokenArgs, TokenConfig } from './types';

const chainDecimals: Record<DeployNetworkKey, number> = {
  bsc: 8,
};

export const sqrDecimals = chainDecimals[defaultNetwork];

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
  ...extContractConfig,
};

export function getContractArgs(contractConfig: ContractConfig): DeployContractArgs {
  const {
    newOwner,
    erc20Token,
    startDate,
    cliffDate,
    firstUnlockPercent,
    unlockPeriodPercent,
    unlockPeriod,
    afterPurchaseCliffDate,
  } = contractConfig;

  return [
    newOwner,
    erc20Token,
    startDate,
    cliffDate,
    firstUnlockPercent,
    unlockPeriodPercent,
    unlockPeriod,
    afterPurchaseCliffDate,
  ];
}

export const tokenConfig: TokenConfig = {
  name: 'empty',
  symbol: 'empty',
  newOwner: '0x81aFFCB2FaCEcCaE727Fa4b1B2ef534a1Da67791',
  initMint: toWei(1_000_000_000, sqrDecimals),
  decimals: sqrDecimals,
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

const userInitBalance = toWei(10_000, sqrDecimals) / priceDiv;
const deposit1 = toWei(100, sqrDecimals) / priceDiv;
const extraDeposit1 = toWei(2500, sqrDecimals) / priceDiv;
const withdraw1 = toWei(30, sqrDecimals) / priceDiv;
const extraWithdraw1 = toWei(3000, sqrDecimals) / priceDiv;

export const seedData = {
  zero: toWei(0),
  userInitBalance,
  totalAccountBalance: tokenConfig.initMint,
  deposit1,
  deposit2: deposit1 / userDiv,
  deposit3: deposit1 / userDiv / userDiv,
  extraDeposit1,
  extraDeposit2: extraDeposit1 / userDiv,
  extraDeposit3: extraDeposit1 / userDiv / userDiv,
  withdraw1,
  withdraw2: withdraw1 / userDiv,
  withdraw3: withdraw1 / userDiv / userDiv,
  extraWithdraw1,
  extraWithdraw2: extraWithdraw1 / userDiv,
  extraWithdraw3: extraWithdraw1 / userDiv / userDiv,
  balanceLimit: toWei(100, sqrDecimals),
  allowance: toWei(1000000, sqrDecimals),
  balanceDelta: toWei(0.01, sqrDecimals),
  nowPlus1m: toUnixTime(now.add(1, 'minute').toDate()),
  startDatePlus1m: addSeconsToUnixTime(contractConfig.startDate, 1 * MINUTES),
  timeShift: 10,
  invalidNonce: 999,
  depositNonce1_0: 0,
  depositNonce1_1: 1,
  depositNonce2_0: 0,
  depositNonce3_0: 0,
  withdrawNonce1_0: 0,
  withdrawNonce1_1: 1,
  withdrawNonce2_0: 0,
  withdrawNonce3_0: 0,
};
