import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalDataStatus, WithdrawData, TransferData, DepositData, } from './interface'

const initialWithdrawState: WithdrawData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
}

const initialTransferState: TransferData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
    address: ''
}

const initialDepositState: DepositData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
}

const initialState: ModalDataStatus = {
    withdrawValue: initialWithdrawState,
    transferValue: initialTransferState,
    depositValue: initialDepositState,
}

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
    name: '_router_modalData',
    initialState,
    reducers: {
        resetAll(state) {
            this.resetWithdrawData(state)
            this.resetTransferData(state)
            this.resetDepositData(state)
        },
        resetWithdrawData(state) {
            state.withdrawValue = initialWithdrawState
        },
        resetTransferData(state) {
            state.transferValue = initialTransferState
        },
        resetDepositData(state) {
            state.depositValue = initialDepositState
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
        updateTransferData(state, action: PayloadAction<Partial<TransferData>>) {
            const { belong, balance, tradeValue, address } = action.payload

            if (belong) {
                state.transferValue.belong = belong
            }

            if (balance !== undefined) {
                state.transferValue.balance = balance
            }

            if (tradeValue !== undefined) {
                state.transferValue.tradeValue = tradeValue
            }

            if (address !== undefined) {
                state.transferValue.address = address
            }
        },
        updateDepositData(state, action: PayloadAction<Partial<DepositData>>) {
            const { belong, balance, tradeValue } = action.payload

            if (belong) {
                state.depositValue.belong = belong
            }

            if (balance !== undefined) {
                state.depositValue.balance = balance
            }

            if (tradeValue !== undefined) {
                state.depositValue.tradeValue = tradeValue
            }

        },
    },
})

export { modalDataSlice }
export const { updateWithdrawData, updateTransferData, updateDepositData, resetAll, } = modalDataSlice.actions
