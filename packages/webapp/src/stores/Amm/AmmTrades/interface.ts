import { AmmTrade } from '@loopring-web/component-lib/src/static-resource';
import { StateBase } from '../../interface';

export type AmmTrades = AmmTrade<any>[]
export type AmmTradesStates = {
    ammTrades?:AmmTrades
} & StateBase