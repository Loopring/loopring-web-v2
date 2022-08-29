import { DualCalcData, MarketType } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { TokenInfo } from "@loopring-web/loopring-sdk";

export type TradeDual<C> = {
  type: string;
  market?: MarketType; // eg: ETH-LRC, Pair from loopring market
  isStoB: boolean;
  sellVol: string;
  buyVol: string;
  sellToken: TokenInfo;
  buyToken: TokenInfo;
  dualCalcData?: DualCalcData<C>;
  fee: string;
  feeRaw: string;
  depositPrice?: string;
  withdrawPrice?: string;
  maxSellVol?: string;
  maxBuyVol?: string;
  maxFeeBips?: number;
  miniSellVol?: string;
  request?: sdk.DualOrderRequest;
  DualBalances?: { [key: string]: string };
};

export type TradeDualStatus<C> = {
  tradeDual: TradeDual<C>;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
