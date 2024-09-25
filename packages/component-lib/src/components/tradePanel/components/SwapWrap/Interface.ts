import { SwapTradeData, SwitchData } from '../../Interface'
import { InputButtonProps } from '../../../basic-lib'
import { CoinInfo, TokenType, TradeBtnStatus } from '@loopring-web/common-resources'

export type SwapData<ST> = {
  type: 'buy' | 'sell' | 'exchange'
} & SwitchData<ST>

export type SwapMenuListProps<T, TCD> = {
  tokenType?: TokenType
  swapData: SwapData<SwapTradeData<T>>
  onChangeEvent: (index: 0 | 1, data: SwapData<SwapTradeData<T>>) => void
  tradeCalcData: TCD
}

/**
 * private props
 */
export type SwapTradeBaseProps<T, I, TCD> = {
  disabled?: boolean
  isStob?: boolean
  swapBtnI18nKey?: string
  swapBtnStatus?: keyof typeof TradeBtnStatus | undefined
  tradeCalcData: TCD
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  tokenBuyProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  classWrapName?: string
  BtnEle?: JSX.Element
  marginLevelChange?: {
    from: {
      marginLevel: string
      type: 'safe' | 'warning' | 'danger' 
    }
    to: {
      marginLevel: string
      type: 'safe' | 'warning' | 'danger'
    }
  }
}
export type SwapTradeBaseEventProps<T, I> = {
  onSwapClick: () => void | any
  onCancelClick?: () => void | any
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type SwapTradeExtendProps<T> = {
  switchStobEvent?: (value: boolean) => void
  onChangeEvent: (index: 0 | 1, data: SwapData<SwapTradeData<T>>) => void
}
export type SwapTradeProps<T, I, TCD> = SwapTradeBaseProps<T, I, TCD> &
  SwapTradeExtendProps<T> &
  SwapTradeBaseEventProps<T, I> & {
    tradeData: SwapTradeData<T>
  }
