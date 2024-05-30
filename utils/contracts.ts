import { TokenAddressDescription } from '~common-contract';
import { ONE_HUNDRED_PERCENT, PERCENT_DIVIDER, TOKENS_DESCRIPTIONS } from '~constants';

export function calculatePercentFromContract(percent: bigint): bigint {
  return BigInt(percent) / PERCENT_DIVIDER;
}

export function calculatePercentForContract(percent: number, divider = 1_000_000): bigint {
  return (BigInt(percent * divider) * PERCENT_DIVIDER) / BigInt(divider);
}

export function calculateAllocation(allocation: bigint, contractPercent: bigint): bigint {
  const percent = calculatePercentFromContract(contractPercent);
  return (allocation * percent) / ONE_HUNDRED_PERCENT;
}

export function getTokenDescription(address: string): TokenAddressDescription {
  const tokenDescription = TOKENS_DESCRIPTIONS[address];

  return {
    ...tokenDescription,
    address,
  };
}
