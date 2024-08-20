import { TransactionRequest } from 'ethers';
import { TokenDescription } from '~common-contract';

export const CONTRACT_NAME = 'Vesting';
export const CONTRACT_VERSION = '1.2';

export const PERCENT_DIVIDER = BigInt(10 ** 18);

export const ONE_HUNDRED_PERCENT = BigInt(100);

export const TX_OVERRIDES: TransactionRequest = {
  // gasPrice: 3_000_000_000,
  // gasLimit: 1_000_000,
};

export enum Token {
  tSQR = '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c',
}

export const TOKENS_DESCRIPTIONS: Record<string, TokenDescription> = {
  [Token.tSQR]: {
    tokenName: 'tSQR2',
    decimals: 8,
  },
};
