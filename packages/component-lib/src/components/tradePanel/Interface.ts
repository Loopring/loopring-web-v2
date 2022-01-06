import {
  CoinKey,
  IBData,
  TradeCalcProData,
} from "@loopring-web/common-resources";
import {
  BasicACoinTradeHookProps,
  DefaultProps,
  DepositExtendProps,
  DepositInfoProps as _DepositInfoProps,
  ResetExtendProps,
  ActiveAccountInfoProps as _ActiveAccountInfoProps,
  ResetInfoProps as _ResetInfoProps,
  TransferExtendProps,
  TransferInfoProps as _TransferInfoProps,
  WithdrawExtendProps,
  WithdrawInfoProps as _WithdrawInfoProps,
  ExportAccountExtendProps,
  ActiveAccountExtendProps,
} from "./components/Interface";
import {
  SwapData,
  SwapTradeBaseEventProps,
  SwapTradeBaseProps,
} from "./components";
import { AmmPanelBaseProps } from "./Amm";
import {
  TradeBaseType,
  TradeLimitInfoProps,
  TradeMarketInfoProps,
  TradeProBaseEventProps,
  TradeProType,
} from "./tradePro/Interface";
export { TradeProType, TradeBaseType };

export type SwapTradeData<T> = {
  sell: T;
  buy: T;
  slippage: number | string;
  __cache__?: {
    [key: string]: any;
  };
};

export type LimitTradeData<T> = {
  price: T;
  base: T;
  quote: T;
  type: TradeProType;
  // slippage: number | string,
  // __cache__?: {
  //     [ key: string ]: any
  // }
};
export type MarketTradeData<T> = {
  // price: T,
  base: T;
  quote: T;
  type: TradeProType;
  slippage: number | string;
  __cache__?: {
    [key: string]: any;
  };
};

export type { SwapData };

export type ModalProps = {
  open: boolean;
  onClose: {
    bivarianceHack(event: {}, reason: "backdropClick" | "escapeKeyDown"): void;
  }["bivarianceHack"];
  btnDisable?: boolean;
};

export type ResetProps<T> = ResetExtendProps<T>;
export type ActiveAccountProps<T> = ActiveAccountExtendProps<T>;
export type ExportAccountProps = ExportAccountExtendProps;
export type DepositProps<T, I> = BasicACoinTradeHookProps<T, I> &
  DepositExtendProps<T, I>;
export type WithdrawProps<T, I> = BasicACoinTradeHookProps<T, I> &
  WithdrawExtendProps<T, I, CoinKey<I>>;
export type TransferProps<T, I> = BasicACoinTradeHookProps<T, I> &
  TransferExtendProps<T, I, CoinKey<I>>;

export type ResetInfoProps<T, I> = DefaultProps<T, I> & _ResetInfoProps<T>;
export type ActiveAccountInfoProps<T, I> = DefaultProps<T, I> &
  _ActiveAccountInfoProps<T>;

export type DepositInfoProps<T, I> = DefaultProps<T, I> & _DepositInfoProps<I>;
export type WithdrawInfoProps<T, I> = DefaultProps<T, I> &
  _WithdrawInfoProps<CoinKey<I>>;
export type TransferInfoProps<T, I> = DefaultProps<T, I> &
  _TransferInfoProps<CoinKey<I>>;

export type SwapInfoProps<T, I, TCD> = SwapTradeBaseProps<T, I, TCD>;
export type AmmInfoProps<T, TW, I, ACD, C = IBData<I>> = AmmPanelBaseProps<
  T,
  TW,
  I,
  ACD,
  C
>;

/**
 *  @type SwapProps
 *  @param swapTradeData: SwapTradeData<T>
 *  @callback handleSwapPanelEvent {
 *      @param type='buy'|'sell'|'exchange'
 *      @param to='menu'|'button' to the view of list for select item
 *      @param SwapData<T>
 *  }
 *  @callback onSwapClick :(
 *      @param SwapData<T>
 *  )  => void {
 *  @param tradeCalcData TradeCalcData<I>
 *  @param swapBtnStatus='disable'|'loading'
 *  @param tokenSellProps i18n done string
 *  @param tokenBuyProps i18n done string
 *  @callback onChangeEvent?: (
 *      @param index=0|1  0：when view on type button, 1: when view on type menu
 *      @param data: SwapData<T>
 *  ) => SwapData<T>
 */
export type SwapProps<T, I, TCD> = {
  refreshRef: React.Ref<any>;
  onRefreshData?: () => void;
  toPro?: () => void;
  tradeData: SwapTradeData<T> | undefined;
  handleSwapPanelEvent: (
    data: SwapData<SwapTradeData<T>>,
    switchType:
      | "buyTomenu"
      | "sellTomenu"
      | "exchange"
      | "buyTobutton"
      | "sellTobutton"
  ) => Promise<void>;
  onChangeEvent?: (
    index: 0 | 1,
    data: SwapData<SwapTradeData<T>>
  ) => SwapData<SwapTradeData<T>>;
} & SwapInfoProps<T, I, TCD> &
  SwapTradeBaseEventProps<T, I> &
  SwapTradeBaseProps<T, I, TCD>;

//L = LimitTradeData<T> ,
//T = IBData<I>,
//I = CoinKey<any>, TCD
export type TradeLimitProps<
  L extends LimitTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>
> = {
  tradeData: L | undefined;
  handleSubmitEvent: (data: L) => Promise<void>;
  onChangeEvent: (data: L, formType: TradeBaseType) => L;
} & TradeLimitInfoProps<T, TCD, I> &
  TradeProBaseEventProps<L, T, I>;

export type TradeMarketProps<
  M extends MarketTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>
> = {
  tradeData: M | undefined;
  handleSubmitEvent: (data: M) => Promise<void>;
  onChangeEvent: (data: M, formType: TradeBaseType) => M;
} & TradeMarketInfoProps<T, TCD, I> &
  TradeProBaseEventProps<M, T, I>;

export type SwitchData<T> = {
  to: "menu" | "button";
  tradeData: T;
};

export enum TradeBtnStatus {
  AVAILABLE = "AVAILABLE",
  DISABLED = "DISABLED",
  LOADING = "LOADING",
}

export enum SwitchType {
  TO_MENU = "Tomenu",
  TO_BTN = "Tobutton",
}

export enum SwapType {
  BUY_CLICK = "buyTomenu",
  SEll_CLICK = "sellTomenu",
  EXCHANGE_CLICK = "exchange",
  BUY_SELECTED = "buyTobutton",
  SELL_SELECTED = "sellTobutton",
}

export type ModalPanelProps = {
  open: boolean;
  onClose: {
    bivarianceHack(event: {}, reason: "backdropClick" | "escapeKeyDown"): void;
  }["bivarianceHack"];
  content: React.ElementType<any> | JSX.Element;
  _height?: number | string;
  _width?: number | string;
};
