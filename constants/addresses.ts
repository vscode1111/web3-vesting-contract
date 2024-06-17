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
    // bsc: '0x9d247c45f1ccace6207C3df586896D289A24C881', //Test
    // bsc: '0x91a60612b3473DF9A31e6369ff06CD7F539dcC37', //Test
    // bsc: '0x958181d2c94f66cD879B4743737eB2f458aE7DA1', //Test - not empty
    // bsc: '0x1465BB8d79c7E87a323bcA0d74F7192e8cD28Bbd', //Test
    // bsc: '0xFc321266c994EA06EA11D08F573Cf170Ee896598', //Test
    // bsc: '0x80181AA57A12243781E15e21eF9E26B7e8cc8276', //Main
    // bsc: '0x3982FC49E545c9E65AFe3dafA4D618937c118a77', //Main
    // bsc: '0x19e49b8c517c79716dbC783dE659Fe85512720a8', //Main
    // bsc: '0x4eAF8049685D2EC32d9eC29f5430C57E839Db3Ca', //Test
    // bsc: '0x4d73bAeEaaC4226b87C026f8EC20441fa5E289e4', //Test
    // bsc: '0x4CfF5924b4B4C1cB6A02F1e1a542cc55A8bc6019', //Test - 1m
    // bsc: '0x3554A27F8e0869fE568DcF3ebE922Ce9200e16BE', //Test - 1m
    // bsc: '0x9e70e6266fd047bc2ec6a734d1a62d1bb243c818', //Test - 1m
    // bsc: '0x8aAF33833309F423162FC4aB315C1F03b79172dA', //Test - 1m
    // bsc: '0xaDa5Df89C7275a021D5174453d55c56F5727308B', //Test - 1m
    // bsc: '0x4e69aaA1c3c8C80e20d0621d1F3aca29866aDF3c', //Test - 1m
    bsc: '0x5a808E0145993FdD4d18e2b6d53a43c8aDf1bB23', //Test - 1m
    // bsc: '', //Prod
  },
};
