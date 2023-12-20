import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TradeDefiStatus } from './interface'
import { IBData, TradeDefi, RequireOne } from '@loopring-web/common-resources'
import { TokenInfo } from '@loopring-web/loopring-sdk'

const initState: TradeDefi<any> = {
  type: 'LIDO',
  isStoB: true,
  sellToken: {} as any,
  buyToken: {} as any,
  depositPrice: '0',
  withdrawPrice: '0',
  sellVol: '0',
  buyVol: '0',
  deFiCalcData: {
    coinSell: {},
    coinBuy: {},
    AtoB: undefined as any,
    BtoA: undefined as any,
    fee: undefined as any,
  },
  fee: '0',
  feeRaw: '0',
  defaultFee: '0',
}
type R = { [key: string]: any }
const initialState: TradeDefiStatus<IBData<R>> = {
  tradeDefi: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const tradeDefiSlice: Slice<TradeDefiStatus<IBData<R>>> = createSlice({
  name: '_router_tradeDefi',
  initialState,
  reducers: {
    resetTradeDefi(state) {
      state.tradeDefi = initState
    },
    updateTradeDefi(state, action: PayloadAction<RequireOne<TradeDefi<IBData<any>>, 'market'>>) {
      const {
        type,
        market,
        isStoB,
        sellToken,
        buyToken,
        sellVol,
        buyVol,
        deFiCalcData,
        fee,
        defiBalances,
        depositPrice,
        withdrawPrice,
        request,
        feeRaw,
        maxSellVol,
        maxFeeBips,
        miniSellVol,
        lastInput,
        defaultFee,
      } = action.payload
      if (market !== undefined && market !== state.tradeDefi.market && type) {
        // @ts-ignore
        state.tradeDefi = {
          ...initState,
          type,
          market,
          sellToken: sellToken as TokenInfo,
          buyToken: buyToken as TokenInfo,
        }
      }
      if (lastInput) {
        state.tradeDefi.lastInput = lastInput
      }
      if (request) {
        state.tradeDefi.request = request
      }

      if (deFiCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.tradeDefi.deFiCalcData = deFiCalcData
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.tradeDefi.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.tradeDefi.deFiCalcData.BtoA;
        // }
      }
      if (defaultFee) {
        state.tradeDefi.defaultFee = defaultFee
      }
      if (isStoB) {
        state.tradeDefi.isStoB = isStoB
      }
      if (defiBalances) {
        state.tradeDefi.defiBalances = defiBalances
      }
      if (maxSellVol) {
        state.tradeDefi.maxSellVol = maxSellVol
      }
      if (maxFeeBips) {
        state.tradeDefi.maxFeeBips = maxFeeBips
      }
      if (miniSellVol) {
        state.tradeDefi.miniSellVol = miniSellVol
      }
      if (sellVol !== undefined) {
        state.tradeDefi.sellVol = sellVol
      }
      if (buyVol !== undefined) {
        state.tradeDefi.buyVol = buyVol
      }
      if (fee) {
        state.tradeDefi.fee = fee
      }
      if (feeRaw) {
        state.tradeDefi.feeRaw = feeRaw
      }
      if (depositPrice) {
        state.tradeDefi.depositPrice = depositPrice
      }
      if (withdrawPrice) {
        state.tradeDefi.withdrawPrice = withdrawPrice
      }
    },
  },
})
export { tradeDefiSlice }
export const { updateTradeDefi, resetTradeDefi } = tradeDefiSlice.actions
