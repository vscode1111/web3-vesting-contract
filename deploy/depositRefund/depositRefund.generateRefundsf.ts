import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { checkFilePathSync, convertArray2DToContent, toNumberDecimals } from '~common';
import { callWithTimerHre, runConcurrently } from '~common-contract';
import { DEPOSIT_REFUND_NAME } from '~constants';
import { getDepositRefundContext, getUsers } from '~utils';
import {
  CELL_SEPARATOR,
  DEPOSIT_CONTRACT,
  LINE_SEPARATOR,
  VESTING_TOKEN_PRICE,
} from '../constants';
import { DepositRefundRecord } from '../types';
import { getExchangeDir, toCsvNumber } from '../utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${DEPOSIT_REFUND_NAME} ${DEPOSIT_CONTRACT} is fetching deposit/refund data ...`);

    const users = await getUsers();

    const { owner2DepositRefund } = await getDepositRefundContext(users, DEPOSIT_CONTRACT);

    let [rawAccountCount, { baseDecimals, boostDecimals }] = await Promise.all([
      owner2DepositRefund.getAccountCount(),
      owner2DepositRefund.getDepositRefundTokensInfo(),
    ]);

    const accountCount = Number(rawAccountCount);

    console.log(`Account count: ${accountCount}`);

    const depositRefundRecords: DepositRefundRecord[] = [];

    await runConcurrently(async (index) => {
      const account = await owner2DepositRefund.getAccountByIndex(index);
      const { baseDeposited, boosted, baseAllocation, baseRefund, boostRefund, nonce } =
        await owner2DepositRefund.getDepositRefundAccountInfo(account);

      depositRefundRecords[index] = {
        address: account,
        boosted,
        baseDeposited: toNumberDecimals(baseDeposited, baseDecimals),
        baseAllocation: toNumberDecimals(baseAllocation, baseDecimals),
        baseRefund: toNumberDecimals(baseRefund, baseDecimals),
        boostRefund: toNumberDecimals(boostRefund, boostDecimals),
        nonce: Number(nonce),
      };
    }, accountCount);

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [
      [
        'Address',
        'Base deposited',
        'Boosted',
        'Base Allocation',
        'Base refund',
        'Boost refund',
        'Nonce',
        'Vesting amount',
      ],
    ];

    formattedData.push(
      ...depositRefundRecords.map(
        ({ address, baseDeposited, boosted, baseAllocation, baseRefund, boostRefund, nonce }) => {
          return [
            address,
            toCsvNumber(baseDeposited),
            boosted ? 'true' : 'false',
            toCsvNumber(baseAllocation),
            toCsvNumber(baseRefund),
            toCsvNumber(boostRefund),
            toCsvNumber(nonce),
            toCsvNumber(baseAllocation / VESTING_TOKEN_PRICE),
          ];
        },
      ),
    );

    writeFileSync(
      `${exchangeDir}/deposit-refund-${DEPOSIT_CONTRACT}.csv`,
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${DEPOSIT_REFUND_NAME}:fetch-deposit-refund-info`];

export default func;
