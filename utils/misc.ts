import { Numeric } from 'ethers';
import { printDate, printToken } from '~common-contract';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';

export function printClaimInfo(
  claimInfo: SQRVesting.ClaimInfoStruct,
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
  owner2SQRVesting: SQRVesting,
  decimals: Numeric,
  tokenName: string,
) {
  console.log(`User ${userAddress}:`);
  const user1Info = printClaimInfo(
    await owner2SQRVesting.fetchClaimInfo(userAddress),
    decimals,
    tokenName,
  );
  console.table(user1Info);
}
