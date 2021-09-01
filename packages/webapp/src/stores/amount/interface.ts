import { StateBase } from '@loopring-web/common-resources';
import * as loopring_defs from 'loopring-sdk/dist/defs/loopring_defs';

export type Amount = loopring_defs.LoopringMap<loopring_defs.TokenAmount>;
export type TimerMap = { [ key: string ]: NodeJS.Timeout | -1 };
/**
 * @amountMap is only update weh
 */
export type AmountStates = {
    amountMap?: Amount | undefined,
    __timerMap__?: TimerMap
} & StateBase


