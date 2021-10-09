import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { OnchainHashInfo, TxInfo, } from './interface'

const initialState: OnchainHashInfo = {
    depositHashes: {},
    withdrawHashes: {},
}

const onchainHashInfoSlice: Slice<OnchainHashInfo> = createSlice<OnchainHashInfo, SliceCaseReducers<OnchainHashInfo>, 'onchainHashInfo'>({
    name: 'onchainHashInfo',
    initialState,
    reducers: {
        clearAll(state: OnchainHashInfo, action: PayloadAction<undefined>) {
            state = initialState
        },
        clearDepositHash(state: OnchainHashInfo) {
            state.depositHashes = {}
        },
        clearWithdrawHash(state: OnchainHashInfo) {
            state.withdrawHashes = {}
        },
        updateDepositHash(state: OnchainHashInfo, action: PayloadAction<TxInfo>) {
            const txInfo = action.payload
            state.depositHashes[ txInfo.hash ] = txInfo
        },
        updateWithdrawHash(state: OnchainHashInfo, action: PayloadAction<TxInfo>) {
            const txInfo = action.payload
            state.withdrawHashes[ txInfo.hash ] = txInfo
        }
    },
})

export { onchainHashInfoSlice }
export const {
    clearAll,
    clearDepositHash,
    updateDepositHash,
    clearWithdrawHash,
    updateWithdrawHash
} = onchainHashInfoSlice.actions
