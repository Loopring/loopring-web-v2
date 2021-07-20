import { CoinKey, CoinMap } from '@loopring-web/common-resources';
import { StateBase } from '../interface';
import { MarketInfo, TokenInfo, TokenRelatedInfo } from 'loopring-sdk/dist/defs/loopring_defs';
import { LoopringMap } from 'loopring-sdk';

export type TokenMap<R extends {[key:string]:any}> = LoopringMap<TokenInfo & {tradePairs:Array<CoinKey<R>>}>
export  type GetTokenMapParams<R extends {[key:string]:any}> = { tokensMap: TokenMap<R>, marketMap: LoopringMap<MarketInfo>, pairs: LoopringMap<TokenRelatedInfo>,marketArr:string[],tokenArr:string[] }

export type AddressMap = {
   [key:string]:string
}
export type IdMap = {
    [key:number]:string
}

// export type TokenPairMap<R extends {[key:string]:any}> ={ [key in keyof R]: Array<keyof R>}
export type TokenMapStates<R extends {[key:string]:any} > = {
    coinMap?:CoinMap<R> | undefined,
    totalCoinMap?:CoinMap<R> | undefined,
    marketArray?:string[],
    marketCoins?:string[]
     // tokenPairsMap?:TokenPairMap<R>,
    tokenMap?:TokenMap<R> ,
    marketMap?: LoopringMap<MarketInfo>,
    addressIndex?: AddressMap ,
    idIndex?: IdMap,
}  & StateBase


