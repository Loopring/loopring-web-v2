import * as sdk from '@loopring-web/loopring-sdk'

export enum ActionResultCode {
  NoError,
  DataNotReady,
  GetAccError,
  GenEddsaKeyError,
  UpdateAccountError,
}

export type EddsaKey = { eddsaKey: any; accInfo?: sdk.AccountInfo }

export const LAYOUT = {
  HEADER_HEIGHT: 64,
  FOOT_COMMON_HEIGHT: 48,
}

export const REFRESH_RATE = 1000

export const DAYS = 30

export const BIGO = sdk.toBig(0)

export const MAPFEEBIPS = 63
