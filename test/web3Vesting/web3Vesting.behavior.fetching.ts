import { expect } from 'chai';
import { CONTRACT_NAME, CONTRACT_VERSION } from '~constants';
import { contractConfig } from '~seeds';
import { calculatePercentForContract } from '~utils';
import { calculateClaimAt, loadWEB3VestingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadWEB3VestingFixture(this);
    });

    it('should be correct init variables', async function () {
      expect(await this.ownerWEB3Vesting.owner()).eq(this.owner2Address);
      expect(await this.ownerWEB3Vesting.getContractName()).eq(CONTRACT_NAME);
      expect(await this.ownerWEB3Vesting.getContractVersion()).eq(CONTRACT_VERSION);
      expect(await this.ownerWEB3Vesting.startDate()).eq(contractConfig.startDate);
      expect(await this.ownerWEB3Vesting.cliffPeriod()).eq(contractConfig.cliffPeriod);
      expect(await this.ownerWEB3Vesting.firstUnlockPercent()).eq(contractConfig.firstUnlockPercent);
      expect(await this.ownerWEB3Vesting.unlockPeriod()).eq(contractConfig.unlockPeriod);
      expect(await this.ownerWEB3Vesting.unlockPeriodPercent()).eq(
        contractConfig.unlockPeriodPercent,
      );
      expect(await this.ownerWEB3Vesting.isAfterRefundCloseDate()).eq(false);
    });

    it('should be correct calculations of methods', async function () {
      const maxPeriod = Number(
        calculatePercentForContract(100) / contractConfig.unlockPeriodPercent,
      );

      expect(await this.ownerWEB3Vesting.calculateMaxPeriod()).eq(maxPeriod);
      expect(await this.ownerWEB3Vesting.calculateFinishDate()).eq(
        calculateClaimAt(contractConfig, maxPeriod),
      );
    });
  });
}
