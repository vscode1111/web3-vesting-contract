import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Client } from 'pg';
import { checkFilePathSync, convertArray2DToContent, formatDate } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { CELL_SEPARATOR, DEPOSIT_CONTRACT_ADDRESS, LINE_SEPARATOR } from '../constants';
import { getExchangeDir, getProRataFileName, getTxUrl, toCsvNumber } from '../utils';
//@ts-ignore
import dbClientConfig from './dbClientConfig.json';

interface ProRataDeposit {
  account: string;
  baseAmount: number;
  isBoost: boolean;
  boostAmount: number;
  boostExchangeRate: number;
  timestamp: Date;
  transactionHash: string;
}

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(
      `${SQR_VESTING_NAME} ${sqrVestingAddress} is generating allocations from ${dbClientConfig.database} DB ...`,
    );
    const client = new Client(dbClientConfig);
    await client.connect();

    // const { rows, rowCount } = await client.query(
    //   'SELECT account as address, SUM(amount) as amount FROM payment_gateway_transaction_items WHERE contract = $1::text GROUP BY account',
    //   [DEPOSIT_CONTRACT_ADDRESS],
    // );

    const { rows, rowCount } = await client.query(
      'SELECT account, "baseAmount", "isBoost", "boostAmount", "boostExchangeRate", timestamp, "transactionHash" FROM pro_rata_transaction_items WHERE contract = $1::text',
      [DEPOSIT_CONTRACT_ADDRESS],
    );

    console.log(`Retried ${rowCount} rows from DB`);

    const paymentGatewayDeposit = rows as ProRataDeposit[];

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [
      [
        'Wallet',
        'baseAmount',
        'isBoost',
        'boostExchangeRate',
        'boostAmount',
        'timestamp',
        'transactionHash',
      ],
    ];

    formattedData.push(
      ...paymentGatewayDeposit.map(
        ({
          account,
          baseAmount,
          isBoost,
          boostAmount,
          boostExchangeRate,
          timestamp,
          transactionHash,
        }) => {
          return [
            account,
            toCsvNumber(baseAmount),
            String(isBoost),
            toCsvNumber(boostExchangeRate),
            toCsvNumber(boostAmount),
            formatDate(timestamp),
            getTxUrl(transactionHash),
          ];
        },
      ),
    );

    writeFileSync(
      getProRataFileName(exchangeDir, DEPOSIT_CONTRACT_ADDRESS),
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch-allocations-from-db`];

export default func;
