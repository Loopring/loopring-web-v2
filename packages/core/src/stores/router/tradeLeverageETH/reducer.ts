import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TradeLeverageETHStatus } from './interface'
import { IBData, TradeDefi, RequireOne } from '@loopring-web/common-resources'
import { TokenInfo } from '@loopring-web/loopring-sdk'

const initState: TradeDefi<any> = {
  type: 'CIAN',
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
const initialState: TradeLeverageETHStatus<IBData<R>> = {
  tradeLeverageETH: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const tradeLeverageETHSlice: Slice<TradeLeverageETHStatus<IBData<R>>> = createSlice({
  name: '_router_tradeLeverageETH',
  initialState,
  reducers: {
    resetTradeLeverageETH(state) {
      state.tradeLeverageETH = initState
    },
    updateTradeLeverageETH(
      state,
      action: PayloadAction<RequireOne<TradeDefi<IBData<any>>, 'market'>>,
    ) {
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
        withdrawFeeBips,
      } = action.payload
      if (market !== undefined && market !== state.tradeLeverageETH.market && type) {
        // @ts-ignore
        state.tradeLeverageETH = {
          ...initState,
          type,
          market,
          sellToken: sellToken as TokenInfo,
          buyToken: buyToken as TokenInfo,
        }
      }
      if (lastInput) {
        state.tradeLeverageETH.lastInput = lastInput
      }
      if (request) {
        state.tradeLeverageETH.request = request
      }

      if (deFiCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.tradeLeverageETH.deFiCalcData = deFiCalcData
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.tradeLeverageETH.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.tradeLeverageETH.deFiCalcData.BtoA;
        // }
      }
      if (isStoB) {
        state.tradeLeverageETH.isStoB = isStoB
      }
      if (defiBalances) {
        state.tradeLeverageETH.defiBalances = defiBalances
      }
      if (maxSellVol) {
        state.tradeLeverageETH.maxSellVol = maxSellVol
      }
      if (maxFeeBips) {
        state.tradeLeverageETH.maxFeeBips = maxFeeBips
      }
      if (miniSellVol) {
        state.tradeLeverageETH.miniSellVol = miniSellVol
      }
      if (sellVol !== undefined) {
        state.tradeLeverageETH.sellVol = sellVol
      }
      if (buyVol !== undefined) {
        state.tradeLeverageETH.buyVol = buyVol
      }
      if (fee) {
        state.tradeLeverageETH.fee = fee
      }
      if (feeRaw) {
        state.tradeLeverageETH.feeRaw = feeRaw
      }
      if (depositPrice) {
        state.tradeLeverageETH.depositPrice = depositPrice
      }
      if (withdrawPrice) {
        state.tradeLeverageETH.withdrawPrice = withdrawPrice
      }
      if (withdrawFeeBips) {
        state.tradeLeverageETH.withdrawFeeBips = withdrawFeeBips
      }
    },
  },
})
export { tradeLeverageETHSlice }
export const { updateTradeLeverageETH, resetTradeLeverageETH } = tradeLeverageETHSlice.actions
