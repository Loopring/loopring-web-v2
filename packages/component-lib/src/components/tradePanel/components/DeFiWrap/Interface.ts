import { InputButtonProps } from "../../../basic-lib";
import { AccountStatus, CoinInfo } from "@loopring-web/common-resources";

export type DeFiChgData<AT> = {
  type: "coinA" | "coinB";
  tradeData: AT;
};
export type DeFiWrapProps<T, I, ACD> = {
  isStob?: boolean;
  switchStobEvent?: (_isStoB: boolean) => void;
  disabled?: boolean;
  onChangeEvent: (data: DeFiChgData<T>) => void;
  tokenAProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  tokenBProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>;
  DeFiCalcData: ACD;
  accStatus?: AccountStatus;
};
