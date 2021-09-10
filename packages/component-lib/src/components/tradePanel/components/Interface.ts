import { InputButtonProps } from '../../basic-lib/form';
import {
    CoinInfo,
    CoinKey,
    CoinMap,
    RequireOne,
    WalletCoin,
    WalletMap,
    WithdrawType,
    WithdrawTypes
} from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import React from 'react';
import { BtnInfoProps, SwitchPanelProps } from '../../basic-lib';


/**
 * private props
 */
export type TradeMenuListProps<T, I> = {
    //swapData: SwapData<T>,
    walletMap: WalletMap<I, WalletCoin<I>>,
    _height?: string | number,
    coinMap: CoinMap<I, CoinInfo<I>>,
    onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void,
    selected?: string,
    tradeData: T
}

/**
 * private props
 */
export type SwitchData<T> = {
    to: 'menu' | 'button'
    tradeData: T,
}

export type TransferInfoProps<C> = {
    transferI18nKey?: string,
    transferBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    chargeFeeTokenList: Array<{ belong: C | string, fee: number | string | undefined, __raw__?: any }>,
    chargeFeeToken?: C | string,
}

export type TransferExtendProps<T, I, C> = {
    addressDefault?: string;
    realAddr?: string,
    onTransferClick: (data: T) => void,
    handleFeeChange: (value: { belong: C | string, fee: number | string | undefined, __raw__?: any }) => void,
    handleOnAddressChange: (value: string | undefined | I) => void,
    handleAddressError: (address: string) => { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined,
    wait?: number
} & TransferInfoProps<C>

export type TransferViewProps<T, I, C = CoinKey<I> | string> =
    BasicACoinTradeViewProps<T, I>
    & TransferExtendProps<T, I, C>

/**
 * private props
 */
export type ResetInfoProps = {
    resetBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    fee?: { count: number, price: number }
}
export type ResetExtendProps<T> = {
    onResetClick: (data: T) => void,
} & ResetInfoProps;

export type  ResetViewProps<T, I> = BasicACoinTradeViewProps<T, I> & ResetExtendProps<T>

/**
 * private props
 */
export type DepositInfoProps<I> = {
    depositBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    title?: string,
    description?: string
    isNewAccount: boolean
    addressDefault?: string;
    handleOnAddressChange?: (value: string | undefined | I) => void,
    handleAddressError?: (address: string) => { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined,
    wait?: number
} & BtnInfoProps

export type DepositExtendProps<T, I> = {
    onDepositClick: (data: T) => void,
} & DepositInfoProps<I>

export type DepositViewProps<T, I> = BasicACoinTradeViewProps<T, I> & DepositExtendProps<T, I>


export type WithdrawInfoProps<C> = {
    withdrawI18nKey?: string,
    withdrawBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    withdrawType?: keyof typeof WithdrawType,
    withdrawTypes: typeof WithdrawTypes,
    chargeFeeTokenList: Array<{ belong: C | string, fee: number | string, __raw__?: any }>,
    chargeFeeToken?: C | string,
}

export type WithdrawExtendProps<T, I, C> = {
    addressDefault?: string;
    realAddr?: string,
    onWithdrawClick: (data: T) => void,
    handleFeeChange: (value: { belong: C | string, fee: number | string, __raw__?: any }) => void,
    handleWithdrawTypeChange: (value: keyof typeof WithdrawType) => void,
    handleOnAddressChange: (value: string | undefined | I) => void,
    handleAddressError?: (address: string) => { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined,
    wait?: number
} & WithdrawInfoProps<C>


export type WithdrawViewProps<T, I, C = CoinKey<I> | string> =
    BasicACoinTradeViewProps<T, I>
    & WithdrawExtendProps<T, I, C>


export type inputButtonDefaultProps<T, I, C = CoinInfo<I>> = RequireOne<InputButtonProps<T, I, C>, 'label'>
//     {
//     inputData?: IBData<R> | undefined,
//     label: string,
//     subLabel?: string,
//     emptyText?: string,
//     coinMap?: CoinMap<R, I>,
//     placeholderText?: string,
//     maxAllow?: boolean,
//     disabled?: boolean,
//     logoColor?: string,
//     wait?: number,
//     handleCountChange?: (ibData: IBData<R>, ref: React.ForwardedRef<any>) => void,
//     handleOnClick?: (event: React.MouseEvent, ref: React.ForwardedRef<any>) => void,
//     handleError?: (ibData: IBData<R>, ref: React.ForwardedRef<any>) => { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined,
//     focusOnInput?: boolean
// }
export type DefaultProps<T, I> = {
    tradeData: T,
    disabled?: boolean,
    coinMap: CoinMap<I, CoinInfo<I>>,
    walletMap: WalletMap<I, WalletCoin<I>>,
}

type DefaultWithMethodProps<T, I> = DefaultProps<T, I> & {
    // onCoinValueChange: (data: T) => void,
}

export type  BasicACoinTradeViewProps<T, I> = Required<DefaultWithMethodProps<T, I>> & {
    onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void,
    // coinInputError:{ error: boolean, message?: string | React.ElementType },
} & Pick<InputButtonProps<T, I, CoinInfo<I>>, 'handleError'>

export type BasicACoinTradeProps<T, I> = BasicACoinTradeViewProps<T, I> & {
    inputBtnRef: React.Ref<any>,
    inputButtonProps?: inputButtonDefaultProps<I, CoinInfo<I>>,
    inputButtonDefaultProps: inputButtonDefaultProps<I, CoinInfo<I>>
}

export type BasicACoinTradeHookProps<T, I> = DefaultWithMethodProps<T, I> & {
    handlePanelEvent?: (props: SwitchData<T>, switchType: 'Tomenu' | 'Tobutton') => Promise<void>
    onChangeEvent?: (index: 0 | 1, data: SwitchData<T>) => SwitchData<T>,
    inputButtonProps?: inputButtonDefaultProps<T, I>
} & Partial<SwitchPanelProps<any>>
