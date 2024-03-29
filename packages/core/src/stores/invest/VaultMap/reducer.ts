import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { VaultMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<VaultMapStates> = {
  marketArray: [],
  marketCoins: [],
  erc20Array: [],
  erc20Map: {},
  marketMap: {},
  tradeMap: {},
  tokenMap: {},
  coinMap: {},
  idIndex: {},
  tokenPrices: {},
  joinTokenMap: {},
  addressIndex: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const vaultMapSlice: Slice = createSlice({
  name: 'vaultMap',
  initialState,
  reducers: {
    getVaultMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getVaultMapStatus(state, action: PayloadAction<VaultMapStates & { raw_data?: any }>) {
      // @ts-ignore
      if (action.payload.error) {
        state.status = SagaStatus.ERROR
      } else {
        const vaultMap = action.payload
        if (vaultMap) {
          state.marketArray = vaultMap.marketArray
          state.marketCoins = vaultMap.marketCoins
          state.marketMap = vaultMap.marketMap
          state.tradeMap = vaultMap.tradeMap
          state.coinMap = vaultMap.coinMap
          state.idIndex = vaultMap.idIndex
          state.addressIndex = vaultMap.addressIndex
          state.tokenMap = vaultMap.tokenMap
          state.joinTokenMap = vaultMap.joinTokenMap
          state.erc20Array = vaultMap.erc20Array
          state.erc20Map = vaultMap.erc20Map
          state.tokenPrices = vaultMap?.tokenPrices ?? {}
          state.raw_data = vaultMap?.raw_data ?? undefined
        }

        state.status = SagaStatus.DONE
      }
      if (action.payload.__timer__) {
        state.__timer__ = action.payload.__timer__
      }
    },
    updateVaultSyncMap(state, _action: PayloadAction<VaultMapStates>) {
      state.status = SagaStatus.PENDING
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { getVaultMap, updateVaultSyncMap, getVaultMapStatus, statusUnset } = vaultMapSlice.actions
export { vaultMapSlice, getVaultMap, getVaultMapStatus, statusUnset, updateVaultSyncMap }
