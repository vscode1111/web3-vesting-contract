import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_VESTING_NAME } from '~constants';
import { shouldBehaveCorrectDeployment } from './sqrVesting.behavior.deployment';
import { shouldBehaveCorrectFetching } from './sqrVesting.behavior.fetching';
import { shouldBehaveCorrectFundingCase1 } from './sqrVesting.behavior.funding-case1';
import { shouldBehaveCorrectFundingDefaultCase } from './sqrVesting.behavior.funding-default-case';

describe(SQR_VESTING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  shouldBehaveCorrectDeployment();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFundingDefaultCase();
  shouldBehaveCorrectFundingCase1();
});
