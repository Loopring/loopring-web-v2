import {
  BtradeType,
  CAMPAIGNTAGCONFIG,
  CoinKey,
  FeeInfo,
  IBData,
  MarketType,
  NFTWholeINFO,
  SCENARIO,
  TradeBaseType,
  TradeCalcProData,
  TradeProType,
  WithdrawType,
  WithdrawTypes,
} from '@loopring-web/common-resources'
import {
  BasicACoinTradeHookProps,
  ClaimExtendProps,
  CreateRedPacketViewProps,
  DefaultProps,
  DepositExtendProps,
  DepositInfoProps as _DepositInfoProps,
  ExportAccountExtendProps,
  ForceWithdrawViewProps,
  NFTDeployViewProps,
  NFTDepositViewProps,
  NFTMetaViewProps,
  NFTMintAdvanceViewProps,
  NFTMintViewProps,
  ResetExtendProps,
  ResetInfoProps as _ResetInfoProps,
  TransferExtendProps,
  TransferInfoProps as _TransferInfoProps,
  WithdrawExtendProps,
} from './components/Interface'
import {
  SwapData,
  SwapTradeBaseEventProps,
  SwapTradeBaseProps,
  VaultBorrowBaseProps,
  VaultRepayWrapProps,
} from './components'
import {
  StopTradeLimitInfoProps,
  TradeLimitInfoProps,
  TradeMarketInfoProps,
  TradeProBaseEventProps,
} from './tradePro/Interface'
import React from 'react'
import { TOASTOPEN } from '../toast'
import { VaultExitBaseProps, VaultJoinBaseProps } from './components/VaultWrap'

export type SwapTradeData<T> = {
  sell: T
  buy: T
  isChecked?: boolean
  slippage: number | string
  __cache__?: {
    [key: string]: any
  }
  btradeType?: BtradeType
}

export type LimitTradeData<T> = {
  price: T
  base: T
  quote: T
  type: TradeProType
  isChecked?: boolean
}

export type StopLimitTradeData<T> = {
  price: T
  stopPrice: T
  base: T
  quote: T
  type: TradeProType
}
export type MarketTradeData<T> = {
  // price: T,
  base: T
  quote: T
  type: TradeProType
  isChecked?: boolean
  slippage: number | string
  __cache__?: {
    [key: string]: any
  }
}

export type { SwapData }

export type ModalProps = {
  open: boolean
  onClose: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
  btnDisable?: boolean
}

export type ResetProps<T> = ResetExtendProps<T>
export type ExportAccountProps = ExportAccountExtendProps
export type DepositProps<T, I> = BasicACoinTradeHookProps<T, I> & DepositExtendProps<T>
export type WithdrawProps<T, I, C = FeeInfo> = BasicACoinTradeHookProps<T, I> &
  WithdrawExtendProps<T, I, C>
export type TransferProps<T, I, C = FeeInfo> = BasicACoinTradeHookProps<T, I> &
  TransferExtendProps<T, I, C>

export type ClaimProps<T, I, C = FeeInfo> = BasicACoinTradeHookProps<T, I> & ClaimExtendProps<T, C>

export type ResetInfoProps<T, I> = DefaultProps<T, I> & _ResetInfoProps<T>

export type DepositInfoProps<T, I> = DefaultProps<T, I> & _DepositInfoProps

export type CreateRedPacketProps<T, I, C = FeeInfo, _NFT = NFTWholeINFO> = Omit<
  BasicACoinTradeHookProps<T, I>,
  'type'
> &
  CreateRedPacketViewProps<T, I, C>

export type TransferInfoProps<T, I> = DefaultProps<T, I> & _TransferInfoProps<CoinKey<I>>

export type SwapInfoProps<T, I, TCD> = SwapTradeBaseProps<T, I, TCD>

export type NFTDepositProps<T, I> = NFTDepositViewProps<T, I>

export type NFTMintProps<ME, MI, I, C = FeeInfo> = Omit<NFTMintViewProps<ME, MI, I, C>, 'metaData'>
export type NFTMetaProps<T, Co, C = FeeInfo> = Omit<NFTMetaViewProps<T, Co, C>, 'nftMeta'>

export type NFTMintAdvanceProps<T, Co, I, C = FeeInfo> = NFTMintAdvanceViewProps<T, Co, I, C>

export type NFTDeployProps<T, I, C = FeeInfo> = NFTDeployViewProps<T, I, C>
export type ForceWithdrawProps<T, I, C = FeeInfo> = BasicACoinTradeHookProps<T, I> &
  ForceWithdrawViewProps<T, I, C>

/**
 *  @type SwapProps
 *  @param swapTradeData: SwapTradeData<T>
 *  @callback handleSwapPanelEvent {
 *      @param type='buy'|'sell'|'exchange'
 *      @param to='menu'|'button' to the view of list for select item
 *      @param SwapData<T>
 *  }
 *  @callback onSwapClick :(
 *      @param SwapData<T>
 *  )  => void {
 *  @param tradeCalcData TradeCalcData<I>
 *  @param swapBtnStatus='disable'|'loading'
 *  @param tokenSellProps i18n done string
 *  @param tokenBuyProps i18n done string
 *  @callback onChangeEvent?: (
 *      @param index=0|1  0：when view on type button, 1: when view on type menu
 *      @param data: SwapData<T>
 *  ) => SwapData<T>
 */
export type SwapProps<T, I, TCD> = {
  refreshRef: React.Ref<any>
  onRefreshData?: () => void
  titleI8nKey?: string
  toPro?: () => void
  tradeData: SwapTradeData<T>
  campaignTagConfig?: CAMPAIGNTAGCONFIG
  handleSwapPanelEvent: (data: SwapData<SwapTradeData<T>>, switchType: SwapType) => Promise<void>
  market?: MarketType
  onChangeEvent?: (index: 0 | 1, data: SwapData<SwapTradeData<T>>) => SwapData<SwapTradeData<T>>
  setToastOpen?: (state: TOASTOPEN) => void
  scenario?: SCENARIO
  _width?: string
  hideSecondConfirmation?: boolean
} & SwapInfoProps<T, I, TCD> &
  SwapTradeBaseEventProps<T, I> &
  SwapTradeBaseProps<T, I, TCD>

export type TradeLimitProps<L, T, TCD extends TradeCalcProData<I>, I> = {
  tradeData: L | undefined
  handleSubmitEvent: (data: L) => Promise<void>
  onChangeEvent: (data: L, formType: TradeBaseType) => L
} & TradeLimitInfoProps<T, TCD, I> &
  TradeProBaseEventProps<L, T, I>

export type TradeStopLimitProps<L, T, TCD extends TradeCalcProData<I>, I> = {
  tradeData: L
  handleSubmitEvent: (data: L) => Promise<void>
  onChangeEvent: (data: L, formType: TradeBaseType) => L
} & StopTradeLimitInfoProps<T, TCD, I> &
  TradeProBaseEventProps<L, T, I>

export type TradeMarketProps<
  M extends MarketTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>,
> = {
  tradeData: M | undefined
  handleSubmitEvent: (data: M) => Promise<void>
  onChangeEvent: (data: M, formType: TradeBaseType) => M
} & TradeMarketInfoProps<T, TCD, I> &
  TradeProBaseEventProps<M, T, I>

export type SwitchData<T> = {
  to: 'menu' | 'button'
  tradeData: T
}

export enum SwitchType {
  TO_MENU = 'Tomenu',
  TO_BTN = 'Tobutton',
}

export enum SwapType {
  BUY_CLICK = 'buyTomenu',
  SEll_CLICK = 'sellTomenu',
  EXCHANGE_CLICK = 'exchange',
  BUY_SELECTED = 'buyTobutton',
  SELL_SELECTED = 'sellTobutton',
}

export type ModalPanelProps = {
  open: boolean
  contentClassName?: string
  onClose: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
  content: JSX.Element
  _height?: number | string
  _width?: number | string
}

export type FeeSelectProps = {
  chargeFeeTokenList: FeeInfo[]
  handleToggleChange: (value: FeeInfo) => void
  feeInfo?: FeeInfo
  disableNoToken?: boolean
  open: boolean
  onClose: () => void
  onClickFee: () => void
  feeLoading: boolean
  isFeeNotEnough: boolean
  isFastWithdrawAmountLimit?: boolean
  withdrawInfos?: {
    types: Partial<WithdrawTypes>
    type: WithdrawType
    onChangeType: (w: WithdrawType) => void
  }
  floatLeft?: boolean
  middleContent?: JSX.Element
  feeNotEnoughContent?: JSX.Element
}

export type VaultJoinProps<T, I, V> = BasicACoinTradeHookProps<T, I> & VaultJoinBaseProps<T, I, V>
export type VaultBorrowProps<T, I, V> = BasicACoinTradeHookProps<T, I> &
  VaultBorrowBaseProps<T, I, V>
export type VaultRepayProps<T, I, V> = BasicACoinTradeHookProps<T, I> & VaultRepayWrapProps<T, I, V>
export type VaultExitProps = VaultExitBaseProps

export * from './components/Interface'
