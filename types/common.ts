export interface DeployNetworks {
  mainnet: string;
  bsc: string;
}

export interface Addresses {
  erc20TokenAddress: string;
  web3VestingAddress: string;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
