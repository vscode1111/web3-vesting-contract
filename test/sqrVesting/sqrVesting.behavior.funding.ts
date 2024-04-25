import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { INITIAL_POSITIVE_CHECK_TEST_TITLE, waitTx } from '~common';
import { DAYS } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { addSeconsToUnixTime, calculateAllocation } from '~utils';
import { custromError } from './testData';
import { ClaimEventArgs } from './types';
import {
  checkTotalSQRBalance,
  findEvent,
  getERC20TokenBalance,
  loadSQRVestingFixture,
} from './utils';

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

      const claimingInfo = await this.owner2SQRVesting.fetchClaimingInfo(this.user1Address);
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
          const claimingInfo = await this.owner2SQRVesting.fetchClaimingInfo(this.user1Address);

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
            const claimingInfo = await this.owner2SQRVesting.fetchClaimingInfo(this.user1Address);

            const [allocation, claimed, remainedToClaim, available, canClaim, nextClaimingAt] =
              claimingInfo;
            expect(allocation).eq(seedData.allocation1);
            expect(claimed).eq(seedData.zero);
            expect(remainedToClaim).eq(seedData.allocation1);
            expect(available).eq(
              calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
            );
            expect(canClaim).eq(true);
            expect(nextClaimingAt).eq(seedData.zero);
          });

          it('user1 is allowed to stake (check event)', async function () {
            const receipt = await waitTx(this.user1SQRVesting.claim());
            const eventLog = findEvent<ClaimEventArgs>(receipt);
            expect(eventLog).not.undefined;
            const [account, amount] = eventLog?.args;
            expect(account).eq(this.user1Address);
            expect(amount).eq(
              calculateAllocation(seedData.allocation1, contractConfig.firstUnlockPercent),
            );
          });

          describe('user1 claimed first unlock', () => {
            beforeEach(async function () {
              await this.user1SQRVesting.claim();
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
              const firstUnlockAllocation = calculateAllocation(
                seedData.allocation1,
                contractConfig.firstUnlockPercent,
              );

              expect(await getERC20TokenBalance(this, this.sqrVestingAddress)).eq(
                seedData.companyVesting - firstUnlockAllocation,
              );
              expect(await this.owner2SQRVesting.getBalance()).eq(
                seedData.companyVesting - firstUnlockAllocation,
              );
              expect(await getERC20TokenBalance(this, this.user1Address)).eq(firstUnlockAllocation);
            });

            it('user1 tries to claim again in the same period immediately', async function () {
              await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                this.owner2SQRVesting,
                custromError.nothingToClaim,
              );
            });

            it('user1 tries to claim again in the same period with 1 day delay after startDate', async function () {
              await time.increaseTo(addSeconsToUnixTime(contractConfig.startDate, DAYS));

              await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                this.owner2SQRVesting,
                custromError.nothingToClaim,
              );
            });

            it('user1 tries to claim again in the same period close to end of cliff period', async function () {
              await time.increaseTo(
                addSeconsToUnixTime(
                  contractConfig.startDate,
                  contractConfig.cliffPeriod - seedData.timeShift,
                ),
              );

              await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                this.owner2SQRVesting,
                custromError.nothingToClaim,
              );
            });

            describe('moved time after cliff period', () => {
              beforeEach(async function () {
                await time.increaseTo(
                  addSeconsToUnixTime(
                    contractConfig.startDate,
                    contractConfig.cliffPeriod + seedData.timeShift,
                  ),
                );
              });

              it('user1 tries to claim after cliff period with 1 day delay', async function () {
                await time.increaseTo(
                  addSeconsToUnixTime(contractConfig.startDate, contractConfig.cliffPeriod + DAYS),
                );

                await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                  this.owner2SQRVesting,
                  custromError.nothingToClaim,
                );
              });

              describe('moved time forward after 1th unlock period and user1 claimed', () => {
                beforeEach(async function () {
                  await time.increaseTo(
                    addSeconsToUnixTime(
                      contractConfig.startDate,
                      contractConfig.cliffPeriod + contractConfig.unlockPeriod + seedData.timeShift,
                    ),
                  );

                  await this.user1SQRVesting.claim();
                });

                it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  const unlockAllocation = calculateAllocation(
                    seedData.allocation1,
                    contractConfig.firstUnlockPercent + contractConfig.unlockPeriodPercent,
                  );

                  expect(await getERC20TokenBalance(this, this.sqrVestingAddress)).eq(
                    seedData.companyVesting - unlockAllocation,
                  );
                  expect(await this.owner2SQRVesting.getBalance()).eq(
                    seedData.companyVesting - unlockAllocation,
                  );

                  expect(await getERC20TokenBalance(this, this.user1Address)).eq(unlockAllocation);
                });

                it('user1 tries to claim again in the same period with 1 day delay', async function () {
                  await time.increaseTo(
                    addSeconsToUnixTime(
                      contractConfig.startDate,
                      contractConfig.cliffPeriod + contractConfig.unlockPeriod + DAYS,
                    ),
                  );

                  await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                    this.owner2SQRVesting,
                    custromError.nothingToClaim,
                  );
                });

                describe('moved time forward after 2nd unlock period and user1 claimed', () => {
                  beforeEach(async function () {
                    await time.increaseTo(
                      addSeconsToUnixTime(
                        contractConfig.startDate,
                        contractConfig.cliffPeriod +
                          2 * contractConfig.unlockPeriod +
                          seedData.timeShift,
                      ),
                    );

                    await this.user1SQRVesting.claim();
                  });

                  it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                    const unlockAllocation = calculateAllocation(
                      seedData.allocation1,
                      contractConfig.firstUnlockPercent +
                        BigInt(2) * contractConfig.unlockPeriodPercent,
                    );

                    expect(await getERC20TokenBalance(this, this.sqrVestingAddress)).eq(
                      seedData.companyVesting - unlockAllocation,
                    );
                    expect(await this.owner2SQRVesting.getBalance()).eq(
                      seedData.companyVesting - unlockAllocation,
                    );

                    expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                      unlockAllocation,
                    );
                  });

                  it('user1 tries to claim again in the same period with 1 day delay', async function () {
                    await time.increaseTo(
                      addSeconsToUnixTime(
                        contractConfig.startDate,
                        contractConfig.cliffPeriod + 2 * contractConfig.unlockPeriod + DAYS,
                      ),
                    );

                    await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                      this.owner2SQRVesting,
                      custromError.nothingToClaim,
                    );
                  });

                  describe('moved time forward after 10th unlock period and user1 claimed', () => {
                    beforeEach(async function () {
                      await time.increaseTo(
                        addSeconsToUnixTime(
                          contractConfig.startDate,
                          contractConfig.cliffPeriod +
                            10 * contractConfig.unlockPeriod +
                            seedData.timeShift,
                        ),
                      );

                      await this.user1SQRVesting.claim();
                    });

                    it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                      const unlockAllocation = seedData.allocation1,;

                      expect(await getERC20TokenBalance(this, this.sqrVestingAddress)).eq(
                        seedData.companyVesting - unlockAllocation,
                      );
                      expect(await this.owner2SQRVesting.getBalance()).eq(
                        seedData.companyVesting - unlockAllocation,
                      );

                      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
                        unlockAllocation,
                      );
                    });

                    it('user1 tries to claim again in the same period with 1 day delay', async function () {
                      await time.increaseTo(
                        addSeconsToUnixTime(
                          contractConfig.startDate,
                          contractConfig.cliffPeriod + 10 * contractConfig.unlockPeriod + DAYS,
                        ),
                      );

                      await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
                        this.owner2SQRVesting,
                        custromError.nothingToClaim,
                      );
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
