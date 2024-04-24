import { DAYS, PERCENT_DIVIDER } from '~constants';

export function calculateDurationInDays(duration: bigint | number): number {
  return Number(duration) / DAYS;
}

export function calculateDaysFromContract(duration: bigint): number {
  return Number(duration) / DAYS;
}

export function calculatePercentFromContract(percent: bigint): bigint {
  return BigInt(percent) / PERCENT_DIVIDER;
}

export function calculatePercentForContract(percent: number): bigint {
  return BigInt(percent) * PERCENT_DIVIDER;
}
