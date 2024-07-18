import appRoot from 'app-root-path';
import { SOURCE_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER } from './constants';

export function getExchangeDir() {
  return `${appRoot.toString()}/exchange`;
}

export function toCsvNumber(value: number) {
  return String(value).replace(SOURCE_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER);
}

export function getFundsFileName(exchangeDir: string, contractAddress: string) {
  return `${exchangeDir}/funds-${contractAddress}.csv`;
}
