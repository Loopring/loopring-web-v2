import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ENV, NETWORKEXTEND, System, SystemStatus } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: SystemStatus = {
  env: ENV.PROD,
  chainId: NETWORKEXTEND.NONETWORK,
  baseURL: "",
  socketURL: "",
  etherscanBaseUrl: "",
  fiatPrices: {},
  gasPrice: -1,
  forex: 6.5,
  __timer__: -1,
  status: "PENDING",
  errorMessage: null,
  allowTrade: {
    legal: { enable: false },
    register: { enable: false },
    order: { enable: false },
    joinAmm: { enable: false },
    dAppTrade: { enable: false },
  },
  exchangeInfo: undefined,

  topics: [],
};
const systemSlice: Slice<SystemStatus> = createSlice({
  name: "system",
  initialState,
  reducers: {
    updateSystem(state, action: PayloadAction<System<{ [key: string]: any }>>) {
      state.chainId = action.payload.chainId;
      state.status = SagaStatus.PENDING;
    },

    updateRealTimeObj(
      state,
      action: PayloadAction<
        Partial<{ fiatPrices: any; gasPrice: number; forex: number }>
      >
    ) {
      const { forex, fiatPrices, gasPrice } = action.payload;
      if (forex) {
        state.forex = forex;
      }
      if (fiatPrices) {
        state.fiatPrices = fiatPrices;
      }
      if (gasPrice) {
        state.gasPrice = gasPrice;
      }
    },
    getSystemStatus(state, action: PayloadAction<Partial<SystemStatus>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      const {
        env,
        baseURL,
        socketURL,
        fiatPrices,
        gasPrice,
        forex,
        allowTrade,
        exchangeInfo,
        __timer__,
        // isMobile,
        etherscanBaseUrl,
      } = action.payload;

      if (env) {
        state.env = env;
      }

      if (allowTrade) {
        state.allowTrade = allowTrade;
      }
      if (socketURL) {
        state.socketURL = socketURL;
      }
      if (baseURL) {
        state.baseURL = baseURL;
      }
      if (fiatPrices) {
        state.fiatPrices = fiatPrices;
      }
      if (gasPrice) {
        state.gasPrice = gasPrice;
      }
      if (forex) {
        state.forex = forex;
      }

      if (exchangeInfo) {
        state.exchangeInfo = exchangeInfo;
      }
      if (etherscanBaseUrl) {
        state.etherscanBaseUrl = etherscanBaseUrl;
      }

      if (__timer__) {
        state.__timer__ = __timer__;
      }
      state.status = SagaStatus.DONE;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
export { systemSlice };
export const {
  updateSystem,
  setTopics,
  getSystemStatus,
  statusUnset,
  updateRealTimeObj,
} = systemSlice.actions;
