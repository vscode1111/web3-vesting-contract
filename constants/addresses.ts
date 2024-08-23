import { DeployNetworks } from '~types';

export const SQR_VESTING_NAME = 'SQRVesting';
export const ERC20_TOKEN_NAME = 'ERC20Token';
export const DEPOSIT_REFUND_NAME = 'IDepositRefund';

export enum CONTRACT_LIST {
  ERC20_TOKEN = 'ERC20_TOKEN',
  SQR_VESTING = 'SQR_VESTING',
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
  ERC20_TOKEN: {
    mainnet: '0xa7D4078926d6fB63d843F17811893E29Cdb2fecA', //tSQR2
    bsc: '0x8364a68c32E581332b962D88CdC8dBe8b3e0EE9c', //tSQR2
  },
  SQR_VESTING: {
    // mainnet: '0x3f1Ba41D0b48CdAfAABC5D87075aCbC6dCFe62A4', //Test
    mainnet: '0xb56929cd81D1bb2c33693e8078C88c90e32774a2', //Test
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
    // bsc: '0xF533FE4157775733175dbd6F24576094b9fDc3b7', //Test - 1m - 269 txs
    // bsc: '0x5A6bB77318f560EDeAafc48c6377923A6C53BD4a', //Test - 1m - 66 txs
    // bsc: '0xcF127d7Ec3052447ADA2e2b7A0E55d490430De66', //Test - 1m - 66 txs
    // bsc: '0xBCB751dd0343A330b171Cb345eB3E1d7166384a1', //Test - 1m - 1K allocations
    // bsc: '0xFa8d49ACcD13019b49880E67D468930d18B5DDDf', //Test - 1m - 1K allocations
    // bsc: '0xF9AA888D7212FAf5ff43d9b34194727f84676C86', //Test - 1m - 1K allocations
    // bsc: '0x2452F049A4598d03140392771766E68b23AF3d41', //Test - 1m - 1K allocations

    //Main
    // bsc: '0x8f9D1C8D27de370D3770c855D3f2E0986E3e7373', //Main - availableRefund
    // bsc: '0xDe0fD496728a1Bf13D9F6347c03eA34d00FC334c', //Main - availableRefund
    // bsc: '0xbF7FF12786b9CE22Fc8Ee053843aF520a9CAF833', //Main - availableRefund
    // bsc: '0xcEE080Cc66ebFC2F80564E071F2E17DFf30D0937', //Main - availableRefund - v2.1
    bsc: '0xaBE63311f7c16aa523f5617618244da37FDe67aA', //Main - availableRefund - v2.2

    // Prod
    // bsc: '0x9348A50dB866EF8e47037aE20bB03a8Fbf2c875D', //Prod - 1.5
    // bsc: '0xCc3B4734775C4C6abE78fb8C2FEcAaFdEb2245cc', //Prod - 148K - 0x73ee8C0cb385a663A411D306b7aa249b59c18d7d
    // bsc: '0x268C717c7a3c70aC31722EAD8978bb9407ceB39F', //Prod - 119K - 0x46A49a705d8E7a7765dce7e5F4016fBC44DF3fA3
    // bsc: '0x0A90A7be0b94720510715573a366A6e58a6b4A8E', //Prod - 90K - 0xd4F4c2eE273c0F3611f7f93EA8e8eED4fef6906F
    // bsc: '0x4568D54852e18f54a31dF0a3B4FF9a95A81Bc39c', //Prod - 25K - 0xf98844b0103a68E58B5ce99415879A1e30AFCAAC
    // bsc: '0x3F629B77BD8B4DC23B46B71AFdBeE80282da2318', //Prod - 25K - 0x99518a992cC4d9c51f0ae4B269D45F4e9e33b0b2
  },
};
