import * as sdk from "@loopring-web/loopring-sdk";
import { AccountInfo, RESULT_INFO } from "@loopring-web/loopring-sdk";

export enum ActionResultCode {
  NoError,
  DataNotReady,
  GetAccError,
  GenEddsaKeyError,
  UpdateAccoutError,
}

export type EddsaKey = { eddsaKey: any; accInfo?: AccountInfo };
export interface ActionResult {
  code: ActionResultCode;
  data?: RESULT_INFO | EddsaKey;
}
export const LAYOUT = {
  HEADER_HEIGHT: 64,
  FOOT_COMMON_HEIGHT: 48,
};

export const REFRESH_RATE = 1000;

export const TOAST_TIME = 3000;

export const DAYS = 30;

export const BIGO = sdk.toBig(0);

export enum AddressError {
  NoError = "NoError",
  EmptyAddr = "EmptyAddr",
  InvalidAddr = "InvalidAddr",
  ENSResolveFailed = "ENSResolveFailed",
}

export const MAPFEEBIPS = 63;
