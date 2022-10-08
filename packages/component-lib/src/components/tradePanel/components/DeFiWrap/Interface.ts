import { BtnInfo, InputButtonProps } from "../../../basic-lib";
import {
  AccountStatus,
  CoinInfo,
  DeFiChgType,
  MarketType,
} from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../../Interface";
import React from "react";

export type DeFiChgData<T> = {
  type: DeFiChgType;
  tradeData?: undefined | T;
};
export type DeFiWrapProps<T, I, ACD> = {
  isStoB?: boolean;
  isJoin: boolean;
  disabled?: boolean;
  btnInfo?: BtnInfo;
  refreshRef: React.Ref<any>;
  onRefreshData?: (shouldFeeUpdate?: boolean, clearTrade?: boolean) => void;
  isLoading: boolean;
  market: MarketType;
  maxBuyVol?: string;
  maxSellVol?: string;
  confirmShowLimitBalance: boolean;
  // btnStatus: keyof typeof TradeBtnStatus | undefined;
  onSubmitClick: () => void;
  onConfirm: () => void;
  switchStobEvent?: (_isStoB: boolean) => void;
  onChangeEvent: (data: DeFiChgData<T>) => void;
  handleError?: (data: T) => void;
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  deFiCalcData: ACD;
  tokenSell: TokenInfo;
  tokenBuy: TokenInfo;
  btnStatus?: keyof typeof TradeBtnStatus | undefined;
  accStatus?: AccountStatus;
};
