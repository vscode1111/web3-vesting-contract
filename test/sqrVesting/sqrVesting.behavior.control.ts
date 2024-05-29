import { expect } from 'chai';
import { loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectControl(): void {
  describe('control', () => {
    beforeEach(async function () {
      await loadSQRVestingFixture(this);
    });

    it('should be correct init variables', async function () {
      expect(await this.owner2SQRVesting.owner()).eq(this.owner2Address);
      await this.owner2SQRVesting.transferOwnership(this.ownerAddress);
      expect(await this.owner2SQRVesting.owner()).eq(this.ownerAddress);
    });
  });
}
