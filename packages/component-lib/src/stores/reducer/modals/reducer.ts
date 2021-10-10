import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalState, ModalStatePlayLoad, Transaction } from './interface';

const initialState: ModalState = {
    isShowTransfer: {isShow: false,symbol:undefined},
    isShowWithdraw: {isShow: false,symbol:undefined},
    isShowDeposit: {isShow: false,symbol:undefined},
    isShowResetAccount: {isShow: false},
    isShowExportAccount: {isShow: false},
    isShowSwap: {isShow: false},
    isShowAmm: {isShow: false},
    isShowConnect: {isShow: false, step: 0},
    isShowAccount: {isShow: false, step: 0},
    isShowSupport: {isShow: false},
    isShowFeeSetting : {isShow: false}
}

export const modalsSlice: Slice<ModalState> = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setShowSupport(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowSupport.isShow = isShow;

        },
        setShowAmm(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowAmm.isShow = isShow;

        },
        setShowSwap(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowSwap.isShow = isShow;

        },
        setShowTransfer(state, action: PayloadAction<ModalStatePlayLoad & Transaction>) {
            const {isShow,symbol} = action.payload;
            state.isShowTransfer= {
                isShow,
                symbol,
            };
        },
        setShowWithdraw(state, action: PayloadAction<ModalStatePlayLoad & Transaction>) {
            const {isShow,symbol} = action.payload;
            state.isShowWithdraw = {
                isShow,
                symbol,
            };
        },
        setShowDeposit(state, action: PayloadAction<ModalStatePlayLoad & Transaction>) {
            const {isShow,symbol} = action.payload;
            state.isShowDeposit = {
                isShow,
                symbol,
            };
        },
        setShowResetAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowResetAccount.isShow = isShow;

        },
        setShowExportAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowExportAccount.isShow = isShow;
        },
        setShowConnect(state, action: PayloadAction<{ isShow: boolean, step?: number }>) {
            const {isShow, step} = action.payload;
            state.isShowConnect = {
                isShow,
                step: step ? step : 0
            };
        },
        setShowAccount(state, action: PayloadAction<{ isShow: boolean, step?: number }>) {
            const {isShow, step} = action.payload;
            state.isShowAccount = {
                isShow,
                step: step ? step : 0
            };
        },
        setShowFeeSetting(state, action: PayloadAction<{ isShow: boolean }>) {
            const {isShow} = action.payload;
            state.isShowFeeSetting = {
                isShow,
            };
        }
    },
})
export const {
    setShowTransfer,
    setShowWithdraw,
    setShowDeposit,
    setShowResetAccount,
    setShowExportAccount,
    setShowSwap,
    setShowAmm,
    setShowConnect,
    setShowAccount,
    setShowSupport,
    setShowFeeSetting,
} = modalsSlice.actions
// export const { setTheme,setPlatform,setLanguage } = settingsSlice.actions
