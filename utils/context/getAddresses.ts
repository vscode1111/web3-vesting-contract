import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getNetworkName } from '~common-contract';
import { CONTRACTS } from '~constants';
import { Addresses, DeployNetworks } from '~types';

export function getAddresses(network: keyof DeployNetworks): Addresses {
  const erc20TokenAddress = CONTRACTS.ERC20_TOKEN[network];
  const web3VestingAddress = CONTRACTS.WEB3_VESTING[network];
  return {
    erc20TokenAddress,
    web3VestingAddress,
  };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
  return getAddresses(getNetworkName(hre));
}
