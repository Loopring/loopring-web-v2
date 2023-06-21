import * as sdk from '@loopring-web/loopring-sdk'
import {
  AmmExitData,
  AmmInData,
  AmmJoinData,
  IBData,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
// import { AmmDetailStore } from "../../Amm";

// export type PageAmmCommon = {
//   // ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined;
//   ammInfo: AmmDetailStore<any> | undefined;
// };

type PageAmmBase = {
  btnStatus: TradeBtnStatus
  btnI18nKey: string | undefined
  ammCalcData: AmmInData<any> | undefined
}

export type PageAmmJoin = {
  fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
  fee: number
  request: sdk.JoinAmmPoolRequest | undefined
  ammData: AmmJoinData<IBData<string>, string>
} & PageAmmBase

export type PageAmmExit = {
  volA_show: number | undefined
  volB_show: number | undefined
  volA: number | undefined
  volB: number | undefined
  fees: sdk.LoopringMap<sdk.OffchainFeeInfo>
  fee: number
  request: sdk.ExitAmmPoolRequest | undefined
  ammData: AmmExitData<IBData<string>, string>
} & PageAmmBase

export type PageAmmPoolStatus = {
  ammJoin: PageAmmJoin
  ammExit: PageAmmExit
  // common: PageAmmCommon;
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}
