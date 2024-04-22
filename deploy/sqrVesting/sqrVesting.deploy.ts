import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, sleep, verifyContract } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getSQRVestingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';
import { getContractArgsEx } from './utils';

const pauseTime = 10;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${SQR_VESTING_NAME} is deploying...`);
    console.table(contractConfig);
    console.log(`Pause ${pauseTime} sec to make sure...`);
    await sleep(pauseTime * 1000);

    console.log(`Deploying...`);
    const { sqrVestingAddress } = await getSQRVestingContext(
      await getUsers(),
      contractConfig,
    );
    console.log(`${SQR_VESTING_NAME} deployed to ${sqrVestingAddress}`);
    if (verifyRequired) {
      await verifyContract(sqrVestingAddress, hre, getContractArgsEx());
      console.log(
        `${SQR_VESTING_NAME} deployed and verified to ${sqrVestingAddress}`,
      );
    }
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:deploy`];

export default func;
