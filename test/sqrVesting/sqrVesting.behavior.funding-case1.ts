import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { contractConfig, seedData } from '~seeds';
import { calculateAllocation } from '~utils';
import { custromError } from './testData';
import {
  calculateClaimAt,
  checkTotalSQRBalance,
  getERC20TokenBalance,
  loadSQRVestingFixture,
} from './utils';

export function shouldBehaveCorrectFundingCase1(): void {
  describe('funding case 1', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
      await checkTotalSQRBalance(this);
    });

    afterEach(async function () {
      await checkTotalSQRBalance(this);
    });

    it('user1 tries to claim without allocation', async function () {
      const { allocation1, allocation2, allocation3 } = seedData;
      const amounts = [allocation1, allocation2, allocation3];
      await this.owner2SQRVesting.setAllocations(
        [this.user1Address, this.user2Address, this.user3Address],
        amounts,
      );

      const { startDate, cliffPeriod, unlockPeriod, firstUnlockPercent, unlockPeriodPercent } =
        contractConfig;

      await this.owner2ERC20Token.transfer(this.sqrVestingAddress, seedData.companyVesting);

      //Claiming started
      await time.increaseTo(startDate);

      //User 1 gets first unlock
      await this.user1SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
        calculateAllocation(allocation1, firstUnlockPercent),
      );

      await expect(this.user1SQRVesting.claim()).revertedWithCustomError(
        this.owner2SQRVesting,
        custromError.nothingToClaim,
      );

      //User 2 gets first unlock
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(
        calculateAllocation(allocation2, firstUnlockPercent),
      );

      await expect(this.user2SQRVesting.claim()).revertedWithCustomError(
        this.owner2SQRVesting,
        custromError.nothingToClaim,
      );

      //Cliff passes and 1th period
      await time.increaseTo(startDate + cliffPeriod + unlockPeriod);

      //User 3 gets first unlock
      await this.user3SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user3Address)).eq(
        calculateAllocation(allocation3, firstUnlockPercent + unlockPeriodPercent),
      );

      //User 1 gets unlock again
      await this.user1SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
        calculateAllocation(allocation1, firstUnlockPercent + unlockPeriodPercent),
      );

      //User 2 gets unlock again
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(
        calculateAllocation(allocation2, firstUnlockPercent + unlockPeriodPercent),
      );

      //2ed period
      await time.increaseTo(calculateClaimAt(contractConfig, 2));

      //User 2 gets unlock again
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(
        calculateAllocation(allocation2, firstUnlockPercent + BigInt(2) * unlockPeriodPercent),
      );

      //3rd period
      await time.increaseTo(calculateClaimAt(contractConfig, 3));

      //User 2 gets unlock again
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(
        calculateAllocation(allocation2, firstUnlockPercent + BigInt(3) * unlockPeriodPercent),
      );

      //User 1 gets unlock again
      await this.user1SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user1Address)).eq(
        calculateAllocation(allocation1, firstUnlockPercent + BigInt(3) * unlockPeriodPercent),
      );

      //4th period
      await time.increaseTo(calculateClaimAt(contractConfig, 4));

      //User 2 gets unlock again
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(
        calculateAllocation(allocation2, firstUnlockPercent + BigInt(4) * unlockPeriodPercent),
      );

      //5th period
      await time.increaseTo(calculateClaimAt(contractConfig, 5));

      //User 2 gets unlock again
      await this.user2SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user2Address)).eq(allocation2);

      //6th period
      await time.increaseTo(calculateClaimAt(contractConfig, 6));

      await this.user1SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user1Address)).eq(allocation1);

      await this.user3SQRVesting.claim();
      expect(await getERC20TokenBalance(this, this.user3Address)).eq(allocation3);
    });
  });
}
