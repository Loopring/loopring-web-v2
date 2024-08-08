import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type VaultLayer2Map<R extends { [key: string]: any }> = {
  [key in keyof R]: sdk.VaultBalance
}

export type VaultLayer2States = {
  vaultLayer2?: VaultLayer2Map<any> | undefined
  vaultAccountInfo?: sdk.VaultAccountInfo | undefined
  activeInfo?: {
    hash: string
    isInActive: boolean
  }
  tokenFactors: {
    symbol: string
    factor: string
  }[]
  maxLeverage: string | undefined
  __timer__?: NodeJS.Timeout | -1
} & StateBase
