import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TradeVault, TradeVaultStatus } from './interface'
import { MAPFEEBIPS } from '../../../defs'
import {
  IBData,
  VaultBorrowData,
  VaultExitData,
  VaultJoinData,
  VaultRepayData,
} from '@loopring-web/common-resources'

const initState: TradeVault = {
  market: undefined,
  tradePair: undefined,
  tradeCalcData: {
    isVault: true,
  },
  maxFeeBips: MAPFEEBIPS,
} as unknown as TradeVault
const initJoinState: VaultJoinData = {} as unknown as VaultJoinData
const initExitState: VaultExitData = {} as unknown as VaultExitData
const initBorrowState: VaultBorrowData<IBData<any> & { erc20Symbol: string }> =
  {} as unknown as VaultBorrowData<IBData<any> & { erc20Symbol: string }>
const initRepayState: VaultRepayData<IBData<any> & { erc20Symbol: string }> =
  {} as unknown as VaultRepayData<IBData<any> & { erc20Symbol: string }>

const initialState: TradeVaultStatus = {
  // pageTradePro: initState,
  tradeVault: initState,
  vaultJoinData: initJoinState,
  vaultExitData: initExitState,
  vaultBorrowData: initBorrowState,
  vaultRepayData: initRepayState,
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
    resetVaultJoin(state) {
      state.vaultJoinData = initJoinState
    },
    resetVaultExit(state) {
      state.vaultExitData = initExitState
    },
    resetVaultBorrow(state) {
      state.vaultBorrowData = initBorrowState
    },
    resetVaultRepay(state) {
      state.vaultRepayData = initRepayState
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
        isRequiredBorrow,
        // VaultMarket,
        maxFeeBips,
        smallTradePromptAmt,
        upSlippageFeeBips,
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
        if (smallTradePromptAmt !== undefined) {
          state.tradeVault.smallTradePromptAmt = smallTradePromptAmt
        }
        if (upSlippageFeeBips !== undefined) {
          state.tradeVault.upSlippageFeeBips = upSlippageFeeBips
        }
        if (sellMaxL2AmtInfo !== undefined) {
          state.tradeVault.sellMaxL2AmtInfo = sellMaxL2AmtInfo
        }
        if (sellMaxAmtInfo !== undefined) {
          state.tradeVault.sellMaxAmtInfo = sellMaxAmtInfo
        }
        if (isRequiredBorrow !== undefined) {
          state.tradeVault.isRequiredBorrow = isRequiredBorrow
        }
      }
    },
    updateVaultJoin(state, action: PayloadAction<Partial<VaultJoinData>>) {
      state.vaultJoinData = { ...action.payload }
    },
    updateVaultExit(state, action: PayloadAction<Partial<VaultExitData>>) {
      state.vaultExitData = { ...action.payload }
    },
    updateVaultBorrow(
      state,
      action: PayloadAction<Partial<VaultBorrowData<IBData<any> & { erc20Symbol: string }>>>,
    ) {
      state.vaultBorrowData = { ...action.payload }
    },
    updateVaultRepay(
      state,
      action: PayloadAction<Partial<VaultRepayData<IBData<any> & { erc20Symbol: string }>>>,
    ) {
      state.vaultRepayData = { ...action.payload }
    },
  },
})

export { tradeVaultSlice }
export const {
  resetVaultJoin,
  updateVaultJoin,
  resetVaultExit,
  resetVaultSwap,
  updateVaultTrade,
  updateVaultExit,
  updateVaultBorrow,
  updateVaultRepay,
  resetVaultBorrow,
  resetVaultRepay,
} = tradeVaultSlice.actions
