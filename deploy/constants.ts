import { DepositRefundRecord } from './types';

export const FRACTION_DIGITS = 6;

export const LINE_SEPARATOR = '\n';
export const CELL_SEPARATOR = ';';
export const SOURCE_NUMBER_DELIMITER = '.';
export const TARGET_NUMBER_DELIMITER = '.';

export const BYPASS_DEPOSIT_CONTRACT_CHECK = true;
export const VESTING_TOKEN_PRICE = 0.08;
export const DEPOSIT_FIELD_FOR_VESTING_ALLOCATION: keyof DepositRefundRecord = 'baseDeposited'; //baseAllocation (default) or baseDeposited (if goal isn't reached)

// export const DEPOSIT_CONTRACT_ADDRESS = '0x73ee8C0cb385a663A411D306b7aa249b59c18d7d'; //Members Exclusive
// export const DEPOSIT_CONTRACT_ADDRESS = '0x46A49a705d8E7a7765dce7e5F4016fBC44DF3fA3'; //Members Exclusive with SQRp
// export const DEPOSIT_CONTRACT_ADDRESS = '0xd4F4c2eE273c0F3611f7f93EA8e8eED4fef6906F'; //Road-to-IDO Exclusive
// export const DEPOSIT_CONTRACT_ADDRESS = '0xf98844b0103a68E58B5ce99415879A1e30AFCAAC'; //Public FCFS
// export const DEPOSIT_CONTRACT_ADDRESS = '0x99518a992cC4d9c51f0ae4B269D45F4e9e33b0b2'; //Public FCFS
// export const DEPOSIT_CONTRACT_ADDRESS = '0x1dA402bD37B479676CbaEAfAD52659eE3Db0F85A'; //Pro-Rata test
// export const DEPOSIT_CONTRACT_ADDRESS = '0xD9eF052d04b6FF606A3Cb89Af86C8D0f61Ff14e7'; //Pro-Rata prod Storm Trade
// export const DEPOSIT_CONTRACT_ADDRESS = '0xce8cDE8a263515426878D5e6572E7981f6BC47Ca'; //Pro-Rata prod Fanton
export const DEPOSIT_CONTRACT_ADDRESS = '0xd1CA8f6aBb2FAE5a35d62C2E9584e49e13fa001C'; //Pro-Rata prod Reformdao

export const BYPASS_VESTING_CONTRACT_CHECK = true;
