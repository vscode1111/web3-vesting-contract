import { ZeroAddress } from 'ethers';
import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { sumBy } from 'lodash';
import {
  DEFAULT_DECIMALS,
  booleanToStringNumber,
  checkFilePathSync,
  convertArray2DToContent,
  toNumberDecimals,
  toNumberDecimalsFixed,
} from '~common';
import { callWithTimerHre, printDate, runConcurrently } from '~common-contract';
import { DEPOSIT_REFUND_NAME } from '~constants';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { getDepositRefundContext, getERC20TokenContext, getUsers } from '~utils';
import {
  BYPASS_CONTRACT_CHECK,
  CELL_SEPARATOR,
  DEPOSIT_CONTRACT_ADDRESS,
  DEPOSIT_FIELD_FOR_VESTING_ALLOCATION,
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
    const users = await getUsers();
    const { owner2DepositRefund } = await getDepositRefundContext(users, DEPOSIT_CONTRACT_ADDRESS);

    const isFetchReady = await owner2DepositRefund.getDepositRefundFetchReady();
    if (!BYPASS_CONTRACT_CHECK && !isFetchReady) {
      const closeDate = Number(await owner2DepositRefund.getCloseDate());
      console.error(`Contract isn't ready for fetching data. Close date: ${printDate(closeDate)}`);
      return;
    }

    const { baseToken, boostToken } = await owner2DepositRefund.getDepositRefundTokensInfo();

    let baseTokenContext: ERC20Token | null = null;
    if (baseToken !== ZeroAddress) {
      baseTokenContext = (await getERC20TokenContext(users, baseToken)).owner2ERC20Token;
    }

    let boostTokenContext: ERC20Token | null = null;
    if (boostToken !== ZeroAddress) {
      boostTokenContext = (await getERC20TokenContext(users, boostToken)).owner2ERC20Token;
    }

    let [
      rawAccountCount,
      rawBaseDecimals = DEFAULT_DECIMALS,
      rawBoostDecimals = DEFAULT_DECIMALS,
      { totalBaseDeposited },
    ] = await Promise.all([
      owner2DepositRefund.getAccountCount(),
      baseTokenContext?.decimals(),
      boostTokenContext?.decimals(),
      owner2DepositRefund.getDepositRefundContractInfo(),
    ]);

    const accountCount = Number(rawAccountCount);
    const baseDecimals = Number(rawBaseDecimals);
    const boostDecimals = Number(rawBoostDecimals);

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

    const totalAllocatedInFile = sumBy(
      depositRefundRecords,
      (allocation) => allocation.baseDeposited,
    );

    const totalAllocatedInContract = toNumberDecimalsFixed(totalBaseDeposited, baseDecimals);
    const diffTotalAllocated = totalAllocatedInFile - totalAllocatedInContract;

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [
      [
        'Wallet',
        'Base deposited',
        'Boosted (0/1)',
        'Base allocation',
        'Base refund',
        'Boost refund',
        'Number of deposits',
        'Vesting allocation',
      ],
    ];

    formattedData.push(
      ...depositRefundRecords.map((depositRefundRecord) => {
        const { address, baseDeposited, boosted, baseAllocation, baseRefund, boostRefund, nonce } =
          depositRefundRecord;

        return [
          address,
          toCsvNumber(baseDeposited),
          booleanToStringNumber(boosted),
          toCsvNumber(baseAllocation),
          toCsvNumber(baseRefund),
          toCsvNumber(boostRefund),
          toCsvNumber(nonce),
          toCsvNumber(
            (depositRefundRecord[DEPOSIT_FIELD_FOR_VESTING_ALLOCATION] as number) /
              VESTING_TOKEN_PRICE,
          ),
        ];
      }),
    );

    writeFileSync(
      getFundsFileName(exchangeDir, DEPOSIT_CONTRACT_ADDRESS),
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );

    console.log(
      `Total base deposited in file: ${totalAllocatedInFile}, total base deposited in contract: ${totalAllocatedInContract}, diff: ${diffTotalAllocated}`,
    );
  }, hre);
};

func.tags = [`${DEPOSIT_REFUND_NAME}:fetch-funds`];

export default func;
