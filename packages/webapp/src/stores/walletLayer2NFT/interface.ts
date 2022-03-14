import { StateBase } from "@loopring-web/common-resources";
import * as loopring_defs from "@loopring-web/loopring-sdk";

export type WalletLayer2NFTMap<R extends { [key: string]: any }> = {
  [key in keyof R]: loopring_defs.UserBalanceInfo;
};

export type WalletLayer2NFTStates = {
  walletLayer2NFT: loopring_defs.UserNFTBalanceInfo[];
  total: number;
  page: number;
} & StateBase;
