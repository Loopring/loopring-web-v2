import { StateBase } from "@loopring-web/common-resources";
import * as loopring_defs from "@loopring-web/loopring-sdk";

//key is market or AMM-${market}
export type Amount = {
  [key: string]: loopring_defs.LoopringMap<loopring_defs.TokenAmount>;
};
export type TimerMap = { [key: string]: NodeJS.Timeout | -1 };
/**
 * @amountMap is only update weh
 */
export type AmountStates = {
  amountMap?: Amount | undefined;
  __timerMap__?: TimerMap;
} & StateBase;
