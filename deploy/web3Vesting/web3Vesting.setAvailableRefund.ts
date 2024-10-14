import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getWEB3VestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is setting availability for refund ...`);

    const users = await getUsers();
    const { owner2WEB3Vesting, web3VestingFactory } = await getWEB3VestingContext(
      users,
      web3VestingAddress,
    );

    const params = {
      value: true,
    };

    console.table(params);

    await waitTx(
      owner2WEB3Vesting.setAvailableRefund(params.value, TX_OVERRIDES),
      'setAvailableRefund',
      deployParams.attempts,
      deployParams.delay,
      web3VestingFactory,
    );
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:set-available-refund`];

export default func;
