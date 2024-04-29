import { DeployNetworks } from '~types';

export const SQR_VESTING_NAME = 'SQRVesting';
export const ERC20_TOKEN_NAME = 'ERC20Token';

export enum CONTRACT_LIST {
  SQR_VESTING = 'SQR_VESTING',
}

export const TOKENS: Record<CONTRACT_LIST, DeployNetworks> = {
  SQR_VESTING: {
    // bsc: '0xc9b15Fe39ED32F8338b59C8A6ed885ACF5dC6b1f', //Test
    // bsc: '0xee539859d7Eea7034835cd12af9EAc6347F37b56', //Test
    // bsc: '0xB084a0De743043985603A7EE5565Bbd99446113d', //Test
    bsc: '0x06565822ce89D298BAf86BBD39864441BFe3F9bd', //Test
    // bsc: '', //Prod
  },
};
