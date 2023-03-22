import { RedeemStack, TradeStack } from "@loopring-web/common-resources";

export type TradeStackStatus<C> = {
  tradeStack: TradeStack<C>;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};

export type RedeemStackStatus<C> = {
  redeemStack: RedeemStack<C>;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
