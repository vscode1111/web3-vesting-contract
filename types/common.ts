export interface DeployNetworks {
  mainnet: string;
  bsc: string;
}

export interface Addresses {
  erc20TokenAddress: string;
  sqrVestingAddress: string;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
