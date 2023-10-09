import { DualCalcData, DualViewOrder } from '@loopring-web/common-resources'

export type TradeDual<R> = DualCalcData<R>
export type EditDual<I> = {
  dualViewInfo: I
  tradeData: {
    isRenew: boolean
    renewTargetPrice?: string
    renewDuration?: number
  }
} & I

export type TradeDualStatus<R, I = DualViewOrder> = {
  tradeDual: TradeDual<R>
  editDual: EditDual<I>
  __DAYS__: 30
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}
