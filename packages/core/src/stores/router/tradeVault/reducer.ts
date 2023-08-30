import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TradeVault, TradeVaultStatus } from './interface'
import { MAPFEEBIPS } from '../../../defs'

const initState: TradeVault = {
  market: undefined,
  tradePair: undefined,
  tradeCalcData: {
    isVault: true,
  },
  maxFeeBips: MAPFEEBIPS,
} as unknown as TradeVault
const initialState: TradeVaultStatus = {
  // pageTradePro: initState,
  tradeVault: initState,
  __DAYS__: 30,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const tradeVaultSlice: Slice<TradeVaultStatus> = createSlice({
  name: '_router_tradeVault',
  initialState,
  reducers: {
    resetVaultSwap(state) {
      state.tradeVault = initState
    },
    updateVaultTrade(state, action: PayloadAction<Partial<TradeVault>>) {
      const {
        market,
        tradePair,
        request,
        tradeCalcData,
        depth,
        sellUserOrderInfo,
        buyUserOrderInfo,
        minOrderInfo,
        lastStepAt,
        totalFee,
        sellMinAmtInfo,
        sellMaxL2AmtInfo,
        sellMaxAmtInfo,
        // VaultMarket,
        maxFeeBips,
        ...rest
      } = action.payload
      if (market !== state.tradeVault.market && market && tradePair) {
        // @ts-ignore
        const [_, sellToken, buyToken] = (tradePair ?? '').match(/(\w+)-(\w+)/i)
        // @ts-ignore
        state.tradeVault = {
          market,
          tradePair, //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
          request,
          depth,
          totalFee,
          minOrderInfo,
          sellToken,
          buyToken,
          tradeCalcData: tradeCalcData as any,
          sellUserOrderInfo,
          buyUserOrderInfo,
          sellMinAmtInfo,
          sellMaxL2AmtInfo,
          sellMaxAmtInfo,
          lastStepAt: undefined,
          maxFeeBips,
          ...rest,
        }
      } else {
        if (lastStepAt) {
          state.tradeVault.lastStepAt = lastStepAt
        }

        if (tradePair && tradePair) {
          const [_, sellToken, buyToken] = tradePair.match(/(\w+)-(\w+)/i)
          state.tradeVault.tradePair = tradePair
          state.tradeVault.sellToken = sellToken
          state.tradeVault.buyToken = buyToken
          state.tradeVault.lastStepAt = undefined
        }
        if (depth) {
          state.tradeVault.depth = depth
        }

        if (totalFee) {
          state.tradeVault.totalFee = totalFee
        }
        // if (takerRate) {
        //   state.tradeVault.takerRate = takerRate;
        // }
        if (minOrderInfo) {
          state.tradeVault.minOrderInfo = minOrderInfo
        }
        if (maxFeeBips !== undefined) {
          state.tradeVault.maxFeeBips = maxFeeBips
        }
        if (tradeCalcData) {
          state.tradeVault.tradeCalcData = tradeCalcData
        }
        if (sellUserOrderInfo !== undefined) {
          state.tradeVault.sellUserOrderInfo = sellUserOrderInfo
        }
        if (buyUserOrderInfo !== undefined) {
          state.tradeVault.buyUserOrderInfo = buyUserOrderInfo
        }

        if (sellMinAmtInfo !== undefined) {
          state.tradeVault.sellMinAmtInfo = sellMinAmtInfo
        }
        if (sellMaxL2AmtInfo !== undefined) {
          state.tradeVault.sellMaxL2AmtInfo = sellMaxL2AmtInfo
        }
        if (sellMaxAmtInfo !== undefined) {
          state.tradeVault.sellMaxAmtInfo = sellMaxAmtInfo
        }
      }
    },
  },
})

export { tradeVaultSlice }
export const { resetVaultSwap, updateVaultTrade } = tradeVaultSlice.actions
