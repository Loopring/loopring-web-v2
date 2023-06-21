import { InputButtonProps } from '../../../basic-lib'
import { CoinInfo, TradeBtnStatus } from '@loopring-web/common-resources'

export type AmmChgData<AT> = {
  type: 'coinA' | 'coinB'
  tradeData: AT
}
export type AmmWithdrawChgData<AT> = {
  type: 'lp'
  tradeData: AT
}

export type AmmDepositBaseProps<T, I> = {
  ammDepositBtnStatus?: keyof typeof TradeBtnStatus | undefined
  onAmmAddClick: (AmmSendData: T) => void | any
  ammDepositBtnI18nKey?: string
  propsAExtends?: Partial<InputButtonProps<T, I, unknown>>
  propsBExtends?: Partial<InputButtonProps<T, I, unknown>>
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type AmmDepositExtendProps<T, I, C, ACD> = {
  isStob?: boolean
  switchStobEvent?: (_isStoB: boolean) => void
  disabled?: boolean
  onAddChangeEvent: (data: AmmChgData<T>) => void
  tokenAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  tokenBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  ammCalcData: ACD
}
export type AmmDepositWrapProps<T, I, ACD, C> = AmmDepositBaseProps<T, I> &
  AmmDepositExtendProps<T, I, C, ACD> & {
    ammData: T
    coinAPrecision?: number
    coinBPrecision?: number
  }

export type AmmWithdrawBaseProps<T, I> = {
  ammWithdrawBtnStatus?: keyof typeof TradeBtnStatus | undefined
  onAmmRemoveClick: (AmmSendData: T) => void | any
  ammWithdrawBtnI18nKey?: string
  anchors?: number[]
  propsLPExtends?: Partial<InputButtonProps<T, I, unknown>>
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>
export type AmmWithdrawExtendProps<T, I, C, ACD> = {
  disabled?: boolean
  isStob?: boolean
  switchStobEvent?: (_isStoB: boolean) => void
  onRemoveChangeEvent: (data: AmmWithdrawChgData<T>) => void
  tokenLPProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  ammCalcData: ACD
}
export type AmmWithdrawWrapProps<T, I, ACD, C> = AmmWithdrawBaseProps<T, I> &
  AmmWithdrawExtendProps<T, I, C, ACD> & {
    ammData: T
    selectedPercentage: number // anchor
  }
