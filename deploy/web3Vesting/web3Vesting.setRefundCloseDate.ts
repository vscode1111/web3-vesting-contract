import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toUnixTime } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { now } from '~seeds';
import { getAddressesFromHre, getWEB3VestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is setting refund close date ...`);

    const users = await getUsers();
    const { owner2WEB3Vesting, web3VestingFactory } = await getWEB3VestingContext(
      users,
      web3VestingAddress,
    );

    const params = {
      value: toUnixTime(now.add(30, 'seconds').toDate()),
    };

    console.table(params);

    await waitTx(
      owner2WEB3Vesting.setRefundCloseDate(params.value, TX_OVERRIDES),
      'setRefundCloseDate',
      deployParams.attempts,
      deployParams.delay,
      web3VestingFactory,
    );
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:set-refund-close-date`];

export default func;
