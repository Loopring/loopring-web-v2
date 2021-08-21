import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ModalState, ModalStatePlayLoad } from './interface';

const initialState: ModalState = {
    isShowTransfer: {isShow: false},
    isShowWithdraw: {isShow: false},
    isShowDeposit: {isShow: false},
    isShowResetAccount: {isShow: false},
    isShowSwap: {isShow: false},
    isShowAmm: {isShow: false},
    isShowConnect: {isShow: false, step: 0},
    isShowAccount: {isShow: false, step: 0},
}

export const modalsSlice: Slice<ModalState> = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setShowAmm(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowAmm.isShow = isShow;

        },
        setShowSwap(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowSwap.isShow = isShow;

        },
        setShowTransfer(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowTransfer.isShow = isShow;

        },
        setShowWithdraw(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowWithdraw.isShow = isShow;

        },
        setShowDeposit(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowDeposit.isShow = isShow;

        },
        setShowResetAccount(state, action: PayloadAction<ModalStatePlayLoad>) {
            const {isShow} = action.payload;
            state.isShowResetAccount.isShow = isShow;

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
        }
    },
})
export const {
    setShowTransfer,
    setShowWithdraw,
    setShowDeposit,
    setShowResetAccount,
    setShowSwap,
    setShowAmm,
    setShowConnect,
    setShowAccount
} = modalsSlice.actions
// export const { setTheme,setPlatform,setLanguage } = settingsSlice.actions
