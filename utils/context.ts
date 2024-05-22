import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getNetworkName } from '~common-contract';
import { CONTRACTS, ERC20_TOKEN_NAME, SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { ContractConfig, getContractArgs, getTokenArgs } from '~seeds';
import { ERC20Token } from '~typechain-types/contracts/ERC20Token';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';
import { ERC20Token__factory } from '~typechain-types/factories/contracts/ERC20Token__factory';
import { SQRVesting__factory } from '~typechain-types/factories/contracts/SQRVesting__factory';
import {
  Addresses,
  ContextBase,
  DeployNetworks,
  ERC20TokenContext,
  SQRVestingContext,
  Users,
} from '~types';

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const erc20TokenAddress = CONTRACTS.ERC20_TOKEN[network];
  const sqrVestingAddress = CONTRACTS.SQR_VESTING[network];
  return {
    erc20TokenAddress,
    sqrVestingAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}

export async function getUsers(): Promise<Users> {
  const [owner, user1, user2, user3, owner2] = await ethers.getSigners();

  const ownerAddress = await owner.getAddress();
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const user3Address = await user3.getAddress();
  const owner2Address = await owner2.getAddress();

  return {
    owner,
    ownerAddress,
    user1,
    user1Address,
    user2,
    user2Address,
    user3,
    user3Address,
    owner2,
    owner2Address,
  };
}

export async function getERC20TokenContext(
  users: Users,
  deployData?: string | { newOwner: string },
): Promise<ERC20TokenContext> {
  const { owner, user1, user2, user3, owner2, owner2Address } = users;

  const testERC20TokenFactory = (await ethers.getContractFactory(
    ERC20_TOKEN_NAME,
  )) as unknown as ERC20Token__factory;

  let ownerERC20Token: ERC20Token;

  if (typeof deployData === 'string') {
    ownerERC20Token = testERC20TokenFactory.connect(owner).attach(deployData) as ERC20Token;
  } else {
    const newOwner = deployData?.newOwner ?? owner2Address;
    ownerERC20Token = await testERC20TokenFactory.connect(owner).deploy(...getTokenArgs(newOwner));
  }

  const erc20TokenAddress = await ownerERC20Token.getAddress();

  const user1ERC20Token = ownerERC20Token.connect(user1);
  const user2ERC20Token = ownerERC20Token.connect(user2);
  const user3ERC20Token = ownerERC20Token.connect(user3);
  const owner2ERC20Token = ownerERC20Token.connect(owner2);

  return {
    erc20TokenAddress,
    ownerERC20Token,
    user1ERC20Token,
    user2ERC20Token,
    user3ERC20Token,
    owner2ERC20Token,
  };
}

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

export async function getContext(
  erc20TokenAddress: string,
  sqrVestingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const erc20TokenContext = await getERC20TokenContext(users, erc20TokenAddress);
  const sqrVestingContext = await getSQRVestingContext(users, sqrVestingAddress);

  return {
    ...users,
    ...erc20TokenContext,
    ...sqrVestingContext,
  };
}
