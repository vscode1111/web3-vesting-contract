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
    claimed,
    claimedAt,
    exist,
    canClaim,
    available,
    remain,
    nextClaimAt,
    nextAvailable,
    canRefund,
    refunded,
  } = claimInfo;

  return {
    amount: printToken(amount, decimals, tokenName),
    claimed: printToken(claimed, decimals, tokenName),
    claimedAt: printDate(claimedAt),
    exist,
    canClaim,
    available: printToken(available, decimals, tokenName),
    remain: printToken(remain, decimals, tokenName),
    nextClaimAt: printDate(nextClaimAt),
    nextAvailable: printToken(nextAvailable, decimals, tokenName),
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
