import appRoot from 'app-root-path';
import { formatDate, toDate } from '~common';
import { SOURCE_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER } from './constants';

export function getExchangeDir() {
  return `${appRoot.toString()}/exchange`;
}

export function toCsvNumber(value: number) {
  return String(value).replace(SOURCE_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER);
}

export function toDateNotNull(value: bigint) {
  return value !== BigInt(0) ? toDate(value) : undefined;
}

export function toCsvDate(value?: Date) {
  return value ? formatDate(value) : '';
}

export function getFundsFileName(exchangeDir: string, contractAddress: string) {
  return `${exchangeDir}/funds-${contractAddress}.csv`;
}

export function getProRataFileName(exchangeDir: string, contractAddress: string) {
  return `${exchangeDir}/pro-rata-${contractAddress}.csv`;
}

export function getVestingFileName(exchangeDir: string, contractAddress: string) {
  return `${exchangeDir}/vesting-${contractAddress}.csv`;
}

export function getTxUrl(tx: string) {
  return `https://bscscan.com/tx/${tx}`;
}
