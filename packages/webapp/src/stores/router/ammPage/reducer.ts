import { TradeBtnStatus } from '@loopring-web/component-lib'
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageAmmCommon } from '.'
import { PageAmmJoin, PageAmmExit, PageAmmPoolStatus } from './interface'

const initJoinState: PageAmmJoin = {
    fees: {},
    fee: 0,
    request: undefined,
    btnI18nKey: undefined,
    btnStatus: TradeBtnStatus.AVAILABLE,
}

const initExitState: PageAmmExit = {
    volA_show: undefined,
    volB_show: undefined, 
    fees: {},
    fee: 0,
    request: undefined,
    btnI18nKey: undefined,
    btnStatus: TradeBtnStatus.AVAILABLE,
}

const initCommonState: PageAmmCommon = {
    ammInfo: undefined,
    ammPoolSnapshot: undefined,
}

const initialState: PageAmmPoolStatus = {
    ammJoin: initJoinState,
    ammExit: initExitState,
    common: initCommonState,
    __SUBMIT_LOCK_TIMER__: 1000,
    __TOAST_AUTO_CLOSE_TIMER__: 3000,
}

const pageAmmPoolSlice: Slice<PageAmmPoolStatus> = createSlice({
    name: '_router_pageAmmPool',
    initialState,
    reducers: {
        
        resetAmmPool(state) {
            state.ammJoin = initJoinState
            state.ammExit = initExitState
            state.common = initCommonState
        },

        updatePageAmmCommon(state, action: PayloadAction<Partial<PageAmmCommon>>) {

            const {
                ammInfo,
                ammPoolSnapshot,
            } = action.payload;

            if (ammInfo) {
                state.common.ammInfo = ammInfo
            }

            if (ammPoolSnapshot) {
                state.common.ammPoolSnapshot = ammPoolSnapshot
            }

        },

        updatePageAmmJoin(state, action: PayloadAction<Partial<PageAmmJoin>>) {
            const {
                fee,
                fees,
                request,
                btnI18nKey,
                btnStatus,
            } = action.payload;

            if (fee) {
                state.ammJoin.fee = fee
            }

            if (fees) {
                state.ammJoin.fees = fees
            }

            if (request) {
                state.ammJoin.request = request
            }

            if (btnI18nKey) {
                state.ammJoin.btnI18nKey = btnI18nKey
            }

            if (btnStatus) {
                state.ammJoin.btnStatus = btnStatus
            }

        },

        updatePageAmmExit(state, action: PayloadAction<Partial<PageAmmExit>>) {
            const {
                fee,
                fees,
                request,
                volA_show,
                volB_show,
            } = action.payload;

            if (fee) {
                state.ammExit.fee = fee
            }

            if (fees) {
                state.ammExit.fees = fees
            }

            if (request) {
                state.ammExit.request = request
            }

            if (volA_show) {
                state.ammExit.volA_show = volA_show
            }

            if (volB_show) {
                state.ammExit.volB_show = volB_show
            }
        },

    },
})

export { pageAmmPoolSlice }
export const { updatePageAmmJoin, updatePageAmmExit, updatePageAmmCommon, resetAmmPool, } = pageAmmPoolSlice.actions;
