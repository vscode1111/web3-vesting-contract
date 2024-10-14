import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ZeroAddress } from 'ethers';
import { DAYS, INITIAL_POSITIVE_CHECK_TEST_TITLE, toUnixTime } from '~common';
import { waitTx } from '~common-contract';
import { contractConfig, seedData } from '~seeds';
import { addSecondsToUnixTime, calculateAllocation } from '~utils';
import { customError } from './testData';
import {
  ClaimEventArgs,
  ForceWithdrawEventArgs,
  RefundEventArgs,
  SetAllocationEventArgs,
  SetAvailableRefundEventArgs,
  SetRefundCloseDateEventArgs,
  SetRefundStartDateEventArgs,
  WithdrawExcessAmountEventArgs,
} from './types';
import {
  calculateClaimAt,
  checkTotalWEB3Balance,
  findEvent,
  findEvents,
  getERC20TokenBalance,
  loadWEB3VestingFixture,
} from './utils';

export function shouldBehaveCorrectFundingDefaultCase(): void {
  describe('funding: default case', () => {
    beforeEach(async function () {
      await loadWEB3VestingFixture(this);
      await checkTotalWEB3Balance(this);
    });

    afterEach(async function () {
      await checkTotalWEB3Balance(this);
    });

    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
      expect(await getERC20TokenBalance(this, this.owner2Address)).eq(seedData.totalAccountBalance);

      expect(await this.owner2WEB3Vesting.getBalance()).eq(seedData.zero);
      expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.zero);
      expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
      expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(seedData.zero);

      expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(0);

      expect(await this.owner2WEB3Vesting.allocationCount()).eq(0);
      expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
      expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(true);
      expect(await this.owner2WEB3Vesting.getAccountCount()).eq(0);

      const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
      const {
        amount,
        claimed,
        claimCount,
        claimedAt,
        exist,
        canClaim,
        available,
        remain,
        nextAvailable,
        nextClaimAt,
        canRefund,
        refunded,
      } = claimInfo;
      expect(amount).eq(seedData.zero);
      expect(claimed).eq(seedData.zero);
      expect(claimCount).eq(seedData.zero);
      expect(claimedAt).eq(seedData.zero);
      expect(exist).eq(false);
      expect(refunded).eq(false);
      expect(canClaim).eq(false);
      expect(available).eq(seedData.zero);
      expect(remain).eq(seedData.zero);
      expect(nextAvailable).eq(seedData.zero);
      expect(nextClaimAt).eq(0);
      expect(canRefund).eq(false);
    });

    it('user1 tries to claim without allocation', async function () {
      await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.accountNotExist,
      );
    });

    it('user1 tries to claim without contract funds', async function () {
      await this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.allocation1);
      await time.increaseTo(contractConfig.startDate);
      await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.contractMustHaveSufficientFunds,
      );
    });

    it('user1 tries to set available refund without permission', async function () {
      await expect(this.user1WEB3Vesting.setAvailableRefund(true)).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.ownableUnauthorizedAccount,
      );
    });

    it('owner2 is allowed to set available refund (check event)', async function () {
      const receipt = await waitTx(this.owner2WEB3Vesting.setAvailableRefund(true));
      const eventLog = findEvent<SetAvailableRefundEventArgs>(receipt);
      expect(eventLog).not.undefined;
      const [account, value] = eventLog?.args;
      expect(account).eq(this.owner2);
      expect(value).eq(true);
    });

    it('user1 tries to set refund start date without permission', async function () {
      await expect(
        this.user1WEB3Vesting.setRefundStartDate(toUnixTime(seedData.now.toDate())),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.ownableUnauthorizedAccount);
    });

    it('owner2 tries to set refund start date by current one', async function () {
      await expect(
        this.owner2WEB3Vesting.setRefundStartDate(
          addSecondsToUnixTime(seedData.now, -seedData.timeShift),
        ),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundStartDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner2 tries to set refund start date after close one', async function () {
      await expect(
        this.owner2WEB3Vesting.setRefundStartDate(
          addSecondsToUnixTime(contractConfig.refundCloseDate, seedData.timeShift),
        ),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundStartDateMustBeLessThanRefundCloseDate,
      );
    });

    it('owner2 is allowed to set refund start date (check event)', async function () {
      const { refundStartDate } = contractConfig;
      const receipt = await waitTx(this.owner2WEB3Vesting.setRefundStartDate(refundStartDate));
      const eventLog = findEvent<SetRefundStartDateEventArgs>(receipt);
      expect(eventLog).not.undefined;
      const [account, value] = eventLog?.args;
      expect(account).eq(this.owner2Address);
      expect(value).eq(refundStartDate);
    });

    it('owner2 is allowed to set refund close date (check event)', async function () {
      const { refundCloseDate } = contractConfig;
      const receipt = await waitTx(this.owner2WEB3Vesting.setRefundCloseDate(refundCloseDate));
      const eventLog = findEvent<SetRefundCloseDateEventArgs>(receipt);
      expect(eventLog).not.undefined;
      const [account, value] = eventLog?.args;
      expect(account).eq(this.owner2Address);
      expect(value).eq(refundCloseDate);
    });

    it('user1 tries to set refund close date without permission', async function () {
      await expect(
        this.user1WEB3Vesting.setRefundCloseDate(toUnixTime(seedData.now.toDate())),
      ).revertedWithCustomError(this.owner2WEB3Vesting, customError.ownableUnauthorizedAccount);
    });

    it('owner2 tries to set refund close date by current one', async function () {
      await expect(
        this.owner2WEB3Vesting.setRefundCloseDate(
          addSecondsToUnixTime(seedData.now, -seedData.timeShift),
        ),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundCloseDateMustBeGreaterThanCurrentTime,
      );
    });

    it('owner2 tries to set refund close date before start one', async function () {
      await expect(
        this.owner2WEB3Vesting.setRefundCloseDate(
          addSecondsToUnixTime(contractConfig.refundStartDate, -seedData.timeShift),
        ),
      ).revertedWithCustomError(
        this.owner2WEB3Vesting,
        customError.refundCloseDateMustBeGreaterThanRefundStartDate,
      );
    });

    it('owner2 tries to set refund close date before start one', async function () {
      const { allocation1, allocation2, allocation3 } = seedData;

      await this.owner2WEB3Vesting.setAllocation(this.user1Address, allocation1);
      expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(allocation1);

      await this.owner2WEB3Vesting.setAllocation(this.user2Address, allocation2);
      expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(allocation1 + allocation2);

      await this.owner2WEB3Vesting.setAllocation(this.user3Address, allocation3);
      expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(
        allocation1 + allocation2 + allocation3,
      );
    });

    describe('contract has tokens for vesting', () => {
      beforeEach(async function () {
        await this.owner2ERC20Token.transfer(this.web3VestingAddress, seedData.companyVesting);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
        expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
          seedData.companyVesting,
        );
        expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.zero);
        expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
        expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(seedData.companyVesting);
        expect(await this.owner2WEB3Vesting.getBalance()).eq(seedData.companyVesting);
      });

      it('user1 tries to call forceWithdraw without permission', async function () {
        const contractAmount = await this.ownerWEB3Vesting.getBalance();

        await expect(
          this.user1WEB3Vesting.forceWithdraw(
            this.erc20TokenAddress,
            this.user3Address,
            contractAmount,
          ),
        )
          .revertedWithCustomError(this.ownerWEB3Vesting, customError.ownableUnauthorizedAccount)
          .withArgs(this.user1Address);
      });

      it('user1 tries to set allocation without permission', async function () {
        await expect(
          this.user1WEB3Vesting.setAllocation(this.user1Address, seedData.allocation1),
        ).revertedWithCustomError(this.owner2WEB3Vesting, customError.ownableUnauthorizedAccount);
      });

      it('owner2 tries to set allocation using zero address', async function () {
        await expect(
          this.owner2WEB3Vesting.setAllocation(ZeroAddress, seedData.allocation1),
        ).revertedWithCustomError(this.owner2WEB3Vesting, customError.accountNotZeroAddress);
      });

      it('user1 tries to set allocations without permission', async function () {
        await expect(
          this.user1WEB3Vesting.setAllocations([this.user1Address], [seedData.allocation1]),
        ).revertedWithCustomError(this.owner2WEB3Vesting, customError.ownableUnauthorizedAccount);
      });

      it('owner2 tries to set allocations without equal array lengths', async function () {
        await expect(
          this.owner2WEB3Vesting.setAllocations(
            [this.user1Address, this.user2Address],
            [seedData.allocation1],
          ),
        ).revertedWithCustomError(this.owner2WEB3Vesting, customError.arrayLengthsNotEqual);
      });

      it('owner2 is allowed to set allocations (check event)', async function () {
        const receipt = await waitTx(
          this.owner2WEB3Vesting.setAllocations(
            [this.user1Address, this.user2Address, this.user3Address],
            [seedData.allocation1, seedData.allocation2, seedData.allocation3],
          ),
        );

        const eventLogs = findEvents<SetAllocationEventArgs>(receipt);
        expect(eventLogs).not.undefined;
        expect(eventLogs.length).eq(3);

        const [eventLog1, eventLog2, eventLog3] = eventLogs;

        const [account1, amount1] = eventLog1?.args;
        expect(account1).eq(this.user1Address);
        expect(amount1).eq(seedData.allocation1);

        const [account2, amount2] = eventLog2?.args;
        expect(account2).eq(this.user2Address);
        expect(amount2).eq(seedData.allocation2);

        const [account3, amount3] = eventLog3?.args;
        expect(account3).eq(this.user3Address);
        expect(amount3).eq(seedData.allocation3);
      });

      it('owner2 is allowed to set allocations (check event)', async function () {
        const receipt = await waitTx(
          this.owner2WEB3Vesting.setAllocations(
            [this.user1Address, this.user2Address, this.user3Address],
            [seedData.allocation1, seedData.allocation2, seedData.allocation3],
          ),
        );

        const eventLogs = findEvents<SetAllocationEventArgs>(receipt);
        expect(eventLogs).not.undefined;
        expect(eventLogs.length).eq(3);

        const [eventLog1, eventLog2, eventLog3] = eventLogs;

        const [account1, amount1] = eventLog1?.args;
        expect(account1).eq(this.user1Address);
        expect(amount1).eq(seedData.allocation1);

        const [account2, amount2] = eventLog2?.args;
        expect(account2).eq(this.user2Address);
        expect(amount2).eq(seedData.allocation2);

        const [account3, amount3] = eventLog3?.args;
        expect(account3).eq(this.user3Address);
        expect(amount3).eq(seedData.allocation3);
      });

      it('owner2 is allowed to set allocation (check event)', async function () {
        const receipt = await waitTx(
          this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.allocation1),
        );
        const eventLog = findEvent<SetAllocationEventArgs>(receipt);
        expect(eventLog).not.undefined;
        const [account, amount] = eventLog?.args;
        expect(account).eq(this.user1Address);
        expect(amount).eq(seedData.allocation1);
      });

      it('owner2 call forceWithdraw (check event)', async function () {
        expect(await getERC20TokenBalance(this, this.user3Address)).eq(seedData.zero);

        const contractAmount = await this.owner2WEB3Vesting.getBalance();

        const receipt = await waitTx(
          this.owner2WEB3Vesting.forceWithdraw(
            this.erc20TokenAddress,
            this.user3Address,
            contractAmount,
          ),
        );
        const eventLog = findEvent<ForceWithdrawEventArgs>(receipt);

        expect(eventLog).not.undefined;
        const [token, to, amount] = eventLog?.args;
        expect(token).eq(this.erc20TokenAddress);
        expect(to).eq(this.user3Address);
        expect(amount).closeTo(contractAmount, seedData.balanceDelta);

        expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(seedData.zero);
        expect(await getERC20TokenBalance(this, this.user1Address)).eq(seedData.zero);
        expect(await getERC20TokenBalance(this, this.user2Address)).eq(seedData.zero);
        expect(await getERC20TokenBalance(this, this.user3Address)).eq(contractAmount);
      });

      describe('user1 got allocation', () => {
        beforeEach(async function () {
          await this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.allocation1);
        });

        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
          expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
          expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
            seedData.companyVesting - seedData.allocation1,
          );

          expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(0);

          expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
          expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
          expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(false);
          expect(await this.owner2WEB3Vesting.getAccountCount()).eq(1);
          expect(await this.owner2WEB3Vesting.getAccountByIndex(0)).eq(this.user1Address);

          const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
          const {
            amount,
            claimed,
            claimCount,
            claimedAt,
            exist,
            refunded,
            canClaim,
            available,
            remain,
            nextAvailable,
            nextClaimAt,
            canRefund,
          } = claimInfo;
          expect(amount).eq(seedData.allocation1);
          expect(claimed).eq(seedData.zero);
          expect(claimCount).eq(seedData.zero);
          expect(claimedAt).eq(seedData.zero);
          expect(exist).eq(true);
          expect(refunded).eq(false);
          expect(canClaim).eq(false);
          expect(available).eq(seedData.zero);
          expect(remain).eq(seedData.allocation1);
          expect(nextAvailable).eq(
            calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
          );
          expect(nextClaimAt).closeTo(contractConfig.startDate, seedData.timeDelta);
          expect(canRefund).eq(false);
        });

        it('owner2 overridden first allocation to larger one', async function () {
          const allocation = seedData.allocation1 * BigInt(2);
          await this.owner2WEB3Vesting.setAllocation(this.user1Address, allocation);

          expect(await this.owner2WEB3Vesting.totalAllocated()).eq(allocation);
          expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
            seedData.companyVesting - allocation,
          );
          expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
          expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
        });

        it('owner2 overridden first allocation to smaller one', async function () {
          const allocation = seedData.allocation1 / BigInt(2);
          await this.owner2WEB3Vesting.setAllocation(this.user1Address, allocation);

          expect(await this.owner2WEB3Vesting.totalAllocated()).eq(allocation);
          expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
            seedData.companyVesting - allocation,
          );
          expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
          expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
        });

        it('owner2 overridden first allocation to zero and init one', async function () {
          await this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.zero);

          expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(seedData.companyVesting);
          expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
          expect(await this.owner2WEB3Vesting.refundCount()).eq(0);

          await this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.allocation1);
          expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
          expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
          expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
            seedData.companyVesting - seedData.allocation1,
          );
          expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
          expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
        });

        describe('set time after start date', () => {
          beforeEach(async function () {
            await time.increaseTo(contractConfig.startDate);
          });

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
            expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
            expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
              seedData.companyVesting - seedData.allocation1,
            );

            expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(0);

            expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
            expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
            expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(false);

            const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
            const {
              amount,
              claimed,
              claimCount,
              claimedAt,
              exist,
              refunded,
              canClaim,
              available,
              remain,
              nextAvailable,
              nextClaimAt,
              canRefund,
            } = claimInfo;
            expect(amount).eq(seedData.allocation1);
            expect(claimed).eq(seedData.zero);
            expect(claimCount).eq(seedData.zero);
            expect(claimedAt).eq(seedData.zero);
            expect(exist).eq(true);
            expect(refunded).eq(false);
            expect(canClaim).eq(true);
            expect(available).eq(
              calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
            );
            expect(remain).eq(seedData.allocation1);
            expect(nextAvailable).eq(
              calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
            );
            expect(nextClaimAt).closeTo(contractConfig.startDate, seedData.timeDelta);
            expect(canRefund).eq(false);
          });

          it('user1 is allowed to claim (check event)', async function () {
            const receipt = await waitTx(this.user1WEB3Vesting.claim());
            const eventLog = findEvent<ClaimEventArgs>(receipt);
            expect(eventLog).not.undefined;
            const [account, amount] = eventLog?.args;
            expect(account).eq(this.user1Address);
            expect(amount).eq(
              calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
            );
          });

          describe('set time after refund start date', () => {
            beforeEach(async function () {
              await time.increaseTo(contractConfig.refundStartDate);
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
              const {
                amount,
                claimed,
                claimCount,
                claimedAt,
                exist,
                refunded,
                canClaim,
                available,
                remain,
                nextAvailable,
                nextClaimAt,
                canRefund,
              } = claimInfo;
              expect(amount).eq(seedData.allocation1);
              expect(claimed).eq(seedData.zero);
              expect(claimCount).eq(seedData.zero);
              expect(claimedAt).eq(seedData.zero);
              expect(exist).eq(true);
              expect(refunded).eq(false);
              expect(canClaim).eq(true);
              expect(available).eq(
                calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
              );
              expect(remain).eq(seedData.allocation1);
              expect(nextAvailable).eq(
                calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
              );
              expect(nextClaimAt).closeTo(contractConfig.startDate, seedData.timeDelta);
              expect(canRefund).eq(true);
            });

            it('user1 tries to refund when called claim previously', async function () {
              await this.user1WEB3Vesting.claim();

              await expect(this.user1WEB3Vesting.refund()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.alreadyClaimed,
              );
            });

            it('user1 is allowed to refund (check event)', async function () {
              const receipt = await waitTx(this.user1WEB3Vesting.refund());
              const eventLog = findEvent<RefundEventArgs>(receipt);
              expect(eventLog).not.undefined;
              const [account] = eventLog?.args;
              expect(account).eq(this.user1Address);
            });
          });

          describe('user1 claimed first unlock', () => {
            beforeEach(async function () {
              await this.user1WEB3Vesting.claim();
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              const unlockAllocation = calculateAllocation(
                seedData.allocation1,
                contractConfig.firstUnlockPercent,
              );

              expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(0);

              expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
              expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
              expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                seedData.companyVesting - seedData.allocation1,
              );

              expect(await getERC20TokenBalance(this, this.user1Address)).eq(unlockAllocation);
              expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
                seedData.companyVesting - unlockAllocation,
              );
              expect(await this.owner2WEB3Vesting.getBalance()).eq(
                seedData.companyVesting - unlockAllocation,
              );
              expect(await getERC20TokenBalance(this, this.user1Address)).eq(unlockAllocation);

              expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
              expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
              expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(false);

              const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
              const {
                amount,
                claimed,
                claimCount,
                claimedAt,
                exist,
                refunded,
                canClaim,
                available,
                remain,
                nextAvailable,
                nextClaimAt,
                canRefund,
              } = claimInfo;
              expect(amount).eq(seedData.allocation1);
              expect(claimed).eq(unlockAllocation);
              expect(claimCount).eq(1);
              expect(claimedAt).closeTo(contractConfig.startDate, seedData.timeDelta);
              expect(exist).eq(true);
              expect(refunded).eq(false);
              expect(canClaim).eq(false);
              expect(available).eq(seedData.zero);
              expect(remain).eq(seedData.allocation1 - unlockAllocation);
              expect(nextAvailable).eq(
                calculateAllocation(seedData.allocation1, contractConfig.unlockPeriodPercent),
              ); //ToDo: fix
              expect(nextClaimAt).closeTo(calculateClaimAt(contractConfig, 1), seedData.timeDelta);
              expect(canRefund).eq(false);
            });

            it('owner2 tries to reset first allocation', async function () {
              await expect(
                this.owner2WEB3Vesting.setAllocation(this.user1Address, seedData.allocation2),
              ).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.cantChangeOngoingVesting,
              );
            });

            it('user1 tries to claim again in the same period immediately', async function () {
              await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.nothingToClaim,
              );
            });

            it('user1 tries to claim again in the same period with 1 day delay after startDate', async function () {
              await time.increaseTo(addSecondsToUnixTime(contractConfig.startDate, DAYS));

              await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.nothingToClaim,
              );
            });

            it('user1 tries to claim again in the same period close to end of cliff period', async function () {
              await time.increaseTo(contractConfig.startDate + contractConfig.cliffPeriod);

              await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.nothingToClaim,
              );
            });

            it('user1 tries to refund when called claim previously', async function () {
              await time.increaseTo(contractConfig.refundCloseDate);

              await expect(this.user1WEB3Vesting.refund()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.tooLateToRefund,
              );
            });

            describe('moved time after cliff period', () => {
              beforeEach(async function () {
                await time.increaseTo(contractConfig.startDate + contractConfig.cliffPeriod);
              });

              it('user1 tries to claim after cliff period with 1 day delay', async function () {
                await time.increaseTo(contractConfig.startDate + contractConfig.cliffPeriod + DAYS);

                await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                  this.owner2WEB3Vesting,
                  customError.nothingToClaim,
                );
              });

              describe('moved time forward after 1th unlock period', () => {
                beforeEach(async function () {
                  await time.increaseTo(calculateClaimAt(contractConfig, 1));
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  const unlockAllocation = calculateAllocation(
                    seedData.allocation1,
                    contractConfig.firstUnlockPercent,
                  );

                  expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(1);

                  expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
                  expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
                  expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                    seedData.companyVesting - seedData.allocation1,
                  );

                  expect(await getERC20TokenBalance(this, this.user1Address)).eq(unlockAllocation);
                  expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
                    seedData.companyVesting - unlockAllocation,
                  );
                  expect(await this.owner2WEB3Vesting.getBalance()).eq(
                    seedData.companyVesting - unlockAllocation,
                  );

                  expect(await getERC20TokenBalance(this, this.user1Address)).eq(unlockAllocation);

                  expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
                  expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
                  expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(
                    false,
                  );

                  const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
                  const {
                    amount,
                    claimed,
                    claimCount,
                    claimedAt,
                    exist,
                    refunded,
                    canClaim,
                    available,
                    remain,
                    nextAvailable,
                    nextClaimAt,
                  } = claimInfo;
                  expect(amount).eq(seedData.allocation1);
                  expect(claimed).eq(unlockAllocation);
                  expect(claimCount).eq(1);
                  expect(claimedAt).closeTo(contractConfig.startDate, seedData.timeDelta);
                  expect(exist).eq(true);
                  expect(refunded).eq(false);
                  expect(canClaim).eq(true);
                  expect(available).eq(
                    calculateAllocation(seedData.allocation1, contractConfig.unlockPeriodPercent),
                  );
                  expect(remain).eq(seedData.allocation1 - unlockAllocation);
                  expect(nextAvailable).eq(
                    calculateAllocation(
                      seedData.allocation1,
                      BigInt(2) * contractConfig.unlockPeriodPercent,
                    ),
                  );
                  expect(nextClaimAt).closeTo(
                    calculateClaimAt(contractConfig, 2),
                    seedData.timeDelta,
                  );
                });

                describe('user1 claimed', () => {
                  beforeEach(async function () {
                    await this.user1WEB3Vesting.claim();
                  });

                  it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                    const unlockAllocation = calculateAllocation(
                      seedData.allocation1,
                      contractConfig.firstUnlockPercent + contractConfig.unlockPeriodPercent,
                    );

                    expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(1);

                    expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
                    expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(
                      seedData.zero,
                    );
                    expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                      seedData.companyVesting - seedData.allocation1,
                    );

                    expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                      unlockAllocation,
                    );
                    expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
                      seedData.companyVesting - unlockAllocation,
                    );
                    expect(await this.owner2WEB3Vesting.getBalance()).eq(
                      seedData.companyVesting - unlockAllocation,
                    );

                    expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                      unlockAllocation,
                    );

                    expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
                    expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
                    expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(
                      false,
                    );

                    const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
                    const {
                      amount,
                      claimed,
                      claimCount,
                      claimedAt,
                      exist,
                      refunded,
                      canClaim,
                      available,
                      remain,
                      nextAvailable,
                      nextClaimAt,
                    } = claimInfo;
                    expect(amount).eq(seedData.allocation1);
                    expect(claimCount).eq(2);
                    expect(claimed).eq(unlockAllocation);
                    expect(claimedAt).closeTo(
                      calculateClaimAt(contractConfig, 1),
                      seedData.timeDelta,
                    );
                    expect(exist).eq(true);
                    expect(refunded).eq(false);
                    expect(canClaim).eq(false);
                    expect(available).eq(seedData.zero);
                    expect(remain).eq(seedData.allocation1 - unlockAllocation);
                    expect(nextAvailable).eq(
                      calculateAllocation(seedData.allocation1, contractConfig.unlockPeriodPercent),
                    );
                    expect(nextClaimAt).closeTo(
                      calculateClaimAt(contractConfig, 2),
                      seedData.timeDelta,
                    );
                  });

                  it('user1 tries to claim again in the same period with 1 day delay', async function () {
                    await time.increaseTo(calculateClaimAt(contractConfig, 1) + DAYS);

                    await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                      this.owner2WEB3Vesting,
                      customError.nothingToClaim,
                    );
                  });

                  describe('moved time forward after 2nd unlock period and user1 claimed', () => {
                    beforeEach(async function () {
                      await time.increaseTo(calculateClaimAt(contractConfig, 2));
                      await this.user1WEB3Vesting.claim();
                    });

                    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                      const unlockAllocation = calculateAllocation(
                        seedData.allocation1,
                        contractConfig.firstUnlockPercent +
                          BigInt(2) * contractConfig.unlockPeriodPercent,
                      );

                      expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(2);

                      expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
                      expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(
                        seedData.zero,
                      );
                      expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                        seedData.companyVesting - seedData.allocation1,
                      );

                      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                        unlockAllocation,
                      );
                      expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
                        seedData.companyVesting - unlockAllocation,
                      );
                      expect(await this.owner2WEB3Vesting.getBalance()).eq(
                        seedData.companyVesting - unlockAllocation,
                      );

                      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                        unlockAllocation,
                      );

                      expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
                      expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
                      expect(
                        await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address),
                      ).eq(false);

                      const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(
                        this.user1Address,
                      );
                      const {
                        amount,
                        claimed,
                        claimCount,
                        claimedAt,
                        exist,
                        refunded,
                        canClaim,
                        available,
                        remain,
                        nextAvailable,
                        nextClaimAt,
                        canRefund,
                      } = claimInfo;
                      expect(amount).eq(seedData.allocation1);
                      expect(claimed).eq(unlockAllocation);
                      expect(claimCount).eq(3);
                      expect(claimedAt).closeTo(
                        calculateClaimAt(contractConfig, 2),
                        seedData.timeDelta,
                      );
                      expect(exist).eq(true);
                      expect(refunded).eq(false);
                      expect(canClaim).eq(false);
                      expect(available).eq(seedData.zero);
                      expect(remain).eq(seedData.allocation1 - unlockAllocation);
                      expect(nextAvailable).eq(
                        calculateAllocation(
                          seedData.allocation1,
                          contractConfig.unlockPeriodPercent,
                        ),
                      );
                      expect(nextClaimAt).closeTo(
                        calculateClaimAt(contractConfig, 3),
                        seedData.timeDelta,
                      );
                      expect(canRefund).eq(false);
                    });

                    it('user1 tries to claim again in the same period with 1 day delay', async function () {
                      await time.increaseTo(calculateClaimAt(contractConfig, 2) + DAYS);
                      await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                        this.owner2WEB3Vesting,
                        customError.nothingToClaim,
                      );
                    });

                    describe('moved time forward after 10th unlock period and user1 claimed', () => {
                      beforeEach(async function () {
                        await time.increaseTo(calculateClaimAt(contractConfig, 10));
                        await this.user1WEB3Vesting.claim();
                      });

                      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                        expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(10);

                        expect(await this.owner2WEB3Vesting.totalAllocated()).eq(
                          seedData.allocation1,
                        );
                        expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(
                          seedData.zero,
                        );
                        expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                          seedData.companyVesting - seedData.allocation1,
                        );

                        expect(await getERC20TokenBalance(this, this.web3VestingAddress)).eq(
                          seedData.companyVesting - seedData.allocation1,
                        );
                        expect(await this.owner2WEB3Vesting.getBalance()).eq(
                          seedData.companyVesting - seedData.allocation1,
                        );

                        expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                          seedData.allocation1,
                        );

                        expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
                        expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
                        expect(
                          await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address),
                        ).eq(true);

                        const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(
                          this.user1Address,
                        );
                        const {
                          amount,
                          claimed,
                          claimedAt,
                          exist,
                          refunded,
                          canClaim,
                          available,
                          remain,
                          nextAvailable,
                          nextClaimAt,
                          canRefund,
                        } = claimInfo;
                        expect(amount).eq(seedData.allocation1);
                        expect(claimed).eq(seedData.allocation1);
                        expect(claimedAt).closeTo(
                          calculateClaimAt(contractConfig, 10),
                          seedData.timeDelta,
                        );
                        expect(exist).eq(true);
                        expect(refunded).eq(false);
                        expect(canClaim).eq(false);
                        expect(available).eq(seedData.zero);
                        expect(remain).eq(seedData.zero);
                        expect(nextAvailable).eq(seedData.zero);
                        expect(nextClaimAt).eq(0);
                        expect(canRefund).eq(false);
                      });

                      it('user1 tries to claim again in the same period with 1 day delay', async function () {
                        await time.increaseTo(calculateClaimAt(contractConfig, 10) + DAYS);
                        await expect(this.user1WEB3Vesting.claim()).revertedWithCustomError(
                          this.owner2WEB3Vesting,
                          customError.nothingToClaim,
                        );
                      });

                      it('user1 tries to call withdrawExcessAmount without permission', async function () {
                        await expect(
                          this.user1WEB3Vesting.withdrawExcessAmount(),
                        ).revertedWithCustomError(
                          this.owner2WEB3Vesting,
                          customError.ownableUnauthorizedAccount,
                        );
                      });

                      it('owner2 is allowed to withdrawExcessAmount (check event)', async function () {
                        const excessReward = await this.owner2WEB3Vesting.calculateExcessAmount();

                        const receipt = await waitTx(this.owner2WEB3Vesting.withdrawExcessAmount());

                        const eventLog = findEvent<WithdrawExcessAmountEventArgs>(receipt);
                        expect(eventLog).not.undefined;
                        const [account, amount] = eventLog?.args;
                        expect(account).eq(this.owner2Address);
                        expect(amount).eq(excessReward);
                      });

                      describe('owner2 withdrew excess amount of tokens', () => {
                        beforeEach(async function () {
                          await this.owner2WEB3Vesting.withdrawExcessAmount();
                        });

                        it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                          expect(await this.owner2WEB3Vesting.getBalance()).eq(seedData.zero);

                          expect(await getERC20TokenBalance(this, this.owner2Address)).eq(
                            seedData.totalAccountBalance - seedData.allocation1,
                          );
                          expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                            seedData.allocation1,
                          );
                        });
                      });
                    });
                  });
                });
              });
            });
          });

          describe('set time after refund close date', () => {
            beforeEach(async function () {
              await time.increaseTo(
                addSecondsToUnixTime(contractConfig.refundCloseDate, seedData.timeShift),
              );
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              expect(await this.owner2WEB3Vesting.totalAllocated()).eq(seedData.allocation1);
              expect(await this.owner2WEB3Vesting.calculatedRequiredAmount()).eq(seedData.zero);
              expect(await this.owner2WEB3Vesting.calculateExcessAmount()).eq(
                seedData.companyVesting - seedData.allocation1,
              );

              expect(await this.owner2WEB3Vesting.calculatePassedPeriod()).eq(0);

              expect(await this.owner2WEB3Vesting.allocationCount()).eq(1);
              expect(await this.owner2WEB3Vesting.refundCount()).eq(0);
              expect(await this.owner2WEB3Vesting.isAllocationFinished(this.user1Address)).eq(false);

              const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user1Address);
              const {
                amount,
                claimed,
                claimCount,
                claimedAt,
                exist,
                refunded,
                canClaim,
                available,
                remain,
                nextAvailable,
                nextClaimAt,
                canRefund,
              } = claimInfo;
              expect(amount).eq(seedData.allocation1);
              expect(claimed).eq(seedData.zero);
              expect(claimCount).eq(seedData.zero);
              expect(claimedAt).eq(seedData.zero);
              expect(exist).eq(true);
              expect(refunded).eq(false);
              expect(canClaim).eq(true);
              expect(available).eq(
                calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
              );
              expect(remain).eq(seedData.allocation1);
              expect(nextAvailable).eq(
                calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
              );
              expect(nextClaimAt).closeTo(contractConfig.startDate, seedData.timeDelta);
              expect(canRefund).eq(false);
            });
          });
        });

        describe('user2 refund case', () => {
          beforeEach(async function () {});

          it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user2Address);
            const {
              amount,
              claimed,
              claimCount,
              claimedAt,
              exist,
              refunded,
              canClaim,
              available,
              remain,
              nextAvailable,
              nextClaimAt,
              canRefund,
            } = claimInfo;
            expect(amount).eq(seedData.zero);
            expect(claimed).eq(seedData.zero);
            expect(claimCount).eq(seedData.zero);
            expect(claimedAt).eq(seedData.zero);
            expect(exist).eq(false);
            expect(refunded).eq(false);
            expect(canClaim).eq(false);
            expect(available).eq(seedData.zero);
            expect(remain).eq(seedData.zero);
            expect(nextAvailable).eq(seedData.zero);
            expect(nextClaimAt).eq(0);
            expect(canRefund).eq(false);
          });

          describe('user2 and user3 got allocation', () => {
            beforeEach(async function () {
              await this.owner2WEB3Vesting.setAllocation(this.user2Address, seedData.allocation2);
              await this.owner2WEB3Vesting.setAllocation(this.user3Address, seedData.allocation3);
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              expect(await this.owner2WEB3Vesting.getAccountCount()).eq(3);
              expect(await this.owner2WEB3Vesting.getAccountByIndex(0)).eq(this.user1Address);
              expect(await this.owner2WEB3Vesting.getAccountByIndex(1)).eq(this.user2Address);
              expect(await this.owner2WEB3Vesting.getAccountByIndex(2)).eq(this.user3Address);

              const claimInfo = await this.owner2WEB3Vesting.fetchClaimInfo(this.user2Address);
              const {
                amount,
                claimed,
                claimCount,
                claimedAt,
                exist,
                refunded,
                canClaim,
                available,
                remain,
                nextAvailable,
                nextClaimAt,
                canRefund,
              } = claimInfo;
              expect(amount).eq(seedData.allocation2);
              expect(claimed).eq(seedData.zero);
              expect(claimCount).eq(seedData.zero);
              expect(claimedAt).eq(seedData.zero);
              expect(exist).eq(true);
              expect(refunded).eq(false);
              expect(canClaim).eq(false);
              expect(available).eq(seedData.zero);
              expect(remain).eq(seedData.allocation2);
              expect(nextAvailable).eq(
                calculateAllocation(seedData.allocation2, contractConfig.firstUnlockPercent),
              );
              expect(nextClaimAt).closeTo(contractConfig.startDate, seedData.timeDelta);
              expect(canRefund).eq(false);
            });

            it('user2 tries to refund', async function () {
              await expect(this.user1WEB3Vesting.refund()).revertedWithCustomError(
                this.owner2WEB3Vesting,
                customError.tooEarlyToRefund,
              );
            });

            describe('set time to refund start date and user2 refunded', () => {
              beforeEach(async function () {
                await time.increaseTo(contractConfig.refundStartDate);
                await this.user2WEB3Vesting.refund();
              });

              it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                expect(await this.ownerWEB3Vesting.isAfterRefundCloseDate()).eq(false);

                const claimInfo2 = await this.owner2WEB3Vesting.fetchClaimInfo(this.user2Address);
                expect(claimInfo2.amount).eq(seedData.zero);
                expect(claimInfo2.claimed).eq(seedData.zero);
                expect(claimInfo2.claimedAt).eq(seedData.zero);
                expect(claimInfo2.exist).eq(true);
                expect(claimInfo2.refunded).eq(true);
                expect(claimInfo2.canClaim).eq(false);
                expect(claimInfo2.available).eq(seedData.zero);
                expect(claimInfo2.remain).eq(seedData.zero);
                expect(claimInfo2.nextAvailable).eq(seedData.zero);
                expect(claimInfo2.nextClaimAt).eq(0);
                expect(claimInfo2.canRefund).eq(false);

                const claimInfo3 = await this.owner2WEB3Vesting.fetchClaimInfo(this.user3Address);
                expect(claimInfo3.amount).eq(seedData.allocation3);
                expect(claimInfo3.claimed).eq(seedData.zero);
                expect(claimInfo3.claimedAt).eq(seedData.zero);
                expect(claimInfo3.exist).eq(true);
                expect(claimInfo3.refunded).eq(false);
                expect(claimInfo3.canClaim).eq(true);
                expect(claimInfo3.available).eq(
                  calculateAllocation(seedData.allocation3, contractConfig.firstUnlockPercent),
                );
                expect(claimInfo3.remain).eq(seedData.allocation3);
                expect(claimInfo3.nextAvailable).eq(
                  calculateAllocation(seedData.allocation3, contractConfig.firstUnlockPercent),
                );
                expect(claimInfo3.canRefund).eq(true);
              });

              it('user2 tries to claim', async function () {
                await expect(this.user2WEB3Vesting.claim()).revertedWithCustomError(
                  this.owner2WEB3Vesting,
                  customError.alreadyRefunded,
                );
              });

              describe('set time to refund close date and user2 refunded', () => {
                beforeEach(async function () {
                  await time.increaseTo(
                    addSecondsToUnixTime(contractConfig.refundCloseDate, seedData.timeShift),
                  );
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  expect(await this.ownerWEB3Vesting.isAfterRefundCloseDate()).eq(true);

                  const claimInfo3 = await this.owner2WEB3Vesting.fetchClaimInfo(this.user3Address);
                  expect(claimInfo3.amount).eq(seedData.allocation3);
                  expect(claimInfo3.claimed).eq(seedData.zero);
                  expect(claimInfo3.claimedAt).eq(seedData.zero);
                  expect(claimInfo3.exist).eq(true);
                  expect(claimInfo3.refunded).eq(false);
                  expect(claimInfo3.canClaim).eq(true);
                  expect(claimInfo3.available).eq(
                    calculateAllocation(seedData.allocation3, contractConfig.firstUnlockPercent),
                  );
                  expect(claimInfo3.remain).eq(seedData.allocation3);
                  expect(claimInfo3.nextAvailable).eq(
                    calculateAllocation(seedData.allocation3, contractConfig.firstUnlockPercent),
                  );
                  expect(claimInfo3.canRefund).eq(false);
                });
              });
            });
          });
        });
      });
    });
  });
}
