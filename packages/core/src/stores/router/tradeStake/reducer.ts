import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { RedeemStakeStatus, TradeStakeStatus } from './interface'
import { IBData, RedeemStake, TradeStake } from '@loopring-web/common-resources'
import { TokenInfo } from '@loopring-web/loopring-sdk'

const initState: TradeStake<any> = {
  sellToken: {} as any,
  sellVol: '0',
  deFiSideCalcData: {
    coinSell: {},
    stakeViewInfo: {} as any,
  },
}
type R = { [key: string]: any }
const initialState: TradeStakeStatus<IBData<R>> = {
  tradeStake: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const tradeStakeSlice: Slice<TradeStakeStatus<IBData<R>>> = createSlice({
  name: 'router_tradeStake',
  initialState,
  reducers: {
    resetTradeStake(state) {
      state.tradeStake = initState
    },
    updateTradeStake(state, action: PayloadAction<TradeStake<IBData<any>>>) {
      const { sellToken, sellVol, deFiSideCalcData, request } = action.payload
      state.tradeStake = {
        ...initState,
        sellToken: sellToken as TokenInfo,
      }

      if (request) {
        state.tradeStake.request = request
      }

      if (deFiSideCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.tradeStake.deFiSideCalcData = deFiSideCalcData
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.tradeStake.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.tradeStake.deFiCalcData.BtoA;
        // }
      }

      if (sellVol !== undefined) {
        state.tradeStake.sellVol = sellVol
      }
    },
  },
})

const initRedeemState: RedeemStake<any> = {
  sellToken: {} as any,
  sellVol: '0',
  deFiSideRedeemCalcData: {
    coinSell: {},
  } as any,
}
const initialRedeemState: RedeemStakeStatus<any> = {
  redeemStake: initRedeemState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const redeemStakeSlice: Slice<RedeemStakeStatus<IBData<R>>> = createSlice({
  name: '_router_redeemStake',
  initialState: initialRedeemState,
  reducers: {
    resetRedeemStake(state) {
      state.redeemStake = initRedeemState
    },
    updateRedeemStake(state, action: PayloadAction<RedeemStake<IBData<any>>>) {
      const { sellToken, sellVol, deFiSideRedeemCalcData, request } = action.payload
      state.redeemStake = {
        ...initRedeemState,
        sellToken: sellToken as TokenInfo,
      }

      if (request) {
        state.redeemStake.request = request
      }

      if (deFiSideRedeemCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.redeemStake.deFiSideRedeemCalcData = deFiSideRedeemCalcData
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.redeemStake.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.redeemStake.deFiCalcData.BtoA;
        // }
      }

      if (sellVol !== undefined) {
        state.redeemStake.sellVol = sellVol
      }
    },
  },
})
export { tradeStakeSlice, redeemStakeSlice }
export const { updateTradeStake, resetTradeStake } = tradeStakeSlice.actions
export const { updateRedeemStake, resetRedeemStake } = redeemStakeSlice.actions
