import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { GetTokenMapParams, TokenMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: TokenMapStates<object> = {
  marketArray: [],
  marketCoins: [],
  disableWithdrawList: [],
  coinMap: {},
  totalCoinMap: {},
  addressIndex: {},
  tokenMap: {},
  marketMap: {},
  idIndex: {},
  status: 'PENDING',
  errorMessage: null,
}
const tokenMapSlice: Slice<TokenMapStates<object>> = createSlice({
  name: 'tokenMap',
  initialState,
  reducers: {
    getTokenMap(state, _action: PayloadAction<GetTokenMapParams<any>>) {
      state.status = SagaStatus.PENDING
    },
    getTokenMapStatus(state, action: PayloadAction<TokenMapStates<object>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }

      const {
        tokenMap,
        totalCoinMap,
        marketMap,
        addressIndex,
        idIndex,
        coinMap,
        marketArray,
        marketCoins,
        disableWithdrawList,
      } = action.payload
      if (tokenMap) {
        state.tokenMap = tokenMap
      }
      if (marketMap) {
        state.marketMap = marketMap
      }
      if (addressIndex) {
        state.addressIndex = addressIndex
      }
      if (idIndex) {
        state.idIndex = idIndex
      }
      if (coinMap) {
        state.coinMap = coinMap
      }
      if (totalCoinMap) {
        state.totalCoinMap = totalCoinMap
      }
      if (marketArray) {
        state.marketArray = marketArray
      }
      if (marketCoins) {
        state.marketCoins = marketCoins
      }
      if (disableWithdrawList) {
        state.disableWithdrawList = disableWithdrawList
      }
      // if (tokenPairsMap) {state.tokenPairsMap = tokenPairsMap }
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { tokenMapSlice }
export const { getTokenMap, getTokenMapStatus, statusUnset } = tokenMapSlice.actions
