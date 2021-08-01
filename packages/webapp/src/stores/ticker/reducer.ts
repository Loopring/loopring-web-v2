import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TickerStates } from './interface';
import { CoinKey, SagaStatus } from '@loopring-web/common-resources';

const initialState: Required<TickerStates> = {
    tickerMap: {},
    status: 'UNSET',
    errorMessage: null,
}
const tickerMapSlice: Slice = createSlice({
    name: 'tickerMap',
    initialState,
    reducers: {
        getTicker(state, action: PayloadAction<CoinKey<any>>) {
            state.status = SagaStatus.PENDING
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
export const {getTicker, getTickers, getTickerStatus, statusUnset} = tickerMapSlice.actions;