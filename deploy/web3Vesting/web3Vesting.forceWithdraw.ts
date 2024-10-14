import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getERC20TokenContext, getWEB3VestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is withdrawing to user...`);

    const users = await getUsers();
    const { user3Address } = users;

    const { owner2WEB3Vesting, web3VestingFactory } = await getWEB3VestingContext(
      users,
      web3VestingAddress,
    );

    const erc20TokenAddress = await owner2WEB3Vesting.erc20Token();

    const { owner2ERC20Token } = await getERC20TokenContext(users, erc20TokenAddress);

    const [decimals, tokenName] = await Promise.all([
      owner2ERC20Token.decimals(),
      owner2ERC20Token.name(),
    ]);

    const amount = await owner2WEB3Vesting.getBalance();
    console.log(`${toNumberDecimals(amount, decimals)} ${tokenName} in contract`);

    const params = {
      token: erc20TokenAddress,
      to: user3Address,
      amount,
    };

    console.table(params);

    await waitTx(
      owner2WEB3Vesting.forceWithdraw(params.token, params.to, params.amount, TX_OVERRIDES),
      'forceWithdraw',
      deployParams.attempts,
      deployParams.delay,
      web3VestingFactory,
    );
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:force-withdraw`];

export default func;
