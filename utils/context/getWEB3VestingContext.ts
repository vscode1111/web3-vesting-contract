import { ethers } from 'hardhat';
import { WEB3_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { ContractConfig, getContractArgs } from '~seeds';
import { WEB3Vesting } from '~typechain-types/contracts/WEB3Vesting';
import { WEB3Vesting__factory } from '~typechain-types/factories/contracts/WEB3Vesting__factory';
import { WEB3VestingContext, Users } from '~types';

export async function getWEB3VestingContext(
  users: Users,
  deployData?: string | ContractConfig,
): Promise<WEB3VestingContext> {
  const { owner, user1, user2, user3, owner2 } = users;

  const web3VestingFactory = (await ethers.getContractFactory(
    WEB3_VESTING_NAME,
  )) as unknown as WEB3Vesting__factory;

  let ownerWEB3Vesting: WEB3Vesting;

  if (typeof deployData === 'string') {
    ownerWEB3Vesting = web3VestingFactory.connect(owner).attach(deployData) as WEB3Vesting;
  } else {
    ownerWEB3Vesting = await web3VestingFactory
      .connect(owner)
      .deploy(...getContractArgs(deployData as ContractConfig), TX_OVERRIDES as any);
  }

  const web3VestingAddress = await ownerWEB3Vesting.getAddress();

  const user1WEB3Vesting = ownerWEB3Vesting.connect(user1);
  const user2WEB3Vesting = ownerWEB3Vesting.connect(user2);
  const user3WEB3Vesting = ownerWEB3Vesting.connect(user3);
  const owner2WEB3Vesting = ownerWEB3Vesting.connect(owner2);

  return {
    web3VestingFactory,
    web3VestingAddress,
    ownerWEB3Vesting,
    user1WEB3Vesting,
    user2WEB3Vesting,
    user3WEB3Vesting,
    owner2WEB3Vesting,
  };
}
