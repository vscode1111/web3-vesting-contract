import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, printDate, printToken } from '~common-contract';
import { DEFAULT_DECIMALS } from '~common/constants';
import { SQR_VESTING_NAME } from '~constants';
import {
  getAddressesFromHre,
  getERC20TokenContext,
  getSQRVestingContext,
  getUsers,
  printUserInfo,
} from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is fetching...`);
    const users = await getUsers();
    const { owner2SQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);
    const erc20Token = await owner2SQRVesting.erc20Token();
    const { ownerERC20Token } = await getERC20TokenContext(users, erc20Token);

    const [decimals, tokenName] = await Promise.all([
      ownerERC20Token.decimals(),
      ownerERC20Token.name(),
    ]);

    const { user1Address, user2Address, user3Address } = users;

    const result = {
      owner: await owner2SQRVesting.owner(),
      erc20Token: await owner2SQRVesting.erc20Token(),
      startDate: printDate(await owner2SQRVesting.startDate()),
      cliffPeriod: await owner2SQRVesting.cliffPeriod(),
      firstUnlockPercent: printToken(
        await owner2SQRVesting.firstUnlockPercent(),
        DEFAULT_DECIMALS,
        '%',
      ),
      unlockPeriod: await owner2SQRVesting.unlockPeriod(),
      unlockPeriodPercent: printToken(
        await owner2SQRVesting.unlockPeriodPercent(),
        DEFAULT_DECIMALS,
        '%',
      ),
      availableRefund: await owner2SQRVesting.availableRefund(),
      refundStartDate: printDate(await owner2SQRVesting.refundStartDate()),
      refundCloseDate: printDate(await owner2SQRVesting.refundCloseDate()),
      //Custom
      balance: printToken(await owner2SQRVesting.getBalance(), decimals, tokenName),
      allocationCount: Number(await owner2SQRVesting.allocationCount()),
      refundCount: Number(await owner2SQRVesting.refundCount()),
      requiredAmount: printToken(
        await owner2SQRVesting.calculatedRequiredAmount(),
        decimals,
        tokenName,
      ),
      excessAmount: printToken(await owner2SQRVesting.calculateExcessAmount(), decimals, tokenName),
      totalClaimed: printToken(await owner2SQRVesting.totalClaimed(), decimals, tokenName),
      passedPeriod: Number(await owner2SQRVesting.calculatePassedPeriod()),
      maxPeriod: Number(await owner2SQRVesting.calculateMaxPeriod()),
      finishDate: printDate(await owner2SQRVesting.calculateFinishDate()),
    };

    const contractInfo = {
      name: await owner2SQRVesting.getContractName(),
      version: await owner2SQRVesting.getContractVersion(),
    };
    console.log(`${contractInfo.name} v${contractInfo.version}`);
    console.table(result);

    await printUserInfo(user1Address, owner2SQRVesting, decimals, tokenName);
    await printUserInfo(user2Address, owner2SQRVesting, decimals, tokenName);
    await printUserInfo(user3Address, owner2SQRVesting, decimals, tokenName);
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch`];

export default func;
