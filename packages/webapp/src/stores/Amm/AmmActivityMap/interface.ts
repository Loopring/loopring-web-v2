// import { AmmActivity } from '@loopring-web/common-resources';
import { StateBase } from '../../interface';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

export type ActivityMap = LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
export type AmmActivityMapStates = {
    ammActivityMap:ActivityMap}  & StateBase