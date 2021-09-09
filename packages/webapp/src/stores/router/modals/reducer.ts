import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalDataStatus, WithdrawData, TransferData, DepositData, } from './interface'

const initialWithdrawState: WithdrawData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
    address: undefined,
}

const initialTransferState: TransferData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
    address: undefined,
    memo: undefined,
}

const initialDepositState: DepositData = {
    belong: undefined,
    tradeValue: 0,
    balance: 0,
    reffer: undefined,
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
            const { belong, balance, tradeValue, address } = action.payload

            if (belong) {
                state.withdrawValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.withdrawValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.withdrawValue.tradeValue = tradeValue
            }

            if (address === undefined || address !== '*') {
                state.withdrawValue.address = address
            }
        },
        updateTransferData(state, action: PayloadAction<Partial<TransferData>>) {
            const { belong, balance, tradeValue, address } = action.payload

            if (belong) {
                state.transferValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.transferValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.transferValue.tradeValue = tradeValue
            }

            if (address === undefined || address !== '*') {
                state.transferValue.address = address
            }
        },
        updateDepositData(state, action: PayloadAction<Partial<DepositData>>) {
            const { belong, balance, tradeValue, reffer, } = action.payload

            if (belong) {
                state.depositValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.depositValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.depositValue.tradeValue = tradeValue
            }

            if (reffer === undefined || reffer !== '*') {
                state.depositValue.reffer = reffer
            }

        },
    }
})

export { modalDataSlice }

export const { updateWithdrawData, updateTransferData, updateDepositData,
    resetWithdrawData, resetTransferData, resetDepositData, resetAll, } = modalDataSlice.actions
