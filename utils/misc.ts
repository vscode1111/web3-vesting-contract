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

export function printClaimInfo(claimInfo: ClaimInfo) {
  const [amount, claimed, claimedAt, exist, canClaim, available, remain, nextClaimAt] = claimInfo;

  return {
    amount,
    claimed,
    claimedAt,
    exist,
    canClaim,
    available,
    remain,
    nextClaimAt,
  };
}
