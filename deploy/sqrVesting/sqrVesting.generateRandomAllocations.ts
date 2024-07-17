import { ethers } from 'ethers';
import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { checkFilePathSync, convertArray2DToContent } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import {
  BASIC_NUMBER_DELIMITER,
  CELL_SEPARATOR,
  LINE_SEPARATOR,
  TARGET_NUMBER_DELIMITER,
} from '../constants';
import { AllocationFileRecord } from '../types';
import { getExchangeDir } from '../utils';

const ALLOCATION_COUNT = 100;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is generating random allocations...`);
    const exchangeDir = getExchangeDir();

    checkFilePathSync(exchangeDir);

    const allocationFileRecords: AllocationFileRecord[] = [];

    for (let i = 0; i < ALLOCATION_COUNT; i++) {
      allocationFileRecords.push({
        address: ethers.Wallet.createRandom().address,
        amount: i * 10 + 0.123456789012345,
      });
    }

    let formattedData: string[][] = [['Address', 'Amount']];

    formattedData.push(
      ...allocationFileRecords.map(({ address, amount }) => [
        address,
        String(amount).replace(BASIC_NUMBER_DELIMITER, TARGET_NUMBER_DELIMITER),
      ]),
    );

    writeFileSync(
      `${exchangeDir}/allocations.csv`,
      convertArray2DToContent(formattedData, LINE_SEPARATOR, CELL_SEPARATOR),
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:generate-random-allocations`];

export default func;
