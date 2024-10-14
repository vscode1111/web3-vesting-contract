import { time } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import dayjs, { Dayjs } from 'dayjs';
import { Numeric, TransactionReceipt } from 'ethers';
import { Context } from 'mocha';
import { ContractConfig, seedData } from '~seeds';
import { ContextBase } from '~types';
import { loadFixture } from './loadFixture';
import { deployWEB3VestingContractFixture } from './web3Vesting.fixture';

export async function getERC20TokenBalance(that: ContextBase, address: string) {
  return that.owner2ERC20Token.balanceOf(address);
}

export async function checkTotalWEB3Balance(that: ContextBase) {
  expect(
    await getTotalWEB3Balance(that, [
      that.user1Address,
      that.user2Address,
      that.user3Address,
      that.ownerAddress,
      that.owner2Address,
      that.erc20TokenAddress,
      that.web3VestingAddress,
    ]),
  ).eq(seedData.totalAccountBalance);
}

export async function getTotalWEB3Balance(that: ContextBase, accounts: string[]): Promise<bigint> {
  const result = await Promise.all(accounts.map((address) => getERC20TokenBalance(that, address)));
  return result.reduce((acc, cur) => acc + cur, seedData.zero);
}

export function findEvent<T>(receipt: TransactionReceipt) {
  return receipt.logs.find((log: any) => log.fragment) as T;
}

export function findEvents<T>(receipt: TransactionReceipt) {
  return receipt.logs.filter((log: any) => log.fragment) as T[];
}

export async function getChainTime() {
  const chainTime = await time.latest();
  return dayjs(chainTime * 1000);
}

export async function loadWEB3VestingFixture(
  that: Context,
  contractConfig?: Partial<ContractConfig>,
  onNewSnapshot?: (
    chainTime: Dayjs,
    contractConfig?: Partial<ContractConfig | undefined>,
  ) => Promise<Partial<ContractConfig> | undefined>,
) {
  const fixture = await loadFixture(
    deployWEB3VestingContractFixture,
    contractConfig,
    async (config) => {
      const chainTime = await getChainTime();
      const newConfig = await onNewSnapshot?.(chainTime, config);
      return {
        ...config,
        ...newConfig,
      };
    },
  );

  for (const field in fixture) {
    that[field] = fixture[field as keyof ContextBase];
  }

  await checkTotalWEB3Balance(that);
}

export function calculateClaimAt(contractConfig: ContractConfig, passedPeriod: Numeric = 0) {
  return (
    contractConfig.startDate +
    contractConfig.cliffPeriod +
    Number(passedPeriod) * contractConfig.unlockPeriod
  );
}
