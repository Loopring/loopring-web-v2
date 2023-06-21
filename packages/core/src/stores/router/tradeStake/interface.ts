import { RedeemStake, TradeStake } from '@loopring-web/common-resources'

export type TradeStakeStatus<C> = {
  tradeStake: TradeStake<C>
  __DAYS__: 30
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}

export type RedeemStakeStatus<C> = {
  redeemStake: RedeemStake<C>
  __DAYS__: 30
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}
