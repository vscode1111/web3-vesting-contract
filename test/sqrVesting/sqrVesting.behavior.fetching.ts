import { expect } from 'chai';
import { VERSION } from '~constants';
import { contractConfig } from '~seeds';
import { calculatePercentForContract } from '~utils';
import { calculateClaimAt, loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
    });

    it('should be correct init values', async function () {
      //variables
      expect(await this.ownerSQRVesting.owner()).eq(this.owner2Address);
      expect(await this.ownerSQRVesting.VERSION()).eq(VERSION);
      expect(await this.ownerSQRVesting.startDate()).eq(contractConfig.startDate);
      expect(await this.ownerSQRVesting.cliffPeriod()).eq(contractConfig.cliffPeriod);
      expect(await this.ownerSQRVesting.firstUnlockPercent()).eq(contractConfig.firstUnlockPercent);
      expect(await this.ownerSQRVesting.unlockPeriod()).eq(contractConfig.unlockPeriod);
      expect(await this.ownerSQRVesting.unlockPeriodPercent()).eq(
        contractConfig.unlockPeriodPercent,
      );

      //methods
      const maxPeriod = Number(
        calculatePercentForContract(100) / contractConfig.unlockPeriodPercent,
      );

      expect(await this.ownerSQRVesting.calculateMaxPeriod()).eq(maxPeriod);
      expect(await this.ownerSQRVesting.calculateFinishDate()).eq(
        calculateClaimAt(contractConfig, maxPeriod),
      );
    });
  });
}
