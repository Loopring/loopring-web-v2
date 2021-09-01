// import { AmmActivity } from '@loopring-web/common-resources';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import { StateBase } from '@loopring-web/common-resources';

export type ActivityMap = LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
export type AmmActivityMapStates = {
    ammActivityMap: ActivityMap
} & StateBase