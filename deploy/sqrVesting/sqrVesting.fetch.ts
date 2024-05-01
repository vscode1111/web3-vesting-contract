import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre, getSQRVestingContext, getUsers, printClaimInfo } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = await getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is fetching...`);
    const users = await getUsers();
    const { user1Address } = users;
    const { owner2SQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);

    const result = {
      owner: await owner2SQRVesting.owner(),
      info: printClaimInfo(await owner2SQRVesting.fetchClaimInfo(user1Address)),
    };

    console.log(result);
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch`];

export default func;
