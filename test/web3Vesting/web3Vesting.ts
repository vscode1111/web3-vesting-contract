import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { WEB3_VESTING_NAME } from '~constants';
import { shouldBehaveCorrectControl } from './web3Vesting.behavior.control';
import { shouldBehaveCorrectDeployment } from './web3Vesting.behavior.deployment';
import { shouldBehaveCorrectFetching } from './web3Vesting.behavior.fetching';
import { shouldBehaveCorrectFundingCase1 } from './web3Vesting.behavior.fundingCase1';
import { shouldBehaveCorrectFundingDefaultCase } from './web3Vesting.behavior.fundingDefaultCase';

describe(WEB3_VESTING_NAME, function () {
  before(async function () {
    this.loadFixture = loadFixture;
  });

  shouldBehaveCorrectDeployment();
  shouldBehaveCorrectControl();
  shouldBehaveCorrectFetching();
  shouldBehaveCorrectFundingDefaultCase();
  shouldBehaveCorrectFundingCase1();
});
