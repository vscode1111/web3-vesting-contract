import { ContextBase } from '~types';
import { getERC20TokenContext } from './getERC20TokenContext';
import { getSQRVestingContext } from './getSQRVestingContext';
import { getUsers } from './getUsers';

export async function getContext(
  erc20TokenAddress: string,
  sqrVestingAddress: string,
): Promise<ContextBase> {
  const users = await getUsers();
  const erc20TokenContext = await getERC20TokenContext(users, erc20TokenAddress);
  const sqrVestingContext = await getSQRVestingContext(users, sqrVestingAddress);

  return {
    ...users,
    ...erc20TokenContext,
    ...sqrVestingContext,
  };
}
