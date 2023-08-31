import { InputButtonProps } from '../../../basic-lib'
import { CoinInfo, IBData, TradeBtnStatus } from '@loopring-web/common-resources'
import { SwitchData } from '../Interface'

export type VaultJoinBaseProps<T, I, V> = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: (data: T) => void | any
  btnI18nKey?: string
  propsExtends?: Partial<InputButtonProps<T, I, unknown>>
  vaultJoinData: V
  tradeData: T
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type VaultJoinExtendProps<T, I, C = IBData<I>> = {
  switchStobEvent?: (_isStoB: boolean) => void
  disabled?: boolean
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void
  tokenProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  onBack: () => {}
}
export type VaultJoinWrapProps<T, I, V> = VaultJoinBaseProps<T, I, V> & VaultJoinExtendProps<T, I>

export type VaultExitBaseProps<T, I, V> = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: (data: T) => void | any
  vaultExitBtnI18nKey?: string
  anchors?: number[]
  vaultExitData: V
  propsLPExtends?: Partial<InputButtonProps<T, I, unknown>>
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>
export type VaultExitExtendProps<T, I, C, V> = {
  disabled?: boolean
  isStob?: boolean
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: T) => void
  tokenLPProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  vaultAccountData: V
}
export type VaultExitWrapProps<T, I, V, C> = VaultExitBaseProps<T, I, V> &
  VaultExitExtendProps<T, I, C, V> & {
    tradeData: T
    selectedPercentage: number // anchor
  }
