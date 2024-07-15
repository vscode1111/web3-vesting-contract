////@ts-nocheck
import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Client } from 'pg';
import { checkFilePathSync, convertArray2DToContent } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getExchangeDir } from '../utils';
import {
  BASIC_NUMBER_DELIMITER,
  CELL_SEPARATOR,
  LINE_SEPARATOR,
  TARGET_NUMBER_DELIMITER,
} from './constants';
//@ts-ignore
import dbClientConfig from './dbClientConfig.json';

const CONTRACT = '0x5C3A3b2816Fa44F04F668bC23861f7874352a39F';
const VESTING_TOKEN_PRICE = 0.1234;

interface PaymentGatewayDeposit {
  address: string;
  amount: number;
}

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(
      `${SQR_VESTING_NAME} ${sqrVestingAddress} is generating allocations from ${dbClientConfig.database} DB ...`,
    );
    const client = new Client(dbClientConfig);
    await client.connect();

    const { rows, rowCount } = await client.query(
      'SELECT account as address, SUM(amount) as amount FROM payment_gateway_transaction_items WHERE contract = $1::text GROUP BY account',
      [CONTRACT],
    );

    console.log(`Retried ${rowCount} rows from DB`);

    const paymentGatewayDeposit = rows as PaymentGatewayDeposit[];

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [['Address', 'Amount']];

    formattedData.push(
      ...paymentGatewayDeposit.map(({ address, amount }) => {
        const finalAmount = amount / VESTING_TOKEN_PRICE;
        return [
          address,
          String(finalAmount).replace(BASIC_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER),
        ];
      }),
    );

    writeFileSync(
      `${exchangeDir}/allocations.csv`,
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:generate-allocations-from-db`];

export default func;
