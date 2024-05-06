import { ONE_HUNDRED_PERCENT, PERCENT_DIVIDER } from '~constants';

export function calculatePercentFromContract(percent: bigint): bigint {
  return BigInt(percent) / PERCENT_DIVIDER;
}

export function calculatePercentForContract(percent: number): bigint {
  return BigInt(percent) * PERCENT_DIVIDER;
}

export function calculateAllocation(allocation: bigint, contractPercent: bigint): bigint {
  const percent = calculatePercentFromContract(contractPercent);
  return (allocation * percent) / ONE_HUNDRED_PERCENT;
}
