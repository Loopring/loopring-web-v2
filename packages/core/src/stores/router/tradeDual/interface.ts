import { DualCalcData } from '@loopring-web/common-resources'

export type TradeDual<R> = DualCalcData<R>

export type TradeDualStatus<R> = {
  tradeDual: TradeDual<R>
  __DAYS__: 30
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}
