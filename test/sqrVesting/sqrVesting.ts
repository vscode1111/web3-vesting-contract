import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SQR_VESTING_NAME } from '~constants';
import { shouldBehaveCorrectControl } from './sqrVesting.behavior.control';
import { shouldBehaveCorrectDeployment } from './sqrVesting.behavior.deployment';
import { shouldBehaveCorrectFetching } from './sqrVesting.behavior.fetching';
import { shouldBehaveCorrectFundingCase1 } from './sqrVesting.behavior.fundingCase1';
import { shouldBehaveCorrectFundingDefaultCase } from './sqrVesting.behavior.fundingDefaultCase';

describe(SQR_VESTING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  shouldBehaveCorrectDeployment();
  shouldBehaveCorrectControl();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFundingDefaultCase();
  shouldBehaveCorrectFundingCase1();
});
