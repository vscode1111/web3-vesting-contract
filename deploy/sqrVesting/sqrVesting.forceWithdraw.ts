import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { toNumberDecimals } from '~common';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { getAddressesFromHre, getERC20TokenContext, getSQRVestingContext, getUsers } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is withdrawing to user...`);

    const users = await getUsers();
    const { user3Address } = users;

    const { owner2SQRVesting, sqrVestingFactory } = await getSQRVestingContext(
      users,
      sqrVestingAddress,
    );

    const erc20TokenAddress = await owner2SQRVesting.erc20Token();

    const { owner2ERC20Token } = await getERC20TokenContext(users, erc20TokenAddress);

    const [decimals, tokenName] = await Promise.all([
      owner2ERC20Token.decimals(),
      owner2ERC20Token.name(),
    ]);

    const amount = await owner2SQRVesting.getBalance();
    console.log(`${toNumberDecimals(amount, decimals)} ${tokenName} in contract`);

    const params = {
      token: erc20TokenAddress,
      to: user3Address,
      amount,
    };

    console.table(params);

    await waitTx(
      owner2SQRVesting.forceWithdraw(params.token, params.to, params.amount, TX_OVERRIDES),
      'forceWithdraw',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:force-withdraw`];

export default func;
