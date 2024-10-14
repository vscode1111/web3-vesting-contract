import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract, waitBeforeTx } from '~common-contract';
import { CONTRACT_NAME, CONTRACT_VERSION, WEB3_VESTING_NAME } from '~constants';
import { contractConfig } from '~seeds';
import { getWEB3VestingContext, getUsers } from '~utils';
import { verifyRequired } from './deployData';
import { formatContractConfig, getContractArgsEx } from './utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    console.log(`${WEB3_VESTING_NAME} is deploying...`);
    console.log(`${CONTRACT_NAME} v${CONTRACT_VERSION}`);
    console.table(formatContractConfig(contractConfig));
    await waitBeforeTx();
    const { web3VestingAddress } = await getWEB3VestingContext(await getUsers(), contractConfig);
    console.log(`${WEB3_VESTING_NAME} deployed to ${web3VestingAddress}`);
    if (verifyRequired) {
      await verifyContract(web3VestingAddress, hre, getContractArgsEx());
      console.log(`${WEB3_VESTING_NAME} deployed and verified to ${web3VestingAddress}`);
    }
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:deploy`];

export default func;
