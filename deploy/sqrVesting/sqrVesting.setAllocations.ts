import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting allocations...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { user1Address, user2Address, user3Address, owner2SQRVesting, sqrVestingFactory } =
      context;
    const { allocation1, allocation2, allocation3 } = seedData;

    const params = {
      recepients: [user1Address, user2Address, user3Address],
      amounts: [allocation1, allocation2, allocation3],
    };

    console.table(params);

    await waitTx(
      owner2SQRVesting.setAllocations(params.recepients, params.amounts),
      'setAllocations',
      deployParams.attemps,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:set-allocations`];

export default func;
