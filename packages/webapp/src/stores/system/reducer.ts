import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ENV, System, SystemStatus } from './interface';
import { STATUS } from '../constant';

const initialState: SystemStatus = {
    env: ENV.PROD,
    chainId: 'unknown',
    // network:'NONETWORK',
    baseURL: '',
    socketURL: '',
    faitPrices: undefined,
    gasPrice: undefined,
    forex: undefined,
    __timer__: -1,
    status: 'UNSET',
    errorMessage: null,

    exchangeInfo: undefined,

    topics: [],
}
const systemSlice: Slice<SystemStatus> = createSlice({
    name: 'system',
    initialState,
    reducers: {

        updateSystem(state, action: PayloadAction<System<{[key:string]:any}>>) {
            state.chainId = action.payload.chainId
            state.status = STATUS.PENDING
        },
        updateSocketURL(state, action:PayloadAction<{socketURL:string}>) {
            state.socketURL =  action.payload.socketURL;
        },
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
                state.status = STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            const {env, baseURL, faitPrices, gasPrice, forex, exchangeInfo, __timer__} = action.payload;
            if (env) {
                state.env = env
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

            if (__timer__) {
                state.__timer__ = __timer__
            }
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }

    },
});
export { systemSlice };
export const {updateSystem, setTopics, getSystemStatus, statusUnset, updateRealTimeObj, updateSocketURL} = systemSlice.actions;