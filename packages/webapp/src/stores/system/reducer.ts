import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ENV, System, SystemStatus } from './interface';
import { SagaStatus } from '@loopring-web/common-resources';

const initialState: SystemStatus = {
    env: ENV.PROD,
    chainId: 'unknown',
    // network:'NONETWORK',
    baseURL: '',
    socketURL: '',
    etherscanBaseUrl: '',
    faitPrices: {},
    gasPrice: -1,
    forex: 6.5,
    __timer__: -1,
    status: 'PENDING',
    errorMessage: null,

    exchangeInfo: undefined,

    topics: [],
}
const systemSlice: Slice<SystemStatus> = createSlice({
    name: 'system',
    initialState,
    reducers: {

        updateSystem(state, action: PayloadAction<System<{ [ key: string ]: any }>>) {
            state.chainId = action.payload.chainId
            state.status = SagaStatus.PENDING
        },
        // updateSocketURL(state, action:PayloadAction<{socketURL:string}>) {
        //     state.socketURL =  action.payload.socketURL;
        // },
        updateRealTimeObj(state, action: PayloadAction<Partial<{ faitPrices: any, gasPrice: number, forex: number }>>) {
            const {forex, faitPrices, gasPrice} = action.payload;
            if (forex) {
                state.forex = forex
            }
            if (faitPrices) {
                state.faitPrices = faitPrices
            }
            if (gasPrice) {
                state.gasPrice = gasPrice
            }


            // state = {
            //     ...state.system,
            //     forex: forex?,
            //     faitPrices: action.payload.faitPrices ? action.payload.faitPrices : state.system.faitPrices,
            //     gasPrice: action.payload.gasPrice ? action.payload.gasPrice : state.system.gasPrice,
            // };

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
                faitPrices,
                gasPrice,
                forex,
                exchangeInfo,
                __timer__,
                etherscanBaseUrl
            } = action.payload;
            if (env) {
                state.env = env
            }
            if (socketURL) {
                state.socketURL = socketURL;
            }
            if (baseURL) {
                state.baseURL = baseURL
            }
            if (faitPrices) {
                state.faitPrices = faitPrices
            }
            if (gasPrice) {
                state.gasPrice = gasPrice
            }
            if (forex) {
                state.forex = forex
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
        statusUnset: state => {
            state.status = SagaStatus.UNSET
        }

    },
});
export { systemSlice };
export const {updateSystem, setTopics, getSystemStatus, statusUnset, updateRealTimeObj} = systemSlice.actions;