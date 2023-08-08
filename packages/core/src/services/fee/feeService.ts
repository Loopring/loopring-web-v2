import { OffchainFeeReqType, OffchainNFTFeeReqType } from '@loopring-web/loopring-sdk'
import { Subject } from 'rxjs'

export enum FeeCommands {
  CheckFeeIsEnough,
  ResetIntervalTime,
}

type CheckFeeIsEnoughData =  {
  isRequiredAPI: true
  intervalTime?: number
  requestType?: OffchainFeeReqType | OffchainNFTFeeReqType
} & any;

const subject = new Subject<
  | {
      status: FeeCommands.CheckFeeIsEnough
      data?: CheckFeeIsEnoughData
    }
  | { status: FeeCommands.ResetIntervalTime }
>()
export const feeServices = {
  checkFeeIsEnough: (data?: CheckFeeIsEnoughData) => {
    subject.next({
      status: FeeCommands.CheckFeeIsEnough,
      data
    })
  },
  resetIntervalTime: () => {
    subject.next({
      status: FeeCommands.ResetIntervalTime,
    })
  },
  onSocket: () => subject.asObservable(),
}
