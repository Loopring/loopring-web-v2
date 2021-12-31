import * as sdk from "@loopring-web/loopring-sdk";

export enum ActionResultCode {
  NoError,
  DataNotReady,
  GetAccError,
  GenEddsaKeyError,
  UpdateAccoutError,
  ApproveFailed,
  DepositFailed,
}

export interface ActionResult {
  code: ActionResultCode;
  data?: any;
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
  NoError,
  EmptyAddr,
  InvalidAddr,
  ENSResolveFailed,
}

export const MAPFEEBIPS = 63;
