import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { WEB3_VESTING_NAME } from '~constants';
import { DeployContractArgs } from '~seeds';
import { getAddressesFromHre, getWEB3VestingContext, getUsers } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is verify...`);
    const users = await getUsers();
    const { owner2WEB3Vesting } = await getWEB3VestingContext(users, web3VestingAddress);

    const contractArg: DeployContractArgs = [
      {
        newOwner: await owner2WEB3Vesting.owner(),
        erc20Token: await owner2WEB3Vesting.erc20Token(),
        startDate: Number(await owner2WEB3Vesting.startDate()),
        cliffPeriod: Number(await owner2WEB3Vesting.cliffPeriod()),
        firstUnlockPercent: await owner2WEB3Vesting.firstUnlockPercent(),
        unlockPeriod: Number(await owner2WEB3Vesting.unlockPeriod()),
        unlockPeriodPercent: await owner2WEB3Vesting.unlockPeriodPercent(),
        availableRefund: await owner2WEB3Vesting.availableRefund(),
        refundStartDate: Number(await owner2WEB3Vesting.refundStartDate()),
        refundCloseDate: Number(await owner2WEB3Vesting.refundCloseDate()),
      },
    ];

    if (contractArg) {
      console.table(contractArg[0]);
    }

    await verifyContract(web3VestingAddress, hre, contractArg);
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:verify`];

export default func;
