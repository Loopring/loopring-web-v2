import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalDataStatus, WithdrawData, } from './interface'

const initialWithdrawState: WithdrawData = {
}

const initialState: ModalDataStatus = {
    withdraw: initialWithdrawState,
}

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
    name: '_router_modalData',
    initialState,
    reducers: {
        resetModalData(state) {
            state.withdraw = initialWithdrawState
        },
        updateWithdrawData(state, action: PayloadAction<Partial<ModalDataStatus>>) {
            const {} = action.payload
        },
    },
})

export { modalDataSlice }
export const { updateWithdrawData, resetModalData, } = modalDataSlice.actions
