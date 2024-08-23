export interface ContractData {
  name: string;
  symbol: string;
}

export interface DepositAllocationRecord {
  address: string;
  amount: bigint;
}

export interface DepositAllocationFileRecord {
  address: string;
  amount: number;
}

export interface DepositRefundRecord {
  address: string;
  boosted: boolean;
  baseDeposited: number;
  baseAllocation: number;
  baseRefund: number;
  boostRefund: number;
  nonce: number;
}

export interface VestingAllocationRecord {
  address: string;
  canClaim: boolean;
  amount: number;
  claimed: number;
  claimCount: number;
  claimedAt?: Date;
  available: number;
  remain: number;
  nextAvailable: number;
  nextClaimAt?: Date;
  canRefund: boolean;
  refunded: boolean;
}
