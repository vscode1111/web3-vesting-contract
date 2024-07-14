import { DEFAULT_DECIMALS } from '~common';
import { printDate, printToken } from '~common-contract';
import { ContractConfig, contractConfig, getContractArgs } from '~seeds';
import { verifyArgsRequired } from './deployData';

export function getContractArgsEx() {
  return verifyArgsRequired ? getContractArgs(contractConfig) : undefined;
}

export function formatContractConfig(contractConfig: ContractConfig) {
  const { startDate, firstUnlockPercent, unlockPeriodPercent } = contractConfig;

  return {
    ...contractConfig,
    startDate: printDate(startDate),
    firstUnlockPercent: printToken(firstUnlockPercent, DEFAULT_DECIMALS, '%'),
    unlockPeriodPercent: printToken(unlockPeriodPercent, DEFAULT_DECIMALS, '%'),
  };
}
