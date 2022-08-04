import { StateBase } from "@loopring-web/common-resources";
import * as loopring_defs from "@loopring-web/loopring-sdk";

export type WalletL2CollectionStates = {
  // TODO
  // @ts-ignore
  walletL2Collection: loopring_defs.NFTCollection[];
  total: number;
  page: number;
} & StateBase;
