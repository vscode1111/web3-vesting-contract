import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toUnixTime } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { now } from '~seeds';
import { getAddressesFromHre, getSQRVestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting refund start date ...`);

    const users = await getUsers();
    const { owner2SQRVesting, sqrVestingFactory } = await getSQRVestingContext(
      users,
      sqrVestingAddress,
    );

    const params = {
      value: toUnixTime(now.add(5, 'seconds').toDate()),
    };

    console.table(params);

    await waitTx(
      owner2SQRVesting.setRefundStartDate(params.value, TX_OVERRIDES),
      'setRefundStartDate',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:set-refund-start-date`];

export default func;
