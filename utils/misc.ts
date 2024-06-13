import { printDate, printToken } from '~common-contract';
import { SQRVesting } from '~typechain-types/contracts/SQRVesting';

// type ClaimInfo = [bigint, bigint, bigint, boolean, boolean, bigint, bigint, bigint, bigint] & {
//   _amount: bigint;
//   _claimed: bigint;
//   _claimedAt: bigint;
//   _exist: boolean;
//   _canClaim: boolean;
//   _available: bigint;
//   _remain: bigint;
//   _nextClaimAt: bigint;
//   nextAvailable: bigint;
// };

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
    canClaim,
    available,
    remain,
    nextClaimAt,
    nextAvailable,
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
  };
}
