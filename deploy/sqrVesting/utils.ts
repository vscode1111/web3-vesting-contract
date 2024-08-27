import { DEFAULT_DECIMALS } from '~common';
import { printDate, printDuration, printToken } from '~common-contract';
import { ContractConfig, contractConfig, getContractArgs } from '~seeds';
import { verifyArgsRequired } from './deployData';

export function getContractArgsEx() {
  return verifyArgsRequired ? getContractArgs(contractConfig) : undefined;
}

export function formatContractConfig(contractConfig: ContractConfig) {
  const {
    startDate,
    cliffPeriod,
    firstUnlockPercent,
    unlockPeriodPercent,
    unlockPeriod,
    refundStartDate,
    refundCloseDate,
  } = contractConfig;

  return {
    ...contractConfig,

    startDate: printDate(startDate),
    cliffPeriod: printDuration(cliffPeriod),
    firstUnlockPercent: printToken(firstUnlockPercent, DEFAULT_DECIMALS, '%', 6),
    unlockPeriod: printDuration(unlockPeriod),
    unlockPeriodPercent: printToken(unlockPeriodPercent, DEFAULT_DECIMALS, '%', 6),
    refundStartDate: printDate(refundStartDate),
    refundCloseDate: printDate(refundCloseDate),
  };
}
