import { StateBase } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type WalletL2CollectionStates = {
	// TODO
	// @ts-ignore
	walletL2Collection: sdk.CollectionMeta[];
	total: number;
	page: number;
} & StateBase;
