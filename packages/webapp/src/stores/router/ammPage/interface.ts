import * as sdk from 'loopring-sdk'

export type PageAmmJoin = {
    fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
    fee: number
    ammInfo: any
    request: sdk.JoinAmmPoolRequest | undefined
}

export type PageAmmExit = {
}

export type PageAmmPoolStatus = {
    ammJoin: PageAmmJoin,
    ammExit: PageAmmExit,
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}
