import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'

export interface OnchainHashInfo {
    depositHash: string | undefined
    withdrawHash: string[]
}

const initialState: OnchainHashInfo = {
    depositHash: undefined,
    withdrawHash: [],
}

const onchainHashInfoSlice: Slice<OnchainHashInfo> = createSlice<OnchainHashInfo, SliceCaseReducers<OnchainHashInfo>, 'onchainHashInfo'>({
    name: 'onchainHashInfo',
    initialState,
    reducers: {
        clearAll(state: OnchainHashInfo, action: PayloadAction<undefined>) {
            state = initialState
        },
        clearDepositHash(state: OnchainHashInfo, action: PayloadAction<string>) {
            state.depositHash = undefined
        },
        updateDepositHash(state: OnchainHashInfo, action: PayloadAction<string>) {
            state.depositHash = action.payload
        }
    },
});

export { onchainHashInfoSlice }
export const {clearAll, clearDepositHash, updateDepositHash} = onchainHashInfoSlice.actions
