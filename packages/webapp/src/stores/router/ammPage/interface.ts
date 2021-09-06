import { TradeBtnStatus } from '@loopring-web/component-lib'
import * as sdk from 'loopring-sdk'

export type PageAmmCommon = {
    ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined,
    ammInfo: any,
}

type PageAmmBase = {
    btnStatus: TradeBtnStatus
    btnI18nKey: string | undefined
}

export type PageAmmJoin = {
    fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
    fee: number
    request: sdk.JoinAmmPoolRequest | undefined
} & PageAmmBase

export type PageAmmExit = {
    volA_show: number | undefined
    volB_show: number | undefined
    fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
    fee: number
    request: sdk.ExitAmmPoolRequest | undefined
} & PageAmmBase

export type PageAmmPoolStatus = {
    ammJoin: PageAmmJoin,
    ammExit: PageAmmExit,
    common: PageAmmCommon,
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}
