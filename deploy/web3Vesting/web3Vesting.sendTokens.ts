import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getContext, getUsers } from '~utils';
import { deployData } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const users = await getUsers();
    const { user1Address } = users;
    const { erc20TokenAddress, web3VestingAddress } = getAddressesFromHre(hre);

    const context = await getContext(erc20TokenAddress, web3VestingAddress);
    const { user1ERC20Token } = context;

    const to = web3VestingAddress;
    console.log(`${WEB3_VESTING_NAME} ${user1Address} transfers to ${to} ...`);

    const params = {
      to,
      amount: deployData.initBalance,
    };

    console.table(params);
    await waitTx(user1ERC20Token.transfer(params.to, params.amount, TX_OVERRIDES), 'transfer');
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:send-tokens`];

export default func;
