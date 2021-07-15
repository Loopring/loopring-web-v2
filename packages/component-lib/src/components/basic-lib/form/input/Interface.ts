import { CoinInfo, CoinKey, CoinMap } from 'static-resource';
import React from 'react';
import { InputProps } from "@material-ui/core";


export type InputButtonProps<T, R, I> = {
    inputData?: T | undefined,
    label: string,
    subLabel?: string,
    emptyText: string,
    coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>,
    placeholderText?: string,
    isAllowBalanceClick?: boolean,
    maxAllow?: boolean,
    disabled?: boolean,
    logoColor?: string,
    wait?: number,
    handleCountChange?: (ibData: T, ref: React.ForwardedRef<any>) => void,
    handleOnClick: (event: React.MouseEvent, ref: React.ForwardedRef<any>) => void,
    handleError?: (ibData: T & { maxAllow?: boolean }, ref: React.ForwardedRef<any>) => { error: boolean, message?: string | React.ElementType<HTMLElement> },
    focusOnInput?: boolean,
    name?: string
}
export type InputCoinProps<T, R, I> = {
    inputData?: T | undefined,
    label: string,
    subLabel?: string,
    coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>,
    placeholderText?: string,
    maxAllow?: boolean,
    disabled?: boolean,
    logoColor?: string,
    wait?: number,
    handleCountChange?: (ibData: T, ref: React.ForwardedRef<any>) => void,
    handleError?: (ibData: T, ref: React.ForwardedRef<any>) => { error: boolean, message?: string | React.ElementType<HTMLElement> },
    focusOnInput?: boolean,
    order?: 'left' | 'right',
}
export type InputSelectProps<T, I = CoinKey<T>> = {
    // coinMap: CoinMap<R,I extends CoinInfo?CoinInfo:CoinInfo>,
    // walletMap: WalletMap<R,I extends CoinInfo?WalletCoin:WalletCoin> | {},
    placeholder: string,
    panelRender: (props: any) => React.ElementType<any> | JSX.Element,
    height?: number, //outSide height, default is defined in global.ts file
    inputProps?: InputProps,
    wait?: number,
    disabled?: boolean,
    // toolbarItem?: (value)=>  React.ElementType<any> | JSX.Element,
    focusOnInput?: boolean,
    allowScroll?: boolean,
    selected?: string | undefined,
    // handleClose?: (event: React.MouseEvent) => void,
    handleContentChange?: (value: string | undefined | I) => void,
    // onRefresh?: (event: React.MouseEvent) => void,
    useInputRef?: <T extends HTMLInputElement, I>(props: useFocusRefProps<I>, deps: any[]) => React.RefObject<T>
}
export type useFocusRefProps<I> = {
    selected?: I | null | undefined,
    isFocus?: boolean,
    callback?: (props?: any) => void,

}

// export type {IBData, CoinMap, CoinInfo, coinType}