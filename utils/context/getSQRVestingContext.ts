import { ethers } from 'hardhat';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { ContractConfig, getContractArgs } from '~seeds';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';
import { SQRVesting__factory } from '~typechain-types/factories/contracts/SQRVesting__factory';
import { SQRVestingContext, Users } from '~types';

export async function getSQRVestingContext(
  users: Users,
  deployData?: string | ContractConfig,
): Promise<SQRVestingContext> {
  const { owner, user1, user2, user3, owner2 } = users;

  const sqrVestingFactory = (await ethers.getContractFactory(
    SQR_VESTING_NAME,
  )) as unknown as SQRVesting__factory;

  let ownerSQRVesting: SQRVesting;

  if (typeof deployData === 'string') {
    ownerSQRVesting = sqrVestingFactory.connect(owner).attach(deployData) as SQRVesting;
  } else {
    ownerSQRVesting = await sqrVestingFactory
      .connect(owner)
      .deploy(...getContractArgs(deployData as ContractConfig), TX_OVERRIDES as any);
  }

  const sqrVestingAddress = await ownerSQRVesting.getAddress();

  const user1SQRVesting = ownerSQRVesting.connect(user1);
  const user2SQRVesting = ownerSQRVesting.connect(user2);
  const user3SQRVesting = ownerSQRVesting.connect(user3);
  const owner2SQRVesting = ownerSQRVesting.connect(owner2);

  return {
    sqrVestingFactory,
    sqrVestingAddress,
    ownerSQRVesting,
    user1SQRVesting,
    user2SQRVesting,
    user3SQRVesting,
    owner2SQRVesting,
  };
}
