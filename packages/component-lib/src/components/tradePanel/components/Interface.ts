import { InputButtonProps, InputCoinProps } from '../../basic-lib/form';
import {
    CoinInfo,
    CoinKey,
    CoinMap,
    FeeInfo,
    RequireOne,
    WalletCoin,
    WalletMap,
    WithdrawType,
    WithdrawTypes,
} from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../Interface';
import React from 'react';
import { BtnInfoProps, SwitchPanelProps } from '../../basic-lib';

/**
 * private props
 */
export type TradeMenuListProps<T, I> = {
    nonZero: boolean,
    sorted: boolean,
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
    chargeFeeTokenList: Array<FeeInfo>,
    chargeFeeToken?: C | string,
}

export enum AddressError {
    NoError,
    EmptyAddr,
    InvalidAddr,
    ENSResolveFailed,
}

export type TransferExtendProps<T, I, C> = {
    isThumb?:boolean;
    addressDefault?: string;
    realAddr?: string,
    isLoopringAddress?: boolean;
    isAddressCheckLoading?: boolean;
    isSameAddress?: boolean;
    addrStatus?: AddressError;
    onTransferClick: (data: T) => void,
    handleFeeChange: (value: FeeInfo) => void,
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
export type ResetInfoProps<C> = {
    assetsData?: any[]
    resetBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    chargeFeeTokenList: Array<FeeInfo>,
    chargeFeeToken?: C | string,
    handleFeeChange: (value: FeeInfo) => void,
}
export type ResetExtendProps<T> = {
    onResetClick: () => void,
} & ResetInfoProps<T>;

export type ExportAccountExtendProps = {
    exportAccountProps: any;
    setExportAccountToastOpen: (value: boolean) => void;
}

export type ResetViewProps<T> = ResetExtendProps<T>

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
    isThumb?:boolean;
    onDepositClick: (data: T) => void,
    allowTrade?: any;
} & DepositInfoProps<I>

export type DepositViewProps<T, I> = BasicACoinTradeViewProps<T, I> & DepositExtendProps<T, I>


export type WithdrawInfoProps<C> = {
    withdrawI18nKey?: string,
    withdrawBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    withdrawType?: keyof typeof WithdrawType,
    withdrawTypes: typeof WithdrawTypes,
    chargeFeeTokenList: Array<FeeInfo>,
    chargeFeeToken?: C | string,
}

export type WithdrawExtendProps<T, I, C> = {
    isThumb?:boolean;
    addressDefault?: string;
    realAddr?: string,
    onWithdrawClick: (data: T) => void,
    handleFeeChange: (value: FeeInfo) => void,
    handleWithdrawTypeChange: (value: keyof typeof WithdrawType) => void,
    handleOnAddressChange: (value: string | undefined | I) => void,
    handleAddressError?: (address: string) => { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined,
    wait?: number
} & WithdrawInfoProps<C>

export type WithdrawViewProps<T, I, C = CoinKey<I> | string> =
    BasicACoinTradeViewProps<T, I>
    & WithdrawExtendProps<T, I, C>


export type inputNFTProps<T, I, C = CoinInfo<I>>  = RequireOne<InputCoinProps<T, I, C>, 'label'>
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
    type?:'TOKEN'|'NFT'
}

type DefaultWithMethodProps<T, I> = DefaultProps<T, I> & {
    // onCoinValueChange: (data: T) => void,
}

export type  BasicACoinTradeViewProps<T, I> = Required<DefaultWithMethodProps<T, I>> & {
    onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void,
    // coinInputError:{ error: boolean, message?: string | React.ElementType },
} & Pick<InputButtonProps<T, I, CoinInfo<I>>, 'handleError'>

export type BasicACoinTradeProps<T, I> = BasicACoinTradeViewProps<T, I> & {
    type?:'TOKEN'|'NFT',
    inputBtnRef: React.Ref<any>,
    inputButtonProps?: inputButtonDefaultProps<I, CoinInfo<I>>,
    inputButtonDefaultProps: inputButtonDefaultProps<I, CoinInfo<I>>
}
export type BasicANFTTradeProps<T, I> = Omit<BasicACoinTradeViewProps<T, I>,'coinMap'> & {
    type?:'TOKEN'|'NFT',
    isThumb?:boolean,
    inputNFTRef: React.Ref<any>,
    inputNFTProps?: inputNFTProps<I, CoinInfo<I>>,
    inputNFTDefaultProps: inputNFTProps<I, CoinInfo<I>>
}

export type BasicACoinTradeHookProps<T, I> = DefaultWithMethodProps<T, I> & {
    type?:'TOKEN'|'NFT',
    handlePanelEvent?: (props: SwitchData<T>, switchType: 'Tomenu' | 'Tobutton') => Promise<void>
    onChangeEvent?: (index: 0 | 1, data: SwitchData<T>) => SwitchData<T>,
    inputButtonProps?: inputButtonDefaultProps<T, I>
} & Partial<SwitchPanelProps<any>>
