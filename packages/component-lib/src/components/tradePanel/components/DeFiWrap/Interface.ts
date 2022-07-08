import { BtnInfo, InputButtonProps } from "../../../basic-lib";
import { AccountStatus, CoinInfo } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../../Interface";
import React from "react";

export enum DeFiChgType {
  coinSell = "coinSell",
  coinBuy = "coinBuy",
  exchange = "exchange",
}

export type DeFiChgData<T> = {
  type: DeFiChgType;
  tradeData?: undefined | T;
};
export type DeFiWrapProps<T, I, ACD> = {
  isStoB?: boolean;
  disabled?: boolean;
  btnInfo?: BtnInfo;
  refreshRef: React.Ref<any>;
  onRefreshData?: () => void;
  isLoading: boolean;
  // btnStatus: keyof typeof TradeBtnStatus | undefined;
  onSubmitClick: () => void;
  onConfirm: () => void;
  switchStobEvent?: (_isStoB: boolean) => void;
  onChangeEvent: (data: DeFiChgData<T>) => void;
  handleError?: (data: T) => void;
  tokenAProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  tokenBProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  deFiCalcData: ACD;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  btnStatus?: keyof typeof TradeBtnStatus | undefined;
  accStatus?: AccountStatus;
};
