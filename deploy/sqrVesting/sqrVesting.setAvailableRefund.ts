import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getSQRVestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting availability for refund ...`);

    const users = await getUsers();
    const { owner2SQRVesting, sqrVestingFactory } = await getSQRVestingContext(
      users,
      sqrVestingAddress,
    );

    const params = {
      value: true,
    };

    console.table(params);

    await waitTx(
      owner2SQRVesting.setAvailableRefund(params.value, TX_OVERRIDES),
      'setAvailableRefund',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:set-available-refund`];

export default func;
