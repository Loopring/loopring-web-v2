import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { Ticker, TickerStates } from './interface';
import { CoinKey, MarketType, SagaStatus } from '@loopring-web/common-resources';
import { makeTickerMap } from '../../hooks/help';
import { LoopringMap, TickerData } from 'loopring-sdk';

const initialState: Required<TickerStates> = {
    tickerMap: {},
    __timer__: -1,
    status: 'PENDING',
    errorMessage: null,
}
const tickerMapSlice: Slice = createSlice({
    name: 'tickerMap',
    initialState,
    reducers: {
        updateTicker(state, action: PayloadAction<LoopringMap<TickerData>>) {
            if(action.payload){
                const tickMap  =  action.payload
                const {data} = makeTickerMap({tickerMap: tickMap})
                state.tickerMap = {
                    ...state.tickerMap,
                    ...data
                }
            }
            state.status = SagaStatus.DONE
        },
        getTickers(state, action: PayloadAction<Array<CoinKey<any>>>) {
            state.status = SagaStatus.PENDING
        },
        getTickerStatus(state, action: PayloadAction<TickerStates>) {
            // @ts-ignore
            if (action.error) {
                state.status = SagaStatus.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.tickerMap = action.payload.tickerMap;//{...state.tickerMap,...};
            state.status = SagaStatus.DONE
        },
        statusUnset: state => {
            state.status = SagaStatus.UNSET
        }

    },
});
export { tickerMapSlice };
export const {updateTicker, getTickers, getTickerStatus, statusUnset} = tickerMapSlice.actions;