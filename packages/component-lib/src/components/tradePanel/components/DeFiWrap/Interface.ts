import { BtnInfo, InputButtonProps } from "../../../basic-lib";
import { AccountStatus, CoinInfo } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../../Interface";

export type DeFiChgData<T> = {
  type: "coinA" | "coinB";
  tradeData: T;
};
export type DeFiWrapProps<T, I, ACD> = {
  isStoB?: boolean;
  disabled?: boolean;
  btnInfo?: BtnInfo;
  // btnStatus: keyof typeof TradeBtnStatus | undefined;
  onSubmitClick: () => void;
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
