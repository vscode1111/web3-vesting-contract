export interface ContractData {
  name: string;
  symbol: string;
}

export interface AllocationRecord {
  address: string;
  amount: bigint;
}

export interface AllocationFileRecord {
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
