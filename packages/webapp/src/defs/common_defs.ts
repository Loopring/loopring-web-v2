export enum Theme {
    dark = 'dark',
    light = 'light',
}

export enum LangType {
    en = 'en_US',
    cn = 'zh_CN',
}

export enum SystemStatus {
    NORMAL,
    ERROR,
    UNKNOWN,
}

export enum MODAL_TYPE {
    UNKNOWN,
    LOADING,
    WALLET,
}


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

export const REFRESH_RATE_SLOW = 10000

export const UPDATE_ACC_DELAY = 2500

export const TOAST_TIME = 3000

export const SHORT_INTERVAL = 200
