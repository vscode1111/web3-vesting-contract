import {
  ClaimEvent,
  ForceWithdrawEvent,
  RefundEvent,
  SetAllocationEvent,
  WithdrawExcessAmountEvent,
} from '~typechain-types/contracts/SQRVesting';
import { ContextBase } from '~types';

type Fixture<T> = () => Promise<T>;

declare module 'mocha' {
  export interface Context extends ContextBase {
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
  }
}

export interface EventArgs<T> {
  args: T;
}

export type ClaimEventArgs = ClaimEvent.Event & EventArgs<[string, number]>;
export type RefundEventArgs = RefundEvent.Event & EventArgs<[string]>;

export type SetAllocationEventArgs = SetAllocationEvent.Event & EventArgs<[string, number]>;

export type WithdrawExcessAmountEventArgs = WithdrawExcessAmountEvent.Event &
  EventArgs<[string, number]>;

export type ForceWithdrawEventArgs = ForceWithdrawEvent.Event & EventArgs<[string, string, number]>;
