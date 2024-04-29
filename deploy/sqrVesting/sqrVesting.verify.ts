import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common';
import { SQR_VESTING_NAME } from '~constants';
import { getAddressesFromHre } from '~utils';
import { getContractArgsEx } from './utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress: erc20TokenAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${erc20TokenAddress} is verify...`);
    const contractArg = getContractArgsEx();
    console.table(contractArg);
    await verifyContract(erc20TokenAddress, hre, getContractArgsEx());
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:verify`];

export default func;
