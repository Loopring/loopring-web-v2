import { MarketType, TradeCalcData } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type TradeCex = {
  market: MarketType;
  tradePair?: MarketType; //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
  request?: sdk.OriginCEXV3OrderRequest | null | undefined;
  tradeCalcData: Partial<TradeCalcData<any>>;
  depth?: sdk.DepthData | undefined;
  totalFeeRaw?: number | string;
  totalFee?: number | string;
  maxFeeBips?: number;
  sellMinAmtInfo?: string;
  sellMaxL2AmtInfo?: string;
  sellMaxAmtInfo?: string;
  lastStepAt: "sell" | "buy";
} & Omit<sdk.CEX_MARKET, "market">;

export type TradeCexStatus = {
  tradeCex: TradeCex;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
