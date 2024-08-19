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
  printClaimInfo,
} from '~utils';

const _userAddress = '0x2C5459BB28254cc96944c50090f4Bd0eF045A937';

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is fetching...`);
    const users = await getUsers();
    const { owner2SQRVesting } = await getSQRVestingContext(users, sqrVestingAddress);
    const erc20Token = await owner2SQRVesting.erc20Token();
    const { ownerERC20Token } = await getERC20TokenContext(users, erc20Token);
    const decimals = Number(await ownerERC20Token.decimals());
    const tokenName = await ownerERC20Token.name();

    const { user1Address } = users;
    const userAddress = user1Address;
    // const userAddress = _userAddress;

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
      allocationCount: Number(await owner2SQRVesting.getAllocationCount()),
      requiredAmount: printToken(
        await owner2SQRVesting.calculatedRequiredAmount(),
        decimals,
        tokenName,
      ),
      excessAmount: printToken(await owner2SQRVesting.calculateExcessAmount(), decimals, tokenName),
      passedPeriod: Number(await owner2SQRVesting.calculatePassedPeriod()),
      maxPeriod: Number(await owner2SQRVesting.calculateMaxPeriod()),
      finishDate: printDate(await owner2SQRVesting.calculateFinishDate()),
      info: printClaimInfo(await owner2SQRVesting.fetchClaimInfo(userAddress), decimals, tokenName),
    };

    console.log(result);
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:fetch`];

export default func;
