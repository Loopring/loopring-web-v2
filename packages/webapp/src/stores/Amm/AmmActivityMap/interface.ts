// import { AmmActivity } from '@loopring-web/component-lib/src/static-resource';
import { StateBase } from '../../interface';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

export type ActivityMap = LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
export type AmmActivityMapStates = {
    ammActivityMap:ActivityMap}  & StateBase