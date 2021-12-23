import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { StateBase } from "@loopring-web/common-resources";

export type ActivityMap = LoopringMap<LoopringMap<AmmPoolActivityRule[]>>;
export type ActivityRulesMap = LoopringMap<AmmPoolActivityRule>;
export type AmmActivityMapStates = {
  ammActivityMap: ActivityMap;
  activityRules: ActivityRulesMap;
} & StateBase;
