import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitBeforeTx, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployParams } from './deployData';

const newOwner = '0xcA50a11269E04c289c604ACFF3bc775699384912';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is transferring ownership...`);

    // const users = await getUsers();
    // const { ownerAddress } = users;

    const params = {
      newOwner,
    };

    console.table(params);

    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, web3VestingAddress);
    const { owner2WEB3Vesting, web3VestingFactory } = context;
    await waitBeforeTx();
    await waitTx(
      owner2WEB3Vesting.transferOwnership(params.newOwner),
      'transferOwnership',
      deployParams.attempts,
      deployParams.delay,
      web3VestingFactory,
    );
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:transfer-ownership`];

export default func;
