import * as sdk from "@loopring-web/loopring-sdk";
import { ChainIdExtends } from "@loopring-web/common-resources";
export type ChainId = typeof ChainIdExtends | sdk.ChainId;
