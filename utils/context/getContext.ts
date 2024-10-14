import { ContextBase } from '~types';
import { getERC20TokenContext } from './getERC20TokenContext';
import { getWEB3VestingContext } from './getWEB3VestingContext';
import { getUsers } from './getUsers';

export async function getContext(
  erc20TokenAddress: string,
  web3VestingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const erc20TokenContext = await getERC20TokenContext(users, erc20TokenAddress);
  const web3VestingContext = await getWEB3VestingContext(users, web3VestingAddress);

  return {
    ...users,
    ...erc20TokenContext,
    ...web3VestingContext,
  };
}
