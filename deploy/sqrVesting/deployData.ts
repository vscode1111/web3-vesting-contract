import { toUnixTime, toWei } from '~common';
import { erc20Decimals } from '~seeds';

export const verifyRequired = false;
export const verifyArgsRequired = true;

export const deployData = {
  now: toUnixTime(),
  initBalance: toWei(323_000, erc20Decimals),
};

export const deployParams = {
  attempts: 1,
  delay: 0,
};
