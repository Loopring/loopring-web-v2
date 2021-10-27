import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalDataStatus, WithdrawData, TransferData, DepositData, } from './interface'
import { NFTTokenInfo, NFTWholeINFO } from '../../../api_wrapper';
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk/dist/defs/loopring_defs';

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
    nftWithdrawValue:initialWithdrawState ,
    nftTransferValue: initialTransferState,
    nftDepositValue: initialDepositState,
}

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
    name: '_router_modalData',
    initialState,
    reducers: {
        resetAll(state) {
            this.resetWithdrawData(state)
            this.resetTransferData(state)
            this.resetDepositData(state)
            this.resetNFTWithdrawData(state)
            this.resetNFTTransferData(state)
            this.resetNFTDepositData(state)
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
        resetNFTWithdrawData(state) {
            state.nftWithdrawValue = initialWithdrawState
        },
        resetNFTTransferData(state) {
            state.nftTransferValue = initialTransferState
        },
        resetNFTDepositData(state) {
            state.nftDepositValue = initialDepositState
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
        updateNFTWithdrawData(state, action: PayloadAction<Partial<WithdrawData & NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, address,...rest } = action.payload

            if (belong) {
                state.nftWithdrawValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.nftWithdrawValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.nftWithdrawValue.tradeValue = tradeValue
            }

            if (address === undefined || address !== '*') {
                state.nftWithdrawValue.address = address
            }
            state.nftWithdrawValue = {
                ...state.nftWithdrawValue,
                ...rest
            }
        },
        updateNFTTransferData(state, action: PayloadAction<Partial<TransferData & NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, address,...rest } = action.payload

            if (belong) {
                state.nftTransferValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.nftTransferValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.nftTransferValue.tradeValue = tradeValue
            }

            if (address === undefined || address !== '*') {
                state.nftTransferValue.address = address
            }
            state.nftTransferValue = {
                ...state.nftTransferValue,
                ...rest
            }
        },
        updateNFTDepositData(state, action: PayloadAction<Partial<DepositData & NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, reffer, ...rest} = action.payload

            if (belong) {
                state.nftDepositValue.belong = belong
            }

            if (balance === undefined || balance >= 0) {
                state.nftDepositValue.balance = balance
            }

            if (tradeValue === undefined || tradeValue >= 0) {
                state.nftDepositValue.tradeValue = tradeValue
            }

            if (reffer === undefined || reffer !== '*') {
                state.nftDepositValue.reffer = reffer
            }
            state.nftDepositValue = {
                ...state.nftDepositValue,
                ...rest
            }

        },
    }
})

export { modalDataSlice }

export const { updateWithdrawData, updateTransferData, updateDepositData,
    updateNFTWithdrawData, updateNFTTransferData, updateNFTDepositData,
    resetNFTWithdrawData, resetNFTTransferData, resetNFTDepositData,
    resetWithdrawData, resetTransferData, resetDepositData, resetAll, } = modalDataSlice.actions
