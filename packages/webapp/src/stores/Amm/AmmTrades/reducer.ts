import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import {  AmmTradesStates } from './interface';
import { STATUS } from '../../constant';


const initialState:Required<AmmTradesStates>  = {
    ammTrades:[],
    status:'UNSET',
    errorMessage:null,
}
const ammTradesSlice:Slice = createSlice({
    name: 'ammTrades',
    initialState,
    reducers: {
        getAmmTrades(state, action:PayloadAction<string | undefined>) {
            state.status = STATUS.PENDING
        },
        getAmmTradesStatus(state, action: PayloadAction<AmmTradesStates>) {
            // @ts-ignore
            if (action.error) {
                state.status =  STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.ammTrades = {...action.payload.ammTrades};
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }
    },
});
export { ammTradesSlice };
export const { getAmmTrades, getAmmTradesStatus, statusUnset } = ammTradesSlice.actions
