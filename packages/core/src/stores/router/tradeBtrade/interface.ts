import {
  BtradeTradeCalcData,
  BtradeType,
  MarketType,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { OrderInfoPatch } from "../tradePro";

export type TradeBtrade = {
  market: MarketType;
  tradePair?: MarketType; //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
  request?: sdk.OriginBTRADEV3OrderRequest | null | undefined;
  tradeCalcData: Partial<BtradeTradeCalcData<any>>;
  depth?: sdk.DepthData | undefined;
  sellToken: string;
  buyToken: string;
  totalFeeRaw?: number | string;
  totalFee?: number | string;
  maxFeeBips?: number;
  sellMinAmtInfo?: string;
  sellMaxL2AmtInfo?: string;
  sellMaxAmtInfo?: string;
  lastStepAt: "sell" | "buy" | undefined;
  sellUserOrderInfo?: undefined | null | sdk.OrderInfo;
  buyUserOrderInfo?: undefined | null | sdk.OrderInfo;
  minOrderInfo?: undefined | null | Partial<sdk.OrderInfo & OrderInfoPatch>;
  info: sdk.BTRADE_MARKET;
  btradeType: undefined | BtradeType;
};

export type TradeBtradeStatus = {
  tradeBtrade: TradeBtrade;
  __DAYS__: 30;
  __SUBMIT_LOCK_TIMER__: 1000;
  __TOAST_AUTO_CLOSE_TIMER__: 3000;
};
