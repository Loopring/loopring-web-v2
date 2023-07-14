import { StateBase } from '@loopring-web/common-resources'

export type TokenPrices<R extends { [key: string]: any }> = {
  [key in keyof R]: number
}

export type TokenPricesStates<R extends { [key: string]: any }> = {
  tokenPrices: TokenPrices<R>
  __timer__?: number
  __rawConfig__: any
} & StateBase
