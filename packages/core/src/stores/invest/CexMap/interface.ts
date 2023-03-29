import { StateBase } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type CexMap = {
  marketArray: string[];
  marketCoins: string[];
  marketMap: sdk.LoopringMap<sdk.CEX_MARKET>;
};

export type CexMapStates = CexMap & {
  __timer__?: number;
} & StateBase;
