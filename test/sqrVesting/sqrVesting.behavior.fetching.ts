import { expect } from 'chai';
import { VERSION } from '~constants';
import { loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectFetching(): void {
  describe('fetching', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
    });

    it('should be correct init values', async function () {
      expect(await this.ownerSQRVesting.owner()).eq(this.owner2Address);
      expect(await this.ownerSQRVesting.VERSION()).eq(VERSION);
    });
  });
}
