import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { WalletLayer1Map, WalletLayer1States } from './interface';
import { STATUS } from '../constant';


const initialState:WalletLayer1States  = {
    walletLayer1:undefined,
    status:'UNSET',
    errorMessage:null,
}
const walletLayer1Slice:Slice = createSlice({
    name: 'walletLayer1',
    initialState,
    reducers: {
        updateWalletLayer1(state, action:PayloadAction<string | undefined>) {
            state.status = STATUS.PENDING
        },
        reset(state, action:PayloadAction<string | undefined>) {
            state.walletLayer1 = undefined;
            state.status = STATUS.UNSET;
        },
        getWalletLayer1Status(state, action: PayloadAction<{ walletLayer1:WalletLayer1Map<object> }>) {
            // @ts-ignore
            if (action.error) {
                state.status =  STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.walletLayer1 = {...action.payload.walletLayer1};
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }
    },
});
export { walletLayer1Slice };
export const { updateWalletLayer1, getWalletLayer1Status,statusUnset,reset } = walletLayer1Slice.actions
