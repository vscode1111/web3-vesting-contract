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
import { SQR_VESTING_NAME } from '~constants';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { getAddressesFromHre, getERC20TokenContext, getSQRVestingContext, getUsers } from '~utils';
import { BYPASS_VESTING_CONTRACT_CHECK, CELL_SEPARATOR, LINE_SEPARATOR } from '../constants';
import { VestingAllocationRecord } from '../types';
import {
  getExchangeDir,
  getVestingFileName,
  toCsvDate,
  toCsvNumber,
  toDateNotNull,
} from '../utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} is fetching allocation data from ${sqrVestingAddress} ...`);
    const users = await getUsers();
    const { owner2SQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);

    const isAfterRefundCloseDate = await owner2SQRVesting.isAfterRefundCloseDate();
    if (!BYPASS_VESTING_CONTRACT_CHECK && !isAfterRefundCloseDate) {
      const refundCloseDate = Number(await owner2SQRVesting.refundCloseDate());
      console.error(
        `Contract isn't ready for fetching data. Close date: ${printDate(refundCloseDate)}`,
      );
      return;
    }

    const erc20Token = await owner2SQRVesting.erc20Token();

    let tokenContext: ERC20Token | null = null;
    if (erc20Token !== ZeroAddress) {
      tokenContext = (await getERC20TokenContext(users, erc20Token)).owner2ERC20Token;
    }

    let [rawAccountCount, totalAllocated, rawDecimals = DEFAULT_DECIMALS] = await Promise.all([
      owner2SQRVesting.getAccountCount(),
      owner2SQRVesting.totalAllocated(),
      tokenContext?.decimals(),
    ]);

    const accountCount = Number(rawAccountCount);
    const decimals = Number(rawDecimals);

    console.log(`Account count: ${accountCount}`);

    const vestingAllocationRecords: VestingAllocationRecord[] = [];

    await runConcurrently(async (index) => {
      const account = await owner2SQRVesting.getAccountByIndex(index);
      const {
        amount,
        canClaim,
        claimed,
        claimCount,
        claimedAt,
        available,
        remain,
        nextAvailable,
        nextClaimAt,
        canRefund,
        refunded,
      } = await owner2SQRVesting.fetchClaimInfo(account);

      vestingAllocationRecords[index] = {
        address: account,
        canClaim,
        amount: toNumberDecimals(amount, decimals),
        claimed: toNumberDecimals(claimed, decimals),
        claimCount: Number(claimCount),
        claimedAt: toDateNotNull(claimedAt),
        available: toNumberDecimals(available, decimals),
        remain: toNumberDecimals(remain, decimals),
        nextAvailable: toNumberDecimals(nextAvailable, decimals),
        nextClaimAt: toDateNotNull(nextClaimAt),
        canRefund,
        refunded,
      };
    }, accountCount);

    const totalAllocatedInFile = sumBy(vestingAllocationRecords, (allocation) => allocation.amount);

    const totalAllocatedInContract = toNumberDecimalsFixed(totalAllocated, decimals);
    const diffTotalAllocated = totalAllocatedInFile - totalAllocatedInContract;

    const exchangeDir = getExchangeDir();
    checkFilePathSync(exchangeDir);

    let formattedData: string[][] = [
      [
        'Wallet',
        'Allocation',
        'Can claim (0/1)',
        'Claimed',
        'Claim count',
        'ClaimedAt',
        'Available',
        'Remain',
        'Next available',
        'Next claim at',
        'Can refund (0/1)',
        'Refunded (0/1)',
      ],
    ];

    formattedData.push(
      ...vestingAllocationRecords.map((depositRefundRecord) => {
        const {
          address,
          amount,
          canClaim,
          claimed,
          claimCount,
          claimedAt,
          available,
          remain,
          nextAvailable,
          nextClaimAt,
          canRefund,
          refunded,
        } = depositRefundRecord;

        return [
          address,
          toCsvNumber(amount),
          booleanToStringNumber(canClaim),
          toCsvNumber(claimed),
          toCsvNumber(claimCount),
          toCsvDate(claimedAt),
          toCsvNumber(available),
          toCsvNumber(remain),
          toCsvNumber(nextAvailable),
          toCsvDate(nextClaimAt),
          booleanToStringNumber(canRefund),
          booleanToStringNumber(refunded),
        ];
      }),
    );

    writeFileSync(
      getVestingFileName(exchangeDir, sqrVestingAddress),
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );

    console.log(
      `Total allocated in file: ${totalAllocatedInFile}, total allocated in contract: ${totalAllocatedInContract}, diff: ${diffTotalAllocated}`,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch-allocations`];

export default func;
