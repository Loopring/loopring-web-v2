import { CoinKey, IBData } from '@loopring-web/common-resources';
import {
    BasicACoinTradeHookProps,
    DefaultProps,
    DepositExtendProps,
    DepositInfoProps as _DepositInfoProps,
    ResetExtendProps,
    ResetInfoProps as _ResetInfoProps,
    TransferExtendProps,
    TransferInfoProps as _TransferInfoProps,
    WithdrawExtendProps,
    WithdrawInfoProps as _WithdrawInfoProps,
} from './components/Interface';
import { SwapData, SwapTradeBaseEventProps, SwapTradeBaseProps, } from './components/panel/SwapWrap/Interface';
import { AmmPanelBaseProps } from './Amm';

export type SwapTradeData<T> = {
    sell: T,
    buy: T,
    slippage: number | string,
    __cache__?: {
        [ key: string ]: any
    }
}

export type { SwapData }

export type ModalProps = {
    open: boolean,
    onClose: { bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void; }['bivarianceHack'];
    btnDisable?: boolean
}

export type ResetProps<T, I> = BasicACoinTradeHookProps<T, I> & Required<ResetExtendProps<T>>
export type DepositProps<T, I> = BasicACoinTradeHookProps<T, I> & DepositExtendProps<T>;
export type WithdrawProps<T, I> = BasicACoinTradeHookProps<T, I> & WithdrawExtendProps<T, I, CoinKey<I>>;
export type TransferProps<T, I> = BasicACoinTradeHookProps<T, I> & TransferExtendProps<T, I, CoinKey<I>>;


export  type  ResetInfoProps<T, I> = DefaultProps<T, I> & _ResetInfoProps;
export  type  DepositInfoProps<T, I> = DefaultProps<T, I> & _DepositInfoProps;
export  type  WithdrawInfoProps<T, I> = DefaultProps<T, I> & _WithdrawInfoProps<CoinKey<I>>;
export  type  TransferInfoProps<T, I> = DefaultProps<T, I> & _TransferInfoProps<CoinKey<I>>;

export  type  SwapInfoProps<T, I, TCD> = SwapTradeBaseProps<T, I, TCD>;
export  type  AmmInfoProps<T, I, ACD, C = IBData<I>> = AmmPanelBaseProps<T, I, ACD, C>;


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
    tradeData: SwapTradeData<T> | undefined,
    handleSwapPanelEvent: (data: SwapData<SwapTradeData<T>>, switchType: 'buyTomenu' | 'sellTomenu' | 'exchange' | 'buyTobutton' | 'sellTobutton') => Promise<void>,
    onChangeEvent?: (index: 0 | 1, data: SwapData<SwapTradeData<T>>) => SwapData<SwapTradeData<T>>,
} & SwapInfoProps<T, I, TCD> & SwapTradeBaseEventProps<T, I> & SwapTradeBaseProps<T, I, TCD>


export type SwitchData<T> = {
    to: 'menu' | 'button'
    tradeData: T,
}

export enum TradeBtnStatus {
    AVAILABLE = 'AVAILABLE',
    DISABLED = 'DISABLED',
    LOADING = 'LOADING',
}

export enum SwitchType {
    TO_MENU = 'Tomenu',
    TO_BTN = 'Tobutton',
}

export enum SwapType {
    BUY_CLICK = 'buyTomenu',
    SEll_CLICK = 'sellTomenu',
    EXCHANGE_CLICK = 'exchange',
    BUY_SELECTED = 'buyTobutton',
    SELL_SELECTED = 'sellTobutton',
}

export type  ModalPanelProps = {
    open: boolean,
    onClose: { bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void; }['bivarianceHack'];
    content: React.ElementType<any> | JSX.Element,
    height?: number | string,
    width?: number | string,
}
