import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_VESTING_NAME } from '~constants';
import { shouldBehaveCorrectDeployment } from './sqrVesting.behavior.deployment';
import { shouldBehaveCorrectFetching } from './sqrVesting.behavior.fetching';
import { shouldBehaveCorrectFunding } from './sqrVesting.behavior.funding';

describe(SQR_VESTING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  shouldBehaveCorrectDeployment();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFunding();
});
