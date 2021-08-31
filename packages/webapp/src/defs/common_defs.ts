

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
    code: ActionResultCode
    data?: any
}

export const REFRESH_RATE = 1000

export const TOAST_TIME = 3000

export const DAYS = 30
