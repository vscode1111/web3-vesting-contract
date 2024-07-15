import { readFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { chunk } from 'lodash';
import { bigIntSum, convertContentToArray2D, toNumberDecimalsFixed, toWeiWithFixed } from '~common';
import { callWithTimerHre, retry } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext, getERC20TokenContext, getUsers } from '~utils';
import { getExchangeDir } from '../utils';
import {
  BASIC_NUMBER_DELIMITER,
  CELL_SEPARATOR,
  LINE_SEPARATOR,
  TARGET_NUMBER_DELIMITER,
} from './constants';
import { AllocationRecord } from './types';

const CHUNK_SIZE = 100;

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
    const sourcePath = `${exchangeDir}/allocations.csv`;
    const content = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });

    const rawRecords = convertContentToArray2D(content, LINE_SEPARATOR, CELL_SEPARATOR);
    rawRecords.shift();

    const allocationRecords: AllocationRecord[] = [];

    rawRecords.forEach((row) => {
      if (row.length < 2) {
        return;
      }

      const rawAddress = row[0];
      const rawAmount = row[1];

      const allocationRecord: AllocationRecord = {
        address: rawAddress,
        amount: toWeiWithFixed(
          Number(
            rawAmount.replace('\r', '').replace(TARGET_NUMBER_DELIMITER, BASIC_NUMBER_DELIMITER),
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
      const chunkIndex = i + 1;
      const prefix = `${chunkIndex * CHUNK_SIZE}/${allocationLength}`;
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
            fn: () => owner2SQRVesting.setAllocations(recipients, amounts, TX_OVERRIDES),
            maxAttempts: 5,
            printError: true,
          });
          totalNewAllocationCount += txAllocationRecordsLength;
        }

        console.log(
          `${prefix} proceed: exists: ${existCount}, new allocations: ${txAllocationRecordsLength}`,
        );
      } catch (err: any) {
        console.log(`error for ${chunkIndex} chunk, ${err?.message}`);
      }
    }

    console.log(
      `Total allocations exist: ${totalExistCount}/${allocationLength}, new allocation: ${totalNewAllocationCount}`,
    );

    const totalAllocatedInContract = await owner2SQRVesting.getTotalAllocated();
    const diffTotalAllocated = totalAllocatedInFile - totalAllocatedInContract;

    console.log(
      `Total allocated in file: ${toNumberDecimalsFixed(totalAllocatedInFile, decimals)}, total allocated in contract: ${toNumberDecimalsFixed(totalAllocatedInContract, decimals)}, diff: ${diffTotalAllocated}`,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:massive-set-allocations`];

export default func;
