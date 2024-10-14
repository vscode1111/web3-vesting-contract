import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  FRACTION_DIGITS,
  callWithTimerHre,
  printDate,
  printDuration,
  printToken,
} from '~common-contract';
import { DEFAULT_DECIMALS } from '~common/constants';
import { WEB3_VESTING_NAME } from '~constants';
import {
  getAddressesFromHre,
  getERC20TokenContext,
  getWEB3VestingContext,
  getUsers,
  printUserInfo,
} from '~utils';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { web3VestingAddress } = getAddressesFromHre(hre);
    console.log(`${WEB3_VESTING_NAME} ${web3VestingAddress} is fetching...`);
    const users = await getUsers();
    const { owner2WEB3Vesting } = await getWEB3VestingContext(users, web3VestingAddress);
    const erc20Token = await owner2WEB3Vesting.erc20Token();
    const { ownerERC20Token } = await getERC20TokenContext(users, erc20Token);

    const [decimals, tokenName] = await Promise.all([
      ownerERC20Token.decimals(),
      ownerERC20Token.name(),
    ]);

    const { user1Address, user2Address, user3Address } = users;

    const result = {
      owner: await owner2WEB3Vesting.owner(),
      erc20Token: await owner2WEB3Vesting.erc20Token(),
      startDate: printDate(await owner2WEB3Vesting.startDate()),
      cliffPeriod: printDuration(await owner2WEB3Vesting.cliffPeriod()),
      firstUnlockPercent: printToken(
        await owner2WEB3Vesting.firstUnlockPercent(),
        DEFAULT_DECIMALS,
        '%',
        FRACTION_DIGITS,
      ),
      unlockPeriod: printDuration(await owner2WEB3Vesting.unlockPeriod()),
      unlockPeriodPercent: printToken(
        await owner2WEB3Vesting.unlockPeriodPercent(),
        DEFAULT_DECIMALS,
        '%',
        FRACTION_DIGITS,
      ),
      availableRefund: await owner2WEB3Vesting.availableRefund(),
      refundStartDate: printDate(await owner2WEB3Vesting.refundStartDate()),
      refundCloseDate: printDate(await owner2WEB3Vesting.refundCloseDate()),
      //Custom
      balance: printToken(await owner2WEB3Vesting.getBalance(), decimals, tokenName),
      allocationCount: Number(await owner2WEB3Vesting.allocationCount()),
      refundCount: Number(await owner2WEB3Vesting.refundCount()),
      requiredAmount: printToken(
        await owner2WEB3Vesting.calculatedRequiredAmount(),
        decimals,
        tokenName,
      ),
      excessAmount: printToken(await owner2WEB3Vesting.calculateExcessAmount(), decimals, tokenName),
      totalClaimed: printToken(await owner2WEB3Vesting.totalClaimed(), decimals, tokenName),
      passedPeriod: Number(await owner2WEB3Vesting.calculatePassedPeriod()),
      maxPeriod: Number(await owner2WEB3Vesting.calculateMaxPeriod()),
      finishDate: printDate(await owner2WEB3Vesting.calculateFinishDate()),
    };

    const contractInfo = {
      name: await owner2WEB3Vesting.getContractName(),
      version: await owner2WEB3Vesting.getContractVersion(),
    };
    console.log(`${contractInfo.name} v${contractInfo.version}`);
    console.table(result);

    await printUserInfo(user1Address, owner2WEB3Vesting, decimals, tokenName);
    await printUserInfo(user2Address, owner2WEB3Vesting, decimals, tokenName);
    await printUserInfo(user3Address, owner2WEB3Vesting, decimals, tokenName);
  }, hre);
};

func.tags = [`${WEB3_VESTING_NAME}:fetch`];

export default func;
