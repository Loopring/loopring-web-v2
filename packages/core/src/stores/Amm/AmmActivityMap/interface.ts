import {
  AmmPoolActivityRule,
  AmmPoolInProgressActivityRule,
  LoopringMap,
} from '@loopring-web/loopring-sdk'
import { StateBase } from '@loopring-web/common-resources'

export type ActivityMap = LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
export type ActivityRulesMap = LoopringMap<AmmPoolInProgressActivityRule>
export type AmmActivityMapStates = {
  activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>
  activityDateMap: {
    [key: number]: {
      AMM_MINING?: LoopringMap<AmmPoolActivityRule> | undefined
      ORDERBOOK_MINING?: LoopringMap<AmmPoolActivityRule> | undefined
      SWAP_VOLUME_RANKING?: LoopringMap<AmmPoolActivityRule> | undefined
    }
  }
  ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
  groupByRuleType: LoopringMap<AmmPoolActivityRule[]>
  groupByActivityStatus: LoopringMap<AmmPoolActivityRule[]>
  groupByRuleTypeAndStatus: LoopringMap<LoopringMap<AmmPoolActivityRule[]>>
} & StateBase
