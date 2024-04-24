import { expect } from 'chai';
import { VERSION } from '~constants';
import { contractConfig } from '~seeds';
import { loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
    });

    it('should be correct init values', async function () {
      //ToDo: add new checks
      expect(await this.ownerSQRVesting.owner()).eq(this.owner2Address);
      expect(await this.ownerSQRVesting.VERSION()).eq(VERSION);
      expect(await this.ownerSQRVesting.firstUnlockPercent()).eq(contractConfig.firstUnlockPercent);
    });
  });
}
