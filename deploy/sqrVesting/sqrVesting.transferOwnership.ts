import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is transferring ownership...`);

    const users = await getUsers();
    const { ownerAddress } = users;

    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { owner2SQRVesting, sqrVestingFactory } = context;
    await waitTx(
      owner2SQRVesting.transferOwnership(ownerAddress),
      'transferOwnership',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:transfer-ownership`];

export default func;
