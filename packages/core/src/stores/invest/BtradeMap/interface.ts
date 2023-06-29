import { StateBase } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type BradeUIMap = { enabled: boolean | 'isFormLocal' } & Omit<sdk.BTRADE_MARKET, 'enabled'>
export type BtradeMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<BradeUIMap>
  tradeMap: sdk.LoopringMap<{ tokenId: number; tradePairs: string[] }>
}

export type BtradeMapStates = BtradeMap & {
  __timer__?: number;
} & StateBase;
