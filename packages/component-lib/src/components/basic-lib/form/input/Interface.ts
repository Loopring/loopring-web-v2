import { CoinInfo, CoinKey, CoinMap } from '@loopring-web/common-resources'
import React from 'react'
import { InputProps } from '@mui/material'
import { XOR } from '../../../../types/lib'
// import styled from '@emotion/styled';
// import CurrencyInput from 'react-currency-input-field';
export type defaultProps<R, I> = {
  label: string | JSX.Element
  subLabel?: string
  coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>
  placeholderText?: string
  allowDecimals?: boolean
}
export type InputButtonProps<T, R, I> = defaultProps<R, I> & {
  inputData?: T | undefined
  emptyText: string
  decimalsLimit?: number
  isAllowBalanceClick?: boolean
  maxAllow?: boolean
  disableInputValue?: boolean
  disabled?: boolean
  logoColor?: string
  wait?: number
  maxValue?: string | number | undefined
  minimum?: string | number | undefined
  size?: InputSize
  isHideError?: boolean
  handleCountChange?: (ibData: T, name: string, ref: React.ForwardedRef<any>) => void
  handleOnClick: (event: React.MouseEvent, name: string, ref: React.ForwardedRef<any>) => void
  handleError?: (
    tradeData: T & { maxAllow?: boolean },
    ref: React.ForwardedRef<any>,
  ) => { error: boolean; message?: string | JSX.Element }
  focusOnInput?: boolean
  name?: string
  fullwidth?: boolean
    loading?: boolean
} & XOR<
    { isShowCoinInfo?: true } & XOR<
      { isShowCoinIcon: true },
      { isShowCoinIcon: false; CoinIconElement?: JSX.Element }
    >,
    { isShowCoinInfo: false }
  >

export enum InputSize {
  middle = 'middle',
  small = 'small',
}

export type InputCoinProps<T, R, I> = defaultProps<R, I> & {
  inputData?: T | undefined
  maxAllow?: boolean
  minimum?: number | string
  // isBalanceLimit?: boolean;
  decimalsLimit?: number
  disabled?: boolean
  logoColor?: string
  noBalance?: string
  wait?: number
  isHideError?: boolean
  handleCountChange?: (ibData: T, name: string, ref: React.ForwardedRef<any>) => void
  handleError?: (
    ibData: T & { maxAllow?: boolean },
    ref: React.ForwardedRef<any>,
  ) => { error: boolean; message?: string | JSX.Element }
  focusOnInput?: boolean
  size?: InputSize
  order?: 'left' | 'right'
  name?: string
  coinLabelStyle?: React.CSSProperties
  coinPrecision?: number
  className?: string
  // inputError?: { error: boolean; message?: string };
} & XOR<
    { isShowCoinInfo: true } & XOR<
      { isShowCoinIcon: true },
      { CoinIconElement?: JSX.Element | undefined; isShowCoinIcon: false }
    >,
    { isShowCoinInfo: false }
  >
export type InputSelectProps<T, I = CoinKey<T>> = {
  // coinMap: CoinMap<R,I extends CoinInfo?CoinInfo:CoinInfo>,
  // walletMap: WalletMap<R,I extends CoinInfo?WalletCoin:WalletCoin> | {},
  placeholder: string
  panelRender: (props: any) => JSX.Element
  height?: number //outSide height, default is defined in global.ts file
  inputProps?: InputProps
  wait?: number
  disabled?: boolean
  backElement?: JSX.Element
  focusOnInput?: boolean
  allowScroll?: boolean
  selected?: string | undefined
  // handleClose?: (event: React.MouseEvent) => void,
  handleContentChange?: (value: string | undefined | I) => void
  // onRefresh?: (event: React.MouseEvent) => void,
  useInputRef?: <T extends HTMLInputElement, I>(
    props: useFocusRefProps<I>,
    deps: any[],
  ) => React.RefObject<T>
}
export type useFocusRefProps<I> = {
  selected?: I | null | undefined
  isFocus?: boolean
  callback?: (props?: any) => void
}

// export type {IBData, CoinMap, CoinInfo, coinType}
