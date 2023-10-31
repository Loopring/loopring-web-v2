import { InputButtonProps } from '../../../basic-lib'
import { CoinInfo, ForexMap, IBData, TradeBtnStatus } from '@loopring-web/common-resources'
import { BasicACoinTradeViewProps, SwitchData } from '../Interface'
import * as sdk from '@loopring-web/loopring-sdk'
import { TokenInfo } from '@loopring-web/loopring-sdk'

export type VaultJoinBaseProps<T, I, V> = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: (data: T) => void | any
  btnI18nKey?: string
  propsExtends?: Partial<InputButtonProps<T, I, unknown>>
  vaultJoinData: V
  tradeData: T
  isActiveAccount: boolean
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type VaultJoinExtendProps<T, I, C = IBData<I>> = {
  switchStobEvent?: (_isStoB: boolean) => void
  disabled?: boolean
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void
  tokenProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>
  onBack: () => {}
}
export type VaultJoinWrapProps<T, I, V> = VaultJoinBaseProps<T, I, V> & VaultJoinExtendProps<T, I>

export type VaultExitBaseProps = {
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  onSubmitClick: () => void | any
  vaultExitBtnI18nKey?: string
  onClose: () => void
  confirmLabel?: string
  cancelLabel?: string
  disabled?: boolean
}

// export type VaultExitWrapProps = VaultExitBaseProps
export type VaultBorrowBaseProps<T, I, B> = {
  disabled?: boolean
  vaultBorrowBtnStatus?: keyof typeof TradeBtnStatus | undefined
  vaultBorrowBtnI18nKey?: string
  onVaultBorrowClick: () => void | any
  tokenProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void
  vaultBorrowData: B
  propsExtends?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  tradeData: T
}
export type VaultBorrowWrapProps<T, I, B> = BasicACoinTradeViewProps<T, I> &
  VaultBorrowBaseProps<T, I, B>

export type VaultRepayWrapProps<T, I, VR> = BasicACoinTradeViewProps<T, I> & {
  disabled?: boolean
  vaultRepayBtnStatus?: keyof typeof TradeBtnStatus | undefined
  onVaultRepayClick: () => void | any
  vaultRepayBtnI18nKey?: string
  tokenProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  propsExtends?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  vaultRepayData: VR
  tradeData: T
  forexMap: ForexMap<sdk.Currency>
  tokenInfo?: sdk.VaultToken
}
