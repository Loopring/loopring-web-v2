import * as sdk from "@loopring-web/loopring-sdk";
import {
  DepthViewData,
  MarketType,
  TradeCalcProData,
  TradeProType,
  Ticker,
} from "@loopring-web/common-resources";
import { DepthType, RawDataTradeItem } from "@loopring-web/component-lib";

export type MarketCalcParams = {
  exceedDepth: boolean;
  isReverse: boolean;
  isAtoB: boolean;
  slipBips: string;
  takerRate: string | number;
  feeBips: string | number;
  output: string;
  sellAmt: string;
  buyAmt: string;
  amountS: string;
  amountBOut: string;
  amountBOutWithoutFee: string;
  amountBOutSlip: {
    minReceived: string;
    minReceivedVal: string;
  };
  priceImpact: string;
};

export type limitCalcParams = {
  isBuy: boolean;
  priceImpact: number;
  baseVol: string;
  baseVolShow: string | number;
  amountBOut: string;
  quoteVol: string;
  quoteVolShow: string | number;
};
export type stopLimitCalcParams = limitCalcParams & {
  stopPrice: string;
};

export type OrderInfoPatch = {
  minAmtShow?: number | string;
  symbol?: string;
  minAmtCheck?: boolean;
};

export type PageTradePro<C> = {
  market: MarketType; // eg: ETH-LRC, Pair from loopring market
  // tradePair?: MarketType  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
  request?: sdk.SubmitOrderRequestV3 | null | undefined;
  tradeCalcProData: Partial<TradeCalcProData<keyof C>>;
  calcTradeParams?: Partial<MarketCalcParams> | null | undefined;
  limitCalcTradeParams?: Partial<limitCalcParams> | null | undefined;
  stopLimitCalcTradeParams?: Partial<stopLimitCalcParams> | null | undefined;
  priceImpactObj?:
    | {
        // account has activated or undefined
        value: number | string;
        priceImpactColor: string;
        priceLevel: number | string;
      }
    | null
    | undefined;
  tradeType: TradeProType;
  chooseDepth?: (DepthViewData & { type: DepthType | "close" }) | null;
  precisionLevels?: { value: number; label: string }[];
  depth?: sdk.DepthData | undefined;
  depthForCalc?: sdk.DepthData | undefined;
  depthLevel?: number;
  ticker?: Ticker | undefined;
  ammPoolSnapshot?: sdk.AmmPoolSnapshot | undefined;
  feeBips?: number | string;
  takerRate?: number | string;
  sellUserOrderInfo?: undefined | null | sdk.OrderInfo;
  buyUserOrderInfo?: undefined | null | sdk.OrderInfo;
  minOrderInfo?: undefined | null | Partial<sdk.OrderInfo & OrderInfoPatch>;
  lastStepAt?: "base" | "quote" | undefined;
  tradeArray?: RawDataTradeItem[];
  tradeMapByTimeStamp?: {
    [key: string]: RawDataTradeItem;
  };
  totalFee?: number | string;
  maxFeeBips?: number;
  feeTakerRate?: number;
  tradeCost?: string;
};

export type PageTradeProStatus<C extends { [key: string]: any }> = {
  pageTradePro: PageTradePro<C>;
  __DAYS__: 30;
  __API_REFRESH__: 15000;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
  __AUTO_RE_CALC__: 3000;
};
