import { BtnInfo, InputButtonProps } from '../../../basic-lib'
import {
  AccountStatus,
  CoinInfo,
  DualCurrentPrice,
  DualViewBase,
  DualViewInfo,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { TokenInfo } from '@loopring-web/loopring-sdk'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'

export enum DualDisplayMode {
  nonBeginnerMode = 1,
  beginnerModeStep1,
  beginnerModeStep2,
}
export type DualDetailType = {
  dualViewInfo: DualViewBase & (Partial<sdk.UserDualTxsHistory> | Partial<sdk.DualProductAndPrice>)
  currentPrice: DualCurrentPrice
  lessEarnView: string
  greaterEarnView: string
  lessEarnTokenSymbol: string
  greaterEarnTokenSymbol: string
  isOrder?: boolean
  dualProducts: DualViewInfo[]
  getProduct?: () => void
}
export type DualChgData<T> = {
  tradeData?: undefined | T
}
export type DualWrapProps<T, I, DUAL> = {
  disabled?: boolean
  btnInfo?: BtnInfo
  refreshRef: React.Ref<any>
  onRefreshData?: (shouldFeeUpdate?: boolean, clearTrade?: boolean) => void
  isLoading: boolean
  tokenMap: { [key: string]: TokenInfo }
  // maxSellVol?: string;
  onSubmitClick: () => void
  onChangeEvent: (data: DualChgData<T>) => void
  handleError?: (data: T) => void
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  dualCalcData: DUAL
  tokenSell: TokenInfo
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  accStatus?: AccountStatus
  // dualProducts?: DualViewInfo[]
  // isRenew: boolean
  // renewTargetPrice?: string
  // renewDuration?: string
}

export type DualDetailProps<
  R = { isRenew: boolean; renewTargetPrice?: string; renewDuration?: string },
> = DualDetailType & {
  coinSell: R
  onChange: (props: R) => void
  isPriceEditable: boolean
  dualProducts: DualViewInfo[]
  getProduct?: () => void
  displayMode?: DualDisplayMode
  tokenMap: any
}
