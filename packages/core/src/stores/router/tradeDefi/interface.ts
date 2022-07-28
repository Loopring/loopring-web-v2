import { DeFiCalcData, MarketType } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { DeFiChgType } from "@loopring-web/component-lib";

export type TradeDefi<C> = {
  type: string;
  market?: MarketType; // eg: ETH-LRC, Pair from loopring market
  isStoB: boolean;
  sellVol: string;
  buyVol: string;
  sellToken: TokenInfo;
  buyToken: TokenInfo;
  deFiCalcData?: DeFiCalcData<C>;
  fee: string;
  feeRaw: string;
  depositPrice?: string;
  withdrawPrice?: string;
  maxSellVol?: string;
  maxBuyVol?: string;
  maxFeeBips?: number;
  miniSellVol?: string;
  request?: sdk.DefiOrderRequest;
  defiBalances?: { [ key: string ]: string };
  lastInput?: DeFiChgType;
};

export type TradeDefiStatus<C> = {
  tradeDefi: TradeDefi<C>;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
