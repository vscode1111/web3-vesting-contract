import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { contractConfig } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployParams } from './deployData';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is claiming...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, web3VestingAddress);
    const { user3WEB3Vesting, web3VestingFactory } = context;
    await waitTx(
      user3WEB3Vesting.claim(TX_OVERRIDES),
      'claim',
      deployParams.attempts,
      deployParams.delay,
      web3VestingFactory,
    );
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:claim3`];

export default func;
