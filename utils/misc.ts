import { printDate, printToken } from '~common-contract';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';

export function printClaimInfo(
  claimInfo: SQRVesting.ClaimInfoStruct,
  decimals: number,
  tokenName?: string,
) {
  const {
    amount,
    claimed,
    claimedAt,
    exist,
    refunded,
    canClaim,
    available,
    remain,
    nextClaimAt,
    nextAvailable,
    canRefund,
  } = claimInfo;

  return {
    amount: printToken(amount, decimals, tokenName),
    claimed: printToken(claimed, decimals, tokenName),
    claimedAt: printDate(claimedAt),
    exist,
    refunded,
    canClaim,
    available: printToken(available, decimals, tokenName),
    remain: printToken(remain, decimals, tokenName),
    nextClaimAt: printDate(nextClaimAt),
    nextAvailable: printToken(nextAvailable, decimals, tokenName),
    canRefund,
  };
}
