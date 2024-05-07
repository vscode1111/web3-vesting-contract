import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { ZERO } from '~constants';
import { contractConfig } from '~seeds';
import { calculatePercentForContract, getSQRVestingContext, getUsers } from '~utils';
import { customError } from './testData';
import { loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectDeployment(): void {
  describe('deployment', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
    });

    it('owner tries to deploy with zero new owner address', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          newOwner: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.ownableInvalidOwner);
    });

    it('owner tries to deploy with zero ERC20 token address', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          erc20Token: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.erc20TokenNotZeroAddress);
    });

    it('owner tries to deploy with invalid first unlock percent', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          firstUnlockPercent: calculatePercentForContract(101),
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.firstUnlockPercentMustBeLessThanPercentDivider,
      );
    });

    it('owner tries to deploy with invalid start date', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          startDate: 1,
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.startDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner tries to deploy with zero unlock period', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          unlockPeriod: 0,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.unlockPeriodNotZero);
    });

    it('owner tries to deploy with zero unlock period percent', async function () {
      const users = await getUsers();
      await expect(
        getSQRVestingContext(users, {
          ...contractConfig,
          unlockPeriodPercent: ZERO,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.unlockPeriodPercentNotZero);
    });
  });
}
