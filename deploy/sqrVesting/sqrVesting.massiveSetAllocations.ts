import { readFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { chunk } from 'lodash';
import { basename } from 'path';
import { bigIntSum, convertContentToArray2D, toNumberDecimalsFixed, toWeiWithFixed } from '~common';
import { callWithTimerHre, retry } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext, getERC20TokenContext, getUsers } from '~utils';
import {
  CELL_SEPARATOR,
  DEPOSIT_CONTRACT_ADDRESS,
  LINE_SEPARATOR,
  SOURCE_NUMBER_DELIMITER,
  TARGET_NUMBER_DELIMITER,
} from '../constants';
import { AllocationRecord } from '../types';
import { getExchangeDir, getFundsFileName } from '../utils';

const ADDRESS_COLUMN_INDEX = 0;
const AMOUNT_COLUMN_INDEX = 1;

const CHUNK_SIZE = 100;
const RETRY_ATTEMPTS = 5;

const ALLOCATION_TOTAL_LIMIT = -1;
const SIMULATE = false;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting allocations in batches...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const users = await getUsers();
    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { owner2SQRVesting } = context;
    const erc20Token = await owner2SQRVesting.erc20Token();
    const { owner2ERC20Token } = await getERC20TokenContext(users, erc20Token);
    const decimals = Number(await owner2ERC20Token.decimals());

    const exchangeDir = getExchangeDir();
    const sourcePath = getFundsFileName(exchangeDir, DEPOSIT_CONTRACT_ADDRESS);
    console.log(`Source file: ${basename(sourcePath)}`);
    const content = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });

    let rawRecords = convertContentToArray2D(content, LINE_SEPARATOR, CELL_SEPARATOR);
    rawRecords.shift();

    if (ALLOCATION_TOTAL_LIMIT > 1) {
      rawRecords = rawRecords.splice(0, ALLOCATION_TOTAL_LIMIT);
    }

    const allocationRecords: AllocationRecord[] = [];

    rawRecords.forEach((row) => {
      if (row.length < 2) {
        return;
      }

      const rawAddress = row[ADDRESS_COLUMN_INDEX];
      const rawAmount = row[AMOUNT_COLUMN_INDEX];

      const allocationRecord: AllocationRecord = {
        address: rawAddress,
        amount: toWeiWithFixed(
          Number(
            rawAmount.replace('\r', '').replace(TARGET_NUMBER_DELIMITER, SOURCE_NUMBER_DELIMITER),
          ),
          decimals,
        ),
      };

      allocationRecords.push(allocationRecord);
    });
    const allocationLength = allocationRecords.length;

    const totalAllocatedInFile = bigIntSum(allocationRecords, (allocation) => allocation.amount);

    let totalExistCount = 0;
    let totalNewAllocationCount = 0;

    const allocationChunks = chunk(allocationRecords, CHUNK_SIZE);

    for (let i = 0; i < allocationChunks.length; i++) {
      let existCount = 0;
      const allocationChunk = allocationChunks[i];
      const addresses = allocationChunk.map((allocation) => allocation.address);
      const chunkPrefix = Math.min(allocationLength, (i + 1) * CHUNK_SIZE);
      const prefix = `${chunkPrefix}/${allocationLength}`;
      try {
        const claimInfoRecords: Record<string, bigint> = {};

        await Promise.all(
          addresses.map(async (address) => {
            const claimInfo = await owner2SQRVesting.fetchClaimInfo(address);
            claimInfoRecords[address] = claimInfo.amount;
            return claimInfo;
          }),
        );

        const txAllocationRecords: AllocationRecord[] = [];

        for (const allocation of allocationChunk) {
          if (claimInfoRecords[allocation.address] === allocation.amount) {
            existCount++;
            totalExistCount++;
          } else {
            txAllocationRecords.push(allocation);
          }
        }

        const txAllocationRecordsLength = txAllocationRecords.length;

        if (txAllocationRecordsLength > 0) {
          const recipients = txAllocationRecords.map((allocation) => allocation.address);
          const amounts = txAllocationRecords.map((allocation) => allocation.amount);
          await retry({
            fn: async () => {
              if (SIMULATE) {
                console.log(recipients, amounts);
              } else {
                await owner2SQRVesting.setAllocations(recipients, amounts, TX_OVERRIDES);
              }
            },
            maxAttempts: RETRY_ATTEMPTS,
            printError: true,
          });
          totalNewAllocationCount += txAllocationRecordsLength;
        }

        console.log(
          `${prefix} proceed: exists: ${existCount}, new allocations: ${txAllocationRecordsLength}`,
        );
      } catch (err: any) {
        console.log(`error for ${chunkPrefix} chunk, ${err?.message}`);
      }
    }

    console.log(
      `Total allocations exist: ${totalExistCount}/${allocationLength}, new allocations: ${totalNewAllocationCount}`,
    );

    const totalAllocatedInContract = await owner2SQRVesting.totalAllocated();
    const diffTotalAllocated = totalAllocatedInFile - totalAllocatedInContract;

    console.log(
      `Total allocated in file: ${toNumberDecimalsFixed(totalAllocatedInFile, decimals)}, total allocated in contract: ${toNumberDecimalsFixed(totalAllocatedInContract, decimals)}, diff: ${diffTotalAllocated}`,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:massive-set-allocations`];

export default func;
