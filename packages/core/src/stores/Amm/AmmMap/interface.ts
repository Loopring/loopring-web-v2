import {
  AmmDetailBase,
  CoinKey,
  StateBase,
  TradeFloat,
} from "@loopring-web/common-resources";
import { AmmPoolInfoV3, LoopringMap } from "@loopring-web/loopring-sdk";

export type GetAmmMapParams = { ammpools: LoopringMap<AmmPoolInfoV3> };

export type AmmDetailStore<T> = AmmDetailBase<T> & {
  // name?: string,
  coinA: CoinKey<T> | undefined;
  coinB: CoinKey<T> | undefined;
  address: string;
  tradeFloat: Partial<TradeFloat>;
  __rawConfig__: AmmPoolInfoV3;
};
export type AmmMap<
  R extends { [key: string]: any },
  I extends { [key: string]: any }
> = {
  [key in keyof R]: AmmDetailStore<I>;
};
export type AmmMapStates<
  R extends { [key: string]: any },
  I extends { [key: string]: any }
> = {
  ammMap: AmmMap<R, I> | undefined;
  __timer__?: number;
} & StateBase;
