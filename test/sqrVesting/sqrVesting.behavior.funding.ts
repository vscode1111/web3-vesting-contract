import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE } from '~common';
import { ONE_HUNDRED_PERCENT } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { addSeconsToUnixTime, calculatePercentFromContract } from '~utils';
import { checkTotalSQRBalance, getERC20TokenBalance, loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectFunding(): void {
  describe('funding', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
      await checkTotalSQRBalance(this);
    });

    afterEach(async function () {
      await checkTotalSQRBalance(this);
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      expect(await this.owner2SQRVesting.getBalance()).eq(seedData.zero);

      const claimingInfo = await this.owner2SQRVesting.claimingInfo(this.user1Address);
      const [allocation, claimed, remainedToClaim, available, canClaim, nextClaimingAt] =
        claimingInfo;
      expect(allocation).eq(seedData.zero);
      expect(claimed).eq(seedData.zero);
      expect(remainedToClaim).eq(seedData.zero);
      expect(available).eq(seedData.zero);
      expect(canClaim).eq(false);
      expect(nextClaimingAt).closeTo(contractConfig.startDate, seedData.timeDelta);
    });

    describe('contract has tokens for vesting', () => {
      beforeEach(async function () {
        await this.owner2ERC20Token.transfer(this.sqrVestingAddress, seedData.companyVesting);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await getERC20TokenBalance(this, this.sqrVestingAddress)).eq(
          seedData.companyVesting,
        );
        expect(await this.owner2SQRVesting.getBalance()).eq(seedData.companyVesting);
      });

      describe('set first allocation', () => {
        beforeEach(async function () {
          await this.owner2SQRVesting.setAllocation(this.user1Address, seedData.allocation1);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          const claimingInfo = await this.owner2SQRVesting.claimingInfo(this.user1Address);

          const [allocation, claimed, remainedToClaim, available, canClaim, nextClaimingAt] =
            claimingInfo;
          expect(allocation).eq(seedData.allocation1);
          expect(claimed).eq(seedData.zero);
          expect(remainedToClaim).eq(seedData.allocation1);
          expect(available).eq(seedData.zero);
          expect(canClaim).eq(false);
          expect(nextClaimingAt).closeTo(contractConfig.startDate, seedData.timeDelta);
        });

        describe('set time after start date', () => {
          beforeEach(async function () {
            await time.increaseTo(
              addSeconsToUnixTime(contractConfig.startDate, seedData.timeShift),
            );
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            const claimingInfo = await this.owner2SQRVesting.claimingInfo(this.user1Address);

            const [allocation, claimed, remainedToClaim, available, canClaim, nextClaimingAt] =
              claimingInfo;
            expect(allocation).eq(seedData.allocation1);
            expect(claimed).eq(seedData.zero);
            expect(remainedToClaim).eq(seedData.allocation1);

            const percent = calculatePercentFromContract(contractConfig.firstUnlockPercent);

            expect(available).eq((seedData.allocation1 * percent) / ONE_HUNDRED_PERCENT);
            expect(canClaim).eq(true);
            expect(nextClaimingAt).closeTo(contractConfig.startDate, seedData.timeDelta);
          });

          it('test', async function () {});
        });
      });
    });
  });
}
