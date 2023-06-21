import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ENV, NETWORKEXTEND, System, SystemStatus } from './interface'
import { ForexMap, SagaStatus } from '@loopring-web/common-resources'

const initialState: SystemStatus = {
  env: ENV.PROD,
  chainId: NETWORKEXTEND.NONETWORK,
  baseURL: '',
  socketURL: '',
  dexToggleUrl: '',
  etherscanBaseUrl: '',
  gasPrice: -1,
  forexMap: {} as ForexMap<any>,
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
  allowTrade: {
    defiInvest: { enable: false },
    defi: { enable: false },
    legal: { enable: false },
    register: { enable: false },
    order: { enable: false },
    joinAmm: { enable: false },
    dAppTrade: { enable: false },
  },
  exchangeInfo: undefined,

  topics: [],
}
const systemSlice: Slice<SystemStatus> = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateSystem(state, action: PayloadAction<System>) {
      state.chainId = action.payload.chainId
      state.status = SagaStatus.PENDING
    },

    updateRealTimeObj(state, action: PayloadAction<Partial<{ forexMap: any; gasPrice: number }>>) {
      const { forexMap, gasPrice } = action.payload
      if (forexMap) {
        state.forexMap = forexMap
      }
      if (gasPrice) {
        state.gasPrice = gasPrice
      }
    },
    getSystemStatus(state, action: PayloadAction<Partial<SystemStatus>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const {
        env,
        baseURL,
        socketURL,
        gasPrice,
        forexMap,
        allowTrade,
        exchangeInfo,
        dexToggleUrl,
        __timer__,
        // isMobile,
        etherscanBaseUrl,
      } = action.payload

      if (env) {
        state.env = env
      }

      if (allowTrade) {
        state.allowTrade = allowTrade
      }
      if (socketURL) {
        state.socketURL = socketURL
      }
      if (baseURL) {
        state.baseURL = baseURL
      }

      if (dexToggleUrl) {
        state.dexToggleUrl = dexToggleUrl
      }
      if (gasPrice) {
        state.gasPrice = gasPrice
      }
      if (forexMap) {
        state.forexMap = forexMap
      }

      if (exchangeInfo) {
        state.exchangeInfo = exchangeInfo
      }
      if (etherscanBaseUrl) {
        state.etherscanBaseUrl = etherscanBaseUrl
      }

      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { updateSystem, setTopics, getSystemStatus, statusUnset, updateRealTimeObj } =
  systemSlice.actions
export { systemSlice, updateSystem, setTopics, getSystemStatus, statusUnset, updateRealTimeObj }
