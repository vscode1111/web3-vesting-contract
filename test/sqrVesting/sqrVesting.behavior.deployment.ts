import { time } from '@nomicfoundation/hardhat-network-helpers';
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
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          newOwner: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.ownableInvalidOwner);
    });

    it('owner tries to deploy with zero ERC20 token address', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          erc20Token: ZeroAddress,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.erc20TokenNotZeroAddress);
    });

    it('owner tries to deploy with invalid first unlock percent', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          firstUnlockPercent: calculatePercentForContract(101),
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.firstUnlockPercentMustBeLessThanPercentDivider,
      );
    });

    it('owner tries to deploy with invalid start date', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          startDate: 1,
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.startDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner tries to deploy with zero unlock period', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          unlockPeriod: 0,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.unlockPeriodNotZero);
    });

    it('owner tries to deploy with zero unlock period percent', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          unlockPeriodPercent: ZERO,
        }),
      ).revertedWithCustomError(this.owner2SQRVesting, customError.unlockPeriodPercentNotZero);
    });

    it('owner tries to deploy with zero refund start date', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          refundStartDate: 0,
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.refundStartDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner tries to deploy with zero refund close date', async function () {
      await expect(
        getSQRVestingContext(await getUsers(), {
          ...contractConfig,
          refundCloseDate: 0,
        }),
      ).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.refundCloseDateMustBeGreaterThanRefundStartDate,
      );
    });

    it('owner deployed with false availableRefund', async function () {
      const { owner2SQRVesting, user1SQRVesting } = await getSQRVestingContext(await getUsers(), {
        ...contractConfig,
        availableRefund: false,
      });
      expect(await owner2SQRVesting.availableRefund()).eq(false);
      await time.increaseTo(contractConfig.refundStartDate);
      await expect(user1SQRVesting.refund()).revertedWithCustomError(
        this.owner2SQRVesting,
        customError.refundUnavailable,
      );
    });
  });
}
