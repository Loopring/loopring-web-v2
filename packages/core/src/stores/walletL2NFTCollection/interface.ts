import { StateBase, CollectionMeta } from '@loopring-web/common-resources'

export type WalletL2NFTCollectionStates<C extends CollectionMeta> = {
  walletL2NFTCollection: C[]
  total: number
  page: number
} & StateBase
