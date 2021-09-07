import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalDataStatus, WithdrawData, } from './interface'

const initialWithdrawState: WithdrawData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
}

const initialState: ModalDataStatus = {
    withdrawValue: initialWithdrawState,
}

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
    name: '_router_modalData',
    initialState,
    reducers: {
        resetAll(state) {
            this.resetWithdrawData(state)
        },
        resetWithdrawData(state) {
            state.withdrawValue = initialWithdrawState
        },
        updateWithdrawData(state, action: PayloadAction<Partial<WithdrawData>>) {
            const { belong, balance, tradeValue } = action.payload

            if (belong) {
                state.withdrawValue.belong = belong
            }

            if (balance !== undefined) {
                state.withdrawValue.balance = balance
            }

            if (tradeValue !== undefined) {
                state.withdrawValue.tradeValue = tradeValue
            }

        },
    },
})

export { modalDataSlice }
export const { updateWithdrawData, resetModalData, } = modalDataSlice.actions
