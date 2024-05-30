import { printDate, printToken } from '~common-contract';

type ClaimInfo = [bigint, bigint, bigint, boolean, boolean, bigint, bigint, bigint] & {
  _amount: bigint;
  _claimed: bigint;
  _claimedAt: bigint;
  _exist: boolean;
  _canClaim: boolean;
  _available: bigint;
  _remain: bigint;
  _nextClaimAt: bigint;
};

export function printClaimInfo(claimInfo: ClaimInfo, decimals: number, tokenName?: string) {
  const [amount, claimed, claimedAt, exist, canClaim, available, remain, nextClaimAt] = claimInfo;

  return {
    amount: printToken(amount, decimals, tokenName),
    claimed: printToken(claimed, decimals, tokenName),
    claimedAt: printDate(claimedAt),
    exist,
    canClaim,
    available: printToken(available, decimals, tokenName),
    remain: printToken(remain, decimals, tokenName),
    nextClaimAt: printDate(nextClaimAt),
  };
}
