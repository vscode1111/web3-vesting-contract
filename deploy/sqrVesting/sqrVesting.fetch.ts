import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre, getSQRVestingContext, getUsers } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = await getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is fetching...`);
    const users = await getUsers();
    const { ownerSQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);

    const result = {
      owner: await ownerSQRVesting.owner(),
    };

    console.table(result);
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch`];

export default func;
