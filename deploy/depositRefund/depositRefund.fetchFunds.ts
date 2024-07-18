import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { checkFilePathSync, convertArray2DToContent, toNumberDecimals } from '~common';
import { callWithTimerHre, runConcurrently } from '~common-contract';
import { DEPOSIT_REFUND_NAME } from '~constants';
import { getDepositRefundContext, getUsers } from '~utils';
import {
  CELL_SEPARATOR,
  DEPOSIT_CONTRACT_ADDRESS,
  LINE_SEPARATOR,
  VESTING_TOKEN_PRICE,
} from '../constants';
import { DepositRefundRecord } from '../types';
import { getExchangeDir, getFundsFileName, toCsvNumber } from '../utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(
      `${DEPOSIT_REFUND_NAME} is fetching funds data from ${DEPOSIT_CONTRACT_ADDRESS} ...`,
    );
    const { owner2DepositRefund } = await getDepositRefundContext(
      await getUsers(),
      DEPOSIT_CONTRACT_ADDRESS,
    );

    const isFetchReady = await owner2DepositRefund.getDepositRefundFetchReady();
    if (!isFetchReady) {
      console.error(`Contract isn't ready for fetching data`);
      return;
    }

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
        'Base allocation',
        'Base refund',
        'Boost refund',
        'Nonce',
        'Vesting allocation',
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
      getFundsFileName(exchangeDir, DEPOSIT_CONTRACT_ADDRESS),
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${DEPOSIT_REFUND_NAME}:fetch-funds`];

export default func;
