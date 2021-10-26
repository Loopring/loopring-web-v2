import { StateBase } from '@loopring-web/common-resources';
import * as loopring_defs from '@loopring-web/loopring-sdk';
export type TokenPrices<R extends { [ key: string ]: any }> = {
    [key in keyof R]:number
}

export type TokenPricesStates<R extends { [ key: string ]: any }> = {
    tokenPrices: TokenPrices<R> | undefined
    __timer__?: number,
    __rawConfig__: any ;
} & StateBase