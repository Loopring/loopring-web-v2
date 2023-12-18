import { BtnInfo, InputButtonProps } from '../../../basic-lib'
import {
  AccountStatus,
  CoinInfo,
  DualCurrentPrice,
  DualViewBase,
  DualViewInfo,
  DualViewType,
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
  dualProducts?: DualViewInfo[]
  getProduct?: () => void
  order: any | undefined
  __raw__?: any
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
  dualProducts?: DualViewInfo[]
  toggle: { enable: boolean; reason?: string | undefined }
  viewType?: DualViewType
  setShowAutoDefault: (show: boolean) => void
}

export type DualDetailProps<
  R = { isRenew: boolean; renewTargetPrice?: string; renewDuration?: number },
> = DualDetailType & {
  coinSell: R
  btnConfirm?: any
  onChange: (props: R) => void
  isPriceEditable: boolean
  dualProducts: DualViewInfo[]
  getProduct?: () => void
  displayMode?: DualDisplayMode
  toggle: { enable: boolean; reason?: string }
  inputPart?: JSX.Element | undefined
  showClock?: boolean
  setShowAutoDefault: (show: boolean) => void
  onChangeOrderReinvest: (
    info: { on: boolean; renewTargetPrice?: string; renewDuration?: number },
    item: R,
  ) => void
}
