import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageAmmPool, PageAmmPoolStatus } from './interface'

const initState = {
    ammJoin: undefined,
    ammExit: undefined,
}

const initialState: PageAmmPoolStatus = {
    pageAmmPool: initState,
    __SUBMIT_LOCK_TIMER__: 1000,
    __TOAST_AUTO_CLOSE_TIMER__: 3000,
}

const pageAmmPoolSlice: Slice<PageAmmPoolStatus> = createSlice({
    name: 'pageAmmPool',
    initialState,
    reducers: {
        
        resetAmmPool(state) {
            state.pageAmmPool = initState
        },

        updatePageAmmPool(state, action: PayloadAction<Partial<PageAmmPool>>) {
            const {
            } = action.payload;
        },

    },
})

export { pageAmmPoolSlice }
export const { updatePageAmmPool, resetAmmPool, } = pageAmmPoolSlice.actions;
