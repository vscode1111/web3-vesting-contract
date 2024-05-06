import { DeployNetworks } from '~types';

export const SQR_VESTING_NAME = 'SQRVesting';
export const ERC20_TOKEN_NAME = 'ERC20Token';

export enum CONTRACT_LIST {
  ERC20_TOKEN = 'ERC20_TOKEN',
  SQR_VESTING = 'SQR_VESTING',
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  ERC20_TOKEN: {
    bsc: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
  },
  SQR_VESTING: {
    // bsc: '0xc9b15Fe39ED32F8338b59C8A6ed885ACF5dC6b1f', //Test
    // bsc: '0xee539859d7Eea7034835cd12af9EAc6347F37b56', //Test
    // bsc: '0xB084a0De743043985603A7EE5565Bbd99446113d', //Test
    // bsc: '0x06565822ce89D298BAf86BBD39864441BFe3F9bd', //Test
    // bsc: '0xdBdC7C9c402b5F070bdDeC21e217214836778688', //Test
    // bsc: '0x09bE2A022C18B5ba489207c4F82d00e90b1E1Ac7', //Test
    // bsc: '0xd3fa875716E20C572bC530C12b6ab008C5062336', //Test
    bsc: '0x9d247c45f1ccace6207C3df586896D289A24C881', //Test
    // bsc: '', //Prod
  },
};
