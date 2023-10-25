import { BtnInfo, InputButtonProps } from '../../../basic-lib'
import {
  AccountStatus,
  CoinInfo,
  DeFiChgType,
  MarketType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { RawDataDefiSideStakingItem } from '../../../tableList'

export type DeFiChgData<T> = {
  type: DeFiChgType
  tradeData?: undefined | T
}
export type DeFiWrapProps<T, I, ACD> = {
  isStoB?: boolean
  isJoin: boolean
  disabled?: boolean
  btnInfo?: BtnInfo
  refreshRef: React.Ref<any>
  onRefreshData?: (shouldFeeUpdate?: boolean, clearTrade?: boolean) => void
  isLoading: boolean
  market: MarketType
  maxBuyVol?: string
  maxSellVol?: string
  confirmShowLimitBalance: boolean
  // btnStatus: keyof typeof TradeBtnStatus | undefined;
  onSubmitClick: () => void
  onConfirm: () => void
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: DeFiChgData<T>) => void
  handleError?: (data: T) => void
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  deFiCalcData: ACD
  tokenSell: sdk.TokenInfo
  tokenBuy: sdk.TokenInfo
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  accStatus?: AccountStatus
  type: string
  title: string
  isLeverageETH?: boolean
  extraWithdrawFee?: string
  apr?: string
  setShowRETHStakignPopup?: (props: { isShow: boolean; [key: string]: any }) => void
  setShowWSTETHStakignPopup?: (props: { isShow: boolean; [key: string]: any }) => void
  setShowLeverageETHPopup?: (props: { isShow: boolean; [key: string]: any }) => void
}

export type DeFiSideType<R = RawDataDefiSideStakingItem> = {
  tokenSell: sdk.TokenInfo
  order: R
  onRedeem: (item: R) => void
}
export type DeFiSideWrapProps<T, I, ACD> = {
  isJoin: true
  disabled?: boolean
  btnInfo?: BtnInfo
  isLoading: boolean
  minSellAmount: string
  maxSellAmount: string
  onSubmitClick: () => void
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: { tradeData?: undefined | T }) => void
  handleError?: (data: T) => void
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  deFiSideCalcData: ACD
  tokenSell: sdk.TokenInfo
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  accStatus?: AccountStatus
  setShowLRCStakingPopup: { isShow: boolean; [key: string]: any }
}

export type DeFiStakeRedeemWrapProps<T, _I, ACD> = {
  isJoin: false
  isFullTime: boolean
  disabled?: boolean
  btnInfo?: BtnInfo
  isLoading: boolean
  minSellAmount: string
  maxSellAmount: string
  onSubmitClick: () => void
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: { tradeData?: undefined | T }) => void
  handleError?: (data: T) => void
  deFiSideRedeemCalcData: ACD
  tokenSell: sdk.TokenInfo
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  accStatus?: AccountStatus
}
