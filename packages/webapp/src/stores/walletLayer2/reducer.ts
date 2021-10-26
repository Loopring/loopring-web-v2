    import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
    import { WalletLayer2Map, WalletLayer2States } from './interface';
import { SagaStatus } from '@loopring-web/common-resources';
import * as loopring_defs from '@loopring-web/loopring-sdk';


const initialState: WalletLayer2States = {
    walletLayer2: undefined,
    status: 'DONE',
    errorMessage: null,
}
const walletLayer2Slice: Slice<WalletLayer2States> = createSlice({
    name: 'walletLayer2',
    initialState,
    reducers: {
        updateWalletLayer2(state, action: PayloadAction<string | undefined>) {
            state.status = SagaStatus.PENDING
        },
        reset(state, action: PayloadAction<string | undefined>) {
            state.walletLayer2 = undefined;
            state.status = SagaStatus.UNSET;
        },
        socketUpdateBalance(state, action: PayloadAction<{ [ key: string ]: loopring_defs.UserBalanceInfo }>) {
            state.status = SagaStatus.PENDING;
        },
        getWalletLayer2Status(state, action: PayloadAction<{ walletLayer2: WalletLayer2Map<object> }>) {
            // @ts-ignore
            if (action.error) {
                state.status = SagaStatus.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.walletLayer2 = {...action.payload.walletLayer2};
            state.status = SagaStatus.DONE
        },
        statusUnset: state => {
            state.status = SagaStatus.UNSET
        }
    },
});
export { walletLayer2Slice };
export const {
    updateWalletLayer2,
    socketUpdateBalance,
    getWalletLayer2Status,
    statusUnset,
    reset
} = walletLayer2Slice.actions
