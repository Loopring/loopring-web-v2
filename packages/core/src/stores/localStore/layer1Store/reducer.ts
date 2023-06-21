import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { LAYER1_ACTION_HISTORY, Layer1ActionHistory } from '@loopring-web/common-resources'
import { ChainId } from '@loopring-web/loopring-sdk'

// @ts-ignore
const initialState: LAYER1_ACTION_HISTORY = {
  [ChainId.GOERLI]: {},
  [ChainId.MAINNET]: {},
  __timer__: -1,
}

const layer1ActionHistorySlice: Slice<LAYER1_ACTION_HISTORY> = createSlice<
  LAYER1_ACTION_HISTORY,
  SliceCaseReducers<LAYER1_ACTION_HISTORY>,
  'layer1ActionHistory'
>({
  name: 'layer1ActionHistory',
  initialState,
  reducers: {
    circleUpdateLayer1ActionHistory(
      // @ts-ignore
      state,
      // @ts-ignore
      action: PayloadAction<{ chainId: string }>,
    ) {},
    layer1ActionHistoryStatus(
      state,
      action: PayloadAction<
        {
          chainId: string
          __timer__: NodeJS.Timeout
        } & Layer1ActionHistory
      >,
    ) {
      const { chainId, __timer__, layer1ActionHistory } = action.payload
      // @ts-ignore
      if (action.error) {
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.__timer__ = __timer__

      state[chainId] = { ...layer1ActionHistory } //{...state.amountMap, ...action.payload.amountMap};
    },
    clearOneItem(
      state,
      action: PayloadAction<{
        domain: string
        uniqueId: string
        chainId: ChainId
      }>,
    ) {
      const { domain, uniqueId, chainId } = action.payload
      try {
        if (state[chainId] && state[chainId][domain] && state[chainId][domain][uniqueId]) {
          // Reflect.ownKeys(state[chainId][domain]).findIndex()
          delete state[chainId][domain][uniqueId]
        }
      } catch (e) {}
    },
    setOneItem(
      state,
      action: PayloadAction<{
        domain: string
        uniqueId: string
        chainId: ChainId
      }>,
    ) {
      const { domain, uniqueId, chainId } = action.payload

      state[chainId][domain] = {
        ...state[chainId][domain],
        [uniqueId]: Date.now(),
      }
    },
  },
})

export { layer1ActionHistorySlice }
export const {
  clearOneItem,
  circleUpdateLayer1ActionHistory,
  layer1ActionHistoryStatus,
  setOneItem,
} = layer1ActionHistorySlice.actions
