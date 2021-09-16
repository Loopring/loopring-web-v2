import { SwapData, SwapTradeData, TradeBtnStatus } from '../Interface';
import { InputButtonProps } from '../../basic-lib';
import { CoinInfo } from '@loopring-web/common-resources';

export enum TradeProType {
    'sell' ,
    'buy'
}

export type TradeLimitInfoProps<T,TCD,I> = {
    tradeLimitI18nKey?: string,
    tradeCalcData: TCD,
    tradeLimitBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    tokenPriceProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}

export type TradeMarketInfoProps<T,TCD,I> = {
    tradeMarketI18nKey?: string,
    tradeCalcData: TCD,
    tradeMarketBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}

export type TradeProBaseEventProps<X,T, I> = {
    disabled?: boolean,
    handleChangeIndex?: (index: TradeProType) => X,
    // onSwapClick: (tradeData: SwapTradeData<T>) => void | any,
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>


export type TradeCommonProps<X,T,TCD,I> = {
    tradeData: X ,
    i18nKey?: string,
    tradeCalcData: TCD,
    onChangeEvent: (data: X,type:TradeProType) =>  X,
    tradeBtnBaseStatus?: keyof typeof TradeBtnStatus | undefined,
    // tokenPriceProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>,
    tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
}
