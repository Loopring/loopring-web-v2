import * as sdk from 'loopring-sdk'

export type PageAmmCommon = {
    ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined,
    ammInfo: any,
}

export type PageAmmJoin = {
    fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
    fee: number
    request: sdk.JoinAmmPoolRequest | undefined
}

export type PageAmmExit = {
    volA_show: number | undefined
    volB_show: number | undefined
    fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
    fee: number
    request: sdk.ExitAmmPoolRequest | undefined
}

export type PageAmmPoolStatus = {
    ammJoin: PageAmmJoin,
    ammExit: PageAmmExit,
    common: PageAmmCommon,
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}
