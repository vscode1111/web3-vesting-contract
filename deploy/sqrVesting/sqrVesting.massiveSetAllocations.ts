import { readFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { chunk } from 'lodash';
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
import { DepositAllocationRecord } from '../types';
import { getExchangeDir, getFundsFileName } from '../utils';

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
    const sourcePath = getFundsFileName(exchangeDir, DEPOSIT_CONTRACT_ADDRESS);
    console.log(`Source file: ${sourcePath}`);
    const content = readFileSync(sourcePath, { encoding: 'utf8', flag: 'r' });

    const rawRecords = convertContentToArray2D(content, LINE_SEPARATOR, CELL_SEPARATOR);
    rawRecords.shift();

    const allocationRecords: DepositAllocationRecord[] = [];

    rawRecords.forEach((row) => {
      if (row.length < 2) {
        return;
      }

      const rawAddress = row[0];
      const rawAmount = row[7];

      const allocationRecord: DepositAllocationRecord = {
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

        const txAllocationRecords: DepositAllocationRecord[] = [];

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
