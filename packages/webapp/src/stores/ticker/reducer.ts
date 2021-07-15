import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import {  TickerStates } from './interface';
import { STATUS } from '../constant';
import { CoinKey } from '@loopring-web/component-lib/src/static-resource';

const initialState:Required<TickerStates>  = {
    tickerMap:{},
    status:'UNSET',
    errorMessage:null,
}
const tickerMapSlice:Slice = createSlice({
    name: 'tickerMap',
    initialState,
    reducers: {
        getTicker(state, action:PayloadAction<CoinKey<any>>) {
            state.status = STATUS.PENDING
        },
        getTickers(state, action:PayloadAction<Array<CoinKey<any>>>) {
            state.status = STATUS.PENDING
        },
        getTickerStatus(state, action: PayloadAction<TickerStates>) {
            // @ts-ignore
            if (action.error) {
                state.status =  STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.tickerMap = action.payload.tickerMap;//{...state.tickerMap,...};
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }

    },
});
export { tickerMapSlice };
export const { getTicker,getTickers, getTickerStatus, statusUnset } = tickerMapSlice.actions;