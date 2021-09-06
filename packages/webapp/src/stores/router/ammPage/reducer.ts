import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageAmmJoin, PageAmmExit, PageAmmPoolStatus } from './interface'

const initJoinState: PageAmmJoin = {
}

const initExitState: PageAmmExit = {
}

const initialState: PageAmmPoolStatus = {
    ammJoin: initJoinState,
    ammExit: initExitState,
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
        },

        updatePageAmmJoin(state, action: PayloadAction<Partial<PageAmmJoin>>) {
            const {
            } = action.payload;
        },

        updatePageAmmExit(state, action: PayloadAction<Partial<PageAmmExit>>) {
            const {
            } = action.payload;
        },

    },
})

export { pageAmmPoolSlice }
export const { updatePageAmmJoin, updatePageAmmExit, resetAmmPool, } = pageAmmPoolSlice.actions;
