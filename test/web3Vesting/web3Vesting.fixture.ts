import { ContractConfig, contractConfig } from '~seeds';
import { ContextBase } from '~types';
import { getERC20TokenContext, getWEB3VestingContext, getUsers } from '~utils';

export async function deployWEB3VestingContractFixture(
  contractConfigParam?: Partial<ContractConfig>,
): Promise<ContextBase> {
  const users = await getUsers();
  const { owner2Address } = users;

  const erc20TokenContext = await getERC20TokenContext(users);
  const { erc20TokenAddress } = erc20TokenContext;

  const config: ContractConfig = {
    ...contractConfig,
    ...contractConfigParam,
    newOwner: owner2Address,
    erc20Token: erc20TokenAddress,
  };

  const web3VestingContext = await getWEB3VestingContext(users, config);

  return {
    ...users,
    ...erc20TokenContext,
    ...web3VestingContext,
  };
}
