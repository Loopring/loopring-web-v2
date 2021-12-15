import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { DepositData, LAST_STEP, ModalDataStatus, TransferData, WithdrawData, } from './interface'
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk';
import { NFTWholeINFO } from '@loopring-web/common-resources';

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
    lastStep: LAST_STEP.default,
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
            state.lastStep = LAST_STEP.default;
            state.withdrawValue = initialWithdrawState
        },
        resetTransferData(state) {
            state.lastStep = LAST_STEP.default;
            state.transferValue = initialTransferState
        },
        resetDepositData(state) {
            state.lastStep = LAST_STEP.default;
            state.depositValue = initialDepositState
        },
        resetNFTWithdrawData(state) {
            state.lastStep = LAST_STEP.default;
            state.nftWithdrawValue = initialWithdrawState
        },
        resetNFTTransferData(state) {
            state.lastStep = LAST_STEP.default;
            state.nftTransferValue = initialTransferState
        },
        resetNFTDepositData(state) {
            state.lastStep = LAST_STEP.default;
            state.nftDepositValue = initialDepositState
        },
        updateWithdrawData(state, action: PayloadAction<Partial<WithdrawData>>) {
            const { belong, balance, tradeValue, address } = action.payload
            state.lastStep = LAST_STEP.withdraw;
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
            state.lastStep = LAST_STEP.transfer;
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
            state.lastStep = LAST_STEP.nftDeposit;
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
        updateNFTWithdrawData(state, action: PayloadAction<Partial<WithdrawData  & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, address,...rest } = action.payload
            state.lastStep = LAST_STEP.nftWithdraw;
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
        updateNFTTransferData(state, action: PayloadAction<Partial<TransferData  & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, address,...rest } = action.payload
            state.lastStep = LAST_STEP.nftTransfer;

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
        updateNFTDepositData(state, action: PayloadAction<Partial<DepositData  & UserNFTBalanceInfo & NFTWholeINFO>>) {
            const { belong, balance, tradeValue, reffer, ...rest} = action.payload
            state.lastStep = LAST_STEP.nftDeposit;
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
