

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

export const REFRESH_RATE_SLOW = 15000

export const UPDATE_ACC_DELAY = 2500

export const TOAST_TIME = 3000

export const SHORT_INTERVAL = 200

export const DAYS = 30
