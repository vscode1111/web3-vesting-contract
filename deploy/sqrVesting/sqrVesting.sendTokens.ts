import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getContext, getUsers } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const users = await getUsers();
    const { user1Address } = users;
    const { erc20TokenAddress, sqrVestingAddress } = getAddressesFromHre(hre);

    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { user1ERC20Token } = context;

    const to = sqrVestingAddress;
    console.log(`${SQR_VESTING_NAME} ${user1Address} transfers to ${to} ...`);

    const params = {
      to,
      amount: deployData.initBalance,
    };

    console.table(params);
    await waitTx(user1ERC20Token.transfer(params.to, params.amount, TX_OVERRIDES), 'transfer');
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:send-tokens`];

export default func;
