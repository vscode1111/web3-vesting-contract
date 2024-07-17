import { IDepositRefund__factory } from '~typechain-types/factories/contracts/IDepositRefund__factory';
import { DepositRefundContext, Users } from '~types';

export async function getDepositRefundContext(
  users: Users,
  contractAddress: string,
): Promise<DepositRefundContext> {
  const { user1, user2, user3, owner2 } = users;
  const ownerDepositRefund = IDepositRefund__factory.connect(contractAddress);
  const depositRefundAddress = await ownerDepositRefund.getAddress();

  const user1DepositRefund = ownerDepositRefund.connect(user1);
  const user2DepositRefund = ownerDepositRefund.connect(user2);
  const user3DepositRefund = ownerDepositRefund.connect(user3);
  const owner2DepositRefund = ownerDepositRefund.connect(owner2);

  return {
    depositRefundAddress,
    ownerDepositRefund,
    user1DepositRefund,
    user2DepositRefund,
    user3DepositRefund,
    owner2DepositRefund,
  };
}
