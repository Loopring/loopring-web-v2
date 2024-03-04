import { CoinInfo, CoinKey, CoinMap, CoinSource, TokenType } from '@loopring-web/common-resources'
import React from 'react'
import { InputProps } from '@mui/material'
import { XOR } from '../../../../types/lib'
export type defaultProps<T, R, I> = {
  label: string | JSX.Element

  coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>
  placeholderText?: string
  allowDecimals?: boolean
  size?: InputSize
  order?: 'left' | 'right'
  tokenType?: TokenType | undefined
  placeholder: string
  handleError?: (
    ibData: T & { maxAllow?: boolean },
    ref: React.ForwardedRef<any>,
  ) => { error: boolean; message?: string | JSX.Element }
  maxValue?: string | number | undefined
  focusOnInput?: boolean
  coinPrecision?: number
  className?: string
  name?: string
  minimum?: number | string
  maxAllow?: boolean
  decimalsLimit?: number
  disabled?: boolean
  logoColor?: string
  wait?: number
  isHideError?: boolean
  tokenImageKey?: string
  belongAlice?: string
  coinIcon?: [CoinSource, CoinSource?]
  noBalance?: string
} & XOR<
  { isShowCoinInfo?: true } & XOR<
    { isShowCoinIcon: true },
    { isShowCoinIcon: false; CoinIconElement?: JSX.Element }
  >,
  { isShowCoinInfo: false }
> &
  XOR<{ subLabel?: string }, { subEle: JSX.Element }>

export type InputButtonProps<T, R, I> = defaultProps<T, R, I> & {
  inputData?: T | undefined
  emptyText: string
  isAllowBalanceClick?: boolean
  disableInputValue?: boolean
  disableBelong?: boolean
  disabled?: boolean
  logoColor?: string
  wait?: number
  maxValue?: string | number | undefined
  minimum?: string | number | undefined
  isHideError?: boolean
  handleCountChange?: (ibData: T, name: string, ref: React.ForwardedRef<any>) => void
  handleOnClick: (event: React.MouseEvent, name: string, ref: React.ForwardedRef<any>) => void
  coinPrecision?: number
  handleError?: (
    tradeData: T & { maxAllow?: boolean },
    ref: React.ForwardedRef<any>,
  ) => { error: boolean; message?: string | JSX.Element }
  focusOnInput?: boolean
  name?: string
  className?: string
  fullwidth?: boolean
  loading?: boolean
  belongAlice?: string
}

export enum InputSize {
  middle = 'middle',
  small = 'small',
}

export type InputCoinProps<T, R, I> = defaultProps<T, R, I> & {
  inputData?: T | undefined
  handleCountChange?: (ibData: T, name: string, ref: React.ForwardedRef<any>) => void
  coinLabelStyle?: React.CSSProperties
}
export type InputSelectProps<T, I = CoinKey<T>> = {
  placeholder?: string
  focusOnInput?: boolean
  // coinMap: CoinMap<R,I extends CoinInfo?CoinInfo:CoinInfo>,
  // walletMap: WalletMap<R,I extends CoinInfo?WalletCoin:WalletCoin> | {},
  panelRender: (props: any) => JSX.Element
  height?: number //outSide height, default is defined in global.ts file
  inputProps?: InputProps
  backElement?: JSX.Element
  allowScroll?: boolean
  selected?: string | undefined
  // handleClose?: (event: React.MouseEvent) => void,
  handleContentChange?: (value: string | undefined | I) => void
  // onRefresh?: (event: React.MouseEvent) => void,
  useInputRef?: <T extends HTMLInputElement, I>(
    props: useFocusRefProps<I>,
    deps: any[],
  ) => React.RefObject<T>
  hasCancel?: boolean
}
export type useFocusRefProps<I> = {
  selected?: I | null | undefined
  isFocus?: boolean
  callback?: (props?: any) => void
}

// export type {IBData, CoinMap, CoinInfo, coinType}
