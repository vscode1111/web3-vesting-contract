import appRoot from 'app-root-path';
import { BASIC_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER } from './constants';

export function getExchangeDir() {
  return `${appRoot.toString()}/exchange`;
}

export function toCsvNumber(value: number) {
  return String(value).replace(BASIC_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER);
}
