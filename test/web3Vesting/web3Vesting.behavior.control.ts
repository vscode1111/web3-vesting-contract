import { expect } from 'chai';
import { loadWEB3VestingFixture } from './utils';

export function shouldBehaveCorrectControl(): void {
  describe('control', () => {
    beforeEach(async function () {
      await loadWEB3VestingFixture(this);
    });

    it('should be correct init variables', async function () {
      expect(await this.owner2WEB3Vesting.owner()).eq(this.owner2Address);
      await this.owner2WEB3Vesting.transferOwnership(this.ownerAddress);
      expect(await this.owner2WEB3Vesting.owner()).eq(this.ownerAddress);
    });
  });
}
