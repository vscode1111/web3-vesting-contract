import { ethers } from 'ethers';
import { writeFileSync } from 'fs';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { convertArray2DToContent } from '~common';
import { callWithTimerHre } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getExchangeDir } from '../utils';

const ALLOCATION_COUNT = 1000;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting allocations in batches...`);
    const exchangeDir = getExchangeDir();

    const allocationRecords: { address: string; amount: number }[] = [];

    for (let i = 0; i < ALLOCATION_COUNT; i++) {
      allocationRecords.push({
        address: ethers.Wallet.createRandom().address,
        amount: i * 10 + 0.123456789012345,
      });
    }

    const formattedData = allocationRecords.map(({ address, amount }) => [address, String(amount)]);

    writeFileSync(`${exchangeDir}/allocations.txt`, convertArray2DToContent(formattedData));
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:generate-allocations-file`];

export default func;
