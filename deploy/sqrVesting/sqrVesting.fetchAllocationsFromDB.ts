import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Client } from 'pg';
import { checkFilePathSync, convertArray2DToContent } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import {
  CELL_SEPARATOR,
  DEPOSIT_CONTRACT_ADDRESS,
  LINE_SEPARATOR,
  VESTING_TOKEN_PRICE,
} from '../constants';
import { getExchangeDir, toCsvNumber } from '../utils';
//@ts-ignore
import dbClientConfig from './dbClientConfig.json';

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
      [DEPOSIT_CONTRACT_ADDRESS],
    );

    console.log(`Retried ${rowCount} rows from DB`);

    const paymentGatewayDeposit = rows as PaymentGatewayDeposit[];

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [['Address', 'Amount']];

    formattedData.push(
      ...paymentGatewayDeposit.map(({ address, amount }) => {
        const finalAmount = amount / VESTING_TOKEN_PRICE;
        return [address, toCsvNumber(finalAmount)];
      }),
    );

    writeFileSync(
      `${exchangeDir}/allocations.csv`,
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch-allocations-from-db`];

export default func;
