import { InputButtonProps } from "../../../basic-lib";
import { AccountStatus, CoinInfo } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";

export type DeFiChgData<T> = {
  type: "coinA" | "coinB";
  tradeData: T;
};
export type DeFiWrapProps<T, I, ACD> = {
  isStob?: boolean;
  disabled?: boolean;
  onSubmitClick: (data: T) => void;
  switchStobEvent?: (_isStoB: boolean) => void;
  onChangeEvent: (data: DeFiChgData<T>) => void;
  handleError?: (data: T) => void;
  tokenAProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  tokenBProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  deFiCalcData: ACD;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  accStatus?: AccountStatus;
};
