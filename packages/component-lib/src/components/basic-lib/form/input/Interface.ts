import { CoinInfo, CoinKey, CoinMap } from "@loopring-web/common-resources";
import React from "react";
import {
  // Box, BoxProps, Button, ButtonProps,
  InputProps,
} from "@mui/material";
// import styled from '@emotion/styled';
// import CurrencyInput from 'react-currency-input-field';

export type InputButtonProps<T, R, I> = {
  inputData?: T | undefined;
  label: string;
  subLabel?: string;
  emptyText: string;
  coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>;
  placeholderText?: string;
  decimalsLimit?: number;
  allowDecimals?: boolean;
  isAllowBalanceClick?: boolean;
  maxAllow?: boolean;
  disabled?: boolean;
  logoColor?: string;
  wait?: number;
  size?: InputSize;
  isHideError?: boolean;
  handleCountChange?: (
    ibData: T,
    name: string,
    ref: React.ForwardedRef<any>
  ) => void;
  handleOnClick: (
    event: React.MouseEvent,
    name: string,
    ref: React.ForwardedRef<any>
  ) => void;
  handleError?: (
    ibData: T & { maxAllow?: boolean },
    ref: React.ForwardedRef<any>
  ) => { error: boolean; message?: string | JSX.Element };
  focusOnInput?: boolean;
  name?: string;
};
export enum InputSize {
  middle = "middle",
  small = "small",
}
export type InputCoinProps<T, R, I> = {
  inputData?: T | undefined;
  label: string | JSX.Element;
  subLabel?: string;
  coinMap: CoinMap<R, I extends CoinInfo<R> ? CoinInfo<R> : CoinInfo<R>>;
  placeholderText?: string;
  allowDecimals?: boolean;
  maxAllow?: boolean;
  // isBalanceLimit?: boolean;
  decimalsLimit?: number;
  disabled?: boolean;
  logoColor?: string;
  noBalance?: string;
  wait?: number;
  isHideError?: boolean;
  handleCountChange?: (
    ibData: T,
    name: string,
    ref: React.ForwardedRef<any>
  ) => void;
  handleError?: (
    ibData: T,
    ref: React.ForwardedRef<any>
  ) => { error: boolean; message?: string | JSX.Element };
  focusOnInput?: boolean;
  size?: InputSize;
  isShowCoinIcon?: boolean;
  order?: "left" | "right";
  name?: string;
  isShowCoinInfo?: boolean;
  coinLabelStyle?: React.CSSProperties;
  coinPrecision?: number;
};
export type InputSelectProps<T, I = CoinKey<T>> = {
  // coinMap: CoinMap<R,I extends CoinInfo?CoinInfo:CoinInfo>,
  // walletMap: WalletMap<R,I extends CoinInfo?WalletCoin:WalletCoin> | {},
  placeholder: string;
  panelRender: (props: any) => JSX.Element;
  height?: number; //outSide height, default is defined in global.ts file
  inputProps?: InputProps;
  wait?: number;
  disabled?: boolean;
  backElement?: JSX.Element;
  focusOnInput?: boolean;
  allowScroll?: boolean;
  selected?: string | undefined;
  // handleClose?: (event: React.MouseEvent) => void,
  handleContentChange?: (value: string | undefined | I) => void;
  // onRefresh?: (event: React.MouseEvent) => void,
  useInputRef?: <T extends HTMLInputElement, I>(
    props: useFocusRefProps<I>,
    deps: any[]
  ) => React.RefObject<T>;
};
export type useFocusRefProps<I> = {
  selected?: I | null | undefined;
  isFocus?: boolean;
  callback?: (props?: any) => void;
};

// export type {IBData, CoinMap, CoinInfo, coinType}
