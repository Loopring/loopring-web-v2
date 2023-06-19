import { InputButtonProps } from "../../basic-lib";
import {
  AccountStatus,
  AmmExitData,
  AmmJoinData,
  CoinInfo,
  IBData,
} from "@loopring-web/common-resources";
import { AmmDepositBaseProps, AmmWithdrawBaseProps } from "../components";

export enum AmmPanelType {
  Join = 0,
  Exit = 1,
}

/**
 *
 */
export type AmmPanelBaseProps<T, TW, I, ACD, C> = {
  ammDepositData: T;
  ammWithdrawData: TW;
  tabSelected?: AmmPanelType;
  disableDeposit?: boolean;
  disableWithdraw?: boolean;
  ammCalcDataDeposit: ACD;
  ammCalcDataWithDraw: ACD;
  tokenDepositAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>;
  tokenDepositBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>;
  tokenWithDrawAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>;
  tokenWithDrawBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>;
  ammDepositBtnI18nKey?: string;
  ammWithdrawBtnI18nKey?: string;
  height?: number;
  width?: number;
};

export type AmmProps<
  T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
  TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
  I,
  ACD,
  C = IBData<I>
> = AmmPanelBaseProps<T, TW, I, ACD, C> & {
  handleAmmAddChangeEvent: (data: T, focusOn: "coinA" | "coinB") => void;
  handleAmmRemoveChangeEvent: (data: TW) => void;
  // onAmmAddChangeEvent?: (data: AmmChgData<T>) => AmmChgData<T>;
  // onRemoveChangeEvent?: (
  //   data: AmmWithdrawChgData<TW>
  // ) => AmmWithdrawChgData<TW>;
  refreshRef: React.Ref<any>;
  onRefreshData?: () => void;
  accStatus?: AccountStatus;
  coinAPrecision?: number;
  coinBPrecision?: number;
  ammType: AmmPanelType;
  handleTabChange: (index: AmmPanelType) => void;
} & AmmWithdrawBaseProps<TW, I> &
  AmmDepositBaseProps<T, I>;
