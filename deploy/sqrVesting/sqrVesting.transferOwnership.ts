import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitBeforeTx, waitTx } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployParams } from './deployData';

const newOwner = '0xcA50a11269E04c289c604ACFF3bc775699384912';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is transferring ownership...`);

    // const users = await getUsers();
    // const { ownerAddress } = users;

    const params = {
      newOwner,
    };

    console.table(params);

    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { owner2SQRVesting, sqrVestingFactory } = context;
    await waitBeforeTx();
    await waitTx(
      owner2SQRVesting.transferOwnership(params.newOwner),
      'transferOwnership',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:transfer-ownership`];

export default func;
