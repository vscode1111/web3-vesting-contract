import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, verifyContract } from '~common-contract';
import { SQR_VESTING_NAME } from '~constants';
import { DeployContractArgs } from '~seeds';
import { getAddressesFromHre, getSQRVestingContext, getUsers } from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is verify...`);
    const users = await getUsers();
    const { owner2SQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);

    const contractArg: DeployContractArgs = [
      {
        newOwner: await owner2SQRVesting.owner(),
        erc20Token: await owner2SQRVesting.erc20Token(),
        startDate: Number(await owner2SQRVesting.startDate()),
        cliffPeriod: Number(await owner2SQRVesting.cliffPeriod()),
        firstUnlockPercent: await owner2SQRVesting.firstUnlockPercent(),
        unlockPeriod: Number(await owner2SQRVesting.unlockPeriod()),
        unlockPeriodPercent: await owner2SQRVesting.unlockPeriodPercent(),
        availableRefund: await owner2SQRVesting.availableRefund(),
        refundStartDate: Number(await owner2SQRVesting.refundStartDate()),
        refundCloseDate: Number(await owner2SQRVesting.refundCloseDate()),
      },
    ];

    if (contractArg) {
      console.table(contractArg[0]);
    }

    await verifyContract(sqrVestingAddress, hre, contractArg);
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:verify`];

export default func;
