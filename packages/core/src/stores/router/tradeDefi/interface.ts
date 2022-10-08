import { TradeDefi } from "@loopring-web/common-resources";

export type TradeDefiStatus<C> = {
  tradeDefi: TradeDefi<C>;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
