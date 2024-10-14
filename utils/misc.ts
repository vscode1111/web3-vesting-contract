import { Numeric } from 'ethers';
import { printDate, printToken } from '~common-contract';
import { WEB3Vesting } from '~typechain-types/contracts/WEB3Vesting';

export function printClaimInfo(
  claimInfo: WEB3Vesting.ClaimInfoStruct,
  decimals: Numeric,
  tokenName?: string,
) {
  const {
    amount,
    canRefund,
    claimed,
    claimCount,
    claimedAt,
    exist,
    canClaim,
    available,
    remain,
    nextAvailable,
    nextClaimAt,
    refunded,
  } = claimInfo;

  return {
    amount: printToken(amount, decimals, tokenName),
    canClaim,
    claimed: printToken(claimed, decimals, tokenName),
    claimCount: Number(claimCount),
    claimedAt: printDate(claimedAt),
    exist,
    available: printToken(available, decimals, tokenName),
    remain: printToken(remain, decimals, tokenName),
    nextAvailable: printToken(nextAvailable, decimals, tokenName),
    nextClaimAt: printDate(nextClaimAt),
    canRefund,
    refunded,
  };
}

export async function printUserInfo(
  userAddress: string,
  owner2WEB3Vesting: WEB3Vesting,
  decimals: Numeric,
  tokenName: string,
) {
  console.log(`User ${userAddress}:`);
  const user1Info = printClaimInfo(
    await owner2WEB3Vesting.fetchClaimInfo(userAddress),
    decimals,
    tokenName,
  );
  console.table(user1Info);
}
