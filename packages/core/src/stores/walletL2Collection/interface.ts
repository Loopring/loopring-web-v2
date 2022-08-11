import { StateBase, CollectionMeta } from "@loopring-web/common-resources";

export type WalletL2CollectionStates<C extends CollectionMeta> = {
	// TODO
	// @ts-ignore
	walletL2Collection: C[];
	total: number;
	page: number;
} & StateBase;
