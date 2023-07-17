import { StateBase, WalletCoin } from '@loopring-web/common-resources'

export type WalletLayer1Map<R extends { [key: string]: any }> = {
  [key in keyof R]: WalletCoin<R>
}
export type WalletLayer1States = {
  walletLayer1?: WalletLayer1Map<any> | undefined
} & StateBase
