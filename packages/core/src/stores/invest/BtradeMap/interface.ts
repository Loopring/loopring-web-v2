import { StateBase } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type BtradeMap = {
  marketArray: string[];
  marketCoins: string[];
  marketMap: sdk.LoopringMap<sdk.BTRADE_MARKET>;
  tradeMap: sdk.LoopringMap<{ tokenId: number; tradePairs: string[] }>;
};

export type BtradeMapStates = BtradeMap & {
  __timer__?: number;
} & StateBase;
