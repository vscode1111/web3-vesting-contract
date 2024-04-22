import { Dayjs } from 'dayjs';
import { loadSQRVestingFixture } from './utils';

export function shouldBehaveCorrectDeployment(): void {
  describe('deployment', () => {
    let chainTime: Dayjs;

    beforeEach(async function () {
      await loadSQRVestingFixture(this, undefined, async (_chainTime, config) => {
        chainTime = _chainTime;
        return config;
      });
    });

    it('user1 tries to do something', async function () {
      console.log(chainTime);
    });
  });
}
