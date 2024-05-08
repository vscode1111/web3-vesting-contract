import { TransactionRequest } from 'ethers';

export const VERSION = '1.0';

export const PERCENT_DIVIDER = BigInt(10 ** 18);

export const ONE_HUNDRED_PERCENT = BigInt(100);

export const TX_OVERRIDES: TransactionRequest = {
  // gasPrice: 3_000_000_000,
  // gasLimit: 1_000_000,
};
