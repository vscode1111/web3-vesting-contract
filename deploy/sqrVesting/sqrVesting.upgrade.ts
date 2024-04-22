import { upgrades } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre, getSQRVestingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is upgrading...`);
    const { owner2SqrVestingFactory } = await getSQRVestingContext(
      await getUsers(),
      sqrVestingAddress,
    );
    await upgrades.upgradeProxy(sqrVestingAddress, owner2SqrVestingFactory);
    console.log(`${SQR_VESTING_NAME} upgraded to ${sqrVestingAddress}`);
    if (verifyRequired) {
      await verifyContract(sqrVestingAddress, hre);
      console.log(
        `${SQR_VESTING_NAME} upgraded and verified to ${sqrVestingAddress}`,
      );
    }
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:upgrade`];

export default func;
