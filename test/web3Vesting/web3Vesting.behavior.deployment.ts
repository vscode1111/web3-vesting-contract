import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { ZERO } from '~constants';
import { contractConfig } from '~seeds';
import { calculatePercentForContract, getWEB3VestingContext, getUsers } from '~utils';
import { customError } from './testData';
import { loadWEB3VestingFixture } from './utils';

export function shouldBehaveCorrectDeployment(): void {
  describe('deployment', () => {
    beforeEach(async function () {
      await loadWEB3VestingFixture(this);
    });

    it('owner tries to deploy with zero new owner address', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          newOwner: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.ownableInvalidOwner);
    });

    it('owner tries to deploy with zero ERC20 token address', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          erc20Token: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.erc20TokenNotZeroAddress);
    });

    it('owner tries to deploy with invalid first unlock percent', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          firstUnlockPercent: calculatePercentForContract(101),
        }),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.firstUnlockPercentMustBeLessThanPercentDivider,
      );
    });

    it('owner tries to deploy with invalid start date', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          startDate: 1,
        }),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.startDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner tries to deploy with zero unlock period', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          unlockPeriod: 0,
        }),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.unlockPeriodNotZero);
    });

    it('owner tries to deploy with zero unlock period percent', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          unlockPeriodPercent: ZERO,
        }),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.unlockPeriodPercentNotZero);
    });

    it('owner tries to deploy with zero refund start date', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          refundStartDate: 0,
        }),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundStartDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner tries to deploy with zero refund close date', async function () {
      await expect(
        getWEB3VestingContext(await getUsers(), {
          ...contractConfig,
          refundCloseDate: 0,
        }),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundCloseDateMustBeGreaterThanRefundStartDate,
      );
    });

    it('owner deployed with false availableRefund', async function () {
      const { owner2WEB3Vesting, user1WEB3Vesting } = await getWEB3VestingContext(await getUsers(), {
        ...contractConfig,
        availableRefund: false,
      });
      expect(await owner2WEB3Vesting.availableRefund()).eq(false);
      await time.increaseTo(contractConfig.refundStartDate);
      await expect(user1WEB3Vesting.refund()).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundUnavailable,
      );
    });
  });
}
