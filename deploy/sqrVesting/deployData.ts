import { toUnixTime, toWei } from '~common';
import { tokenDecimals } from '~seeds';

export const verifyRequired = false;
export const verifyArgsRequired = true;

export const deployData = {
  now: toUnixTime(),
  initBalance: toWei(323_000, tokenDecimals),
};

export const deployParams = {
  attempts: 1,
  delay: 0,
};
