import { BtnInfo, InputButtonProps } from "../../../basic-lib";
import { AccountStatus, CoinInfo } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../../Interface";
import React from "react";

export type DualChgData<T> = {
  tradeData?: undefined | T;
};
export type DualWrapProps<T, I, DUAL> = {
  disabled?: boolean;
  btnInfo?: BtnInfo;
  refreshRef: React.Ref<any>;
  onRefreshData?: (shouldFeeUpdate?: boolean, clearTrade?: boolean) => void;
  isLoading: boolean;
  // maxSellVol?: string;
  onSubmitClick: () => void;
  onChangeEvent: (data: DualChgData<T>) => void;
  handleError?: (data: T) => void;
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  dualCalcData: DUAL;
  tokenSell: TokenInfo;
  btnStatus?: keyof typeof TradeBtnStatus | undefined;
  accStatus?: AccountStatus;
};
