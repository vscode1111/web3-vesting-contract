import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { callWithTimerHre, waitTx } from '~common-contract';
import { SQR_VESTING_NAME, TX_OVERRIDES } from '~constants';
import { contractConfig, seedData } from '~seeds';
import { getAddressesFromHre, getContext } from '~utils';
import { deployParams } from './deployData';

const recipientsExt: string[] = [
  '0xc109D9a3Fc3779db60af4821AE18747c708Dfcc6', //user1
  '0xf9925f008208BB20c0255BD3C6F9c3e28CECc2ff', //user2
  '0x1ab954A2cD722969b46D4F078e97e84a7300454b', //user3
  '0x876f6629fce3C6DebC00FA18a237689121B62955', //Ruslan
  '0xdcC3D384a79aD184Ac949e777B7c587877DeF0af', //Nadezhda
  '0x85b344F9aa5a88E6bAe1196E9836B62d2E3bC0ad', //Nadezhda
  '0x60E85E3a7a9BaB7ff19268802792840C8d2a8286', //Nadezhda
];

const EXTERNAL = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  await callWithTimerHre(async () => {
    const { sqrVestingAddress } = getAddressesFromHre(hre);
    console.log(`${SQR_VESTING_NAME} ${sqrVestingAddress} is setting allocations...`);
    const erc20TokenAddress = contractConfig.erc20Token;
    const context = await getContext(erc20TokenAddress, sqrVestingAddress);
    const { user1Address, user2Address, user3Address, owner2SQRVesting, sqrVestingFactory } =
      context;
    const { allocation1, allocation2, allocation3 } = seedData;

    const recipients = EXTERNAL ? recipientsExt : [user1Address, user2Address, user3Address];

    const amounts = EXTERNAL
      ? [allocation1, allocation2, allocation3, allocation1, allocation2, allocation3, allocation1]
      : [allocation1, allocation2, allocation3];

    const params = {
      recipients,
      amounts,
    };

    console.table(params);

    await waitTx(
      owner2SQRVesting.setAllocations(params.recipients, params.amounts, TX_OVERRIDES),
      'setAllocations',
      deployParams.attempts,
      deployParams.delay,
      sqrVestingFactory,
    );
  }, hre);
};

func.tags = [`${SQR_VESTING_NAME}:set-allocations`];

export default func;
