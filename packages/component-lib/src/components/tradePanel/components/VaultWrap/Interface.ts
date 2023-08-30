import { InputButtonProps } from '../../../basic-lib'
import { CoinInfo, IBData, TradeBtnStatus } from '@loopring-web/common-resources'

export type VaultJoinBaseProps<T, I> = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: (data: T) => void | any
  btnI18nKey?: string
  propsExtends?: Partial<InputButtonProps<T, I, unknown>>
  tradeData: T
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type VaultJoinExtendProps<T, I, V, C = IBData<I>> = {
  switchStobEvent?: (_isStoB: boolean) => void
  disabled?: boolean
  onChangeEvent: (data: T) => void
  tokenProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  vaultAccountData: V
  onBack: () => {}
}
export type VaultJoinWrapProps<T, I, V> = VaultJoinBaseProps<T, I> & VaultJoinExtendProps<T, I, V>

export type VaultExitBaseProps<T, I> = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: (data: T) => void | any
  vaultExitBtnI18nKey?: string
  anchors?: number[]
  propsLPExtends?: Partial<InputButtonProps<T, I, unknown>>
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>
export type VaultExitExtendProps<T, I, C, ACD> = {
  disabled?: boolean
  isStob?: boolean
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: T) => void
  tokenLPProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  vaultAccountData: ACD
}
export type VaultExitWrapProps<T, I, ACD, C> = VaultExitBaseProps<T, I> &
  VaultExitExtendProps<T, I, C, ACD> & {
    tradeData: T
    selectedPercentage: number // anchor
  }
