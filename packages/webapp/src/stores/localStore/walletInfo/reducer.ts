import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { myLog } from 'utils/log_tools'
import { WalletInfo, } from './interface'

const initialState: WalletInfo = {
    walletTypeMap: {},
}

const walletInfoSlice: Slice<WalletInfo> = createSlice<WalletInfo, SliceCaseReducers<WalletInfo>, 'walletInfo'>({
    name: 'walletInfo',
    initialState,
    reducers: {
        clearAll(state: WalletInfo) {
            state = initialState
        },
        updateWallet(state: WalletInfo, action: PayloadAction<{ address: string, isHW: boolean }>) {
            const walletInfo = action.payload
            state.walletTypeMap[walletInfo.address] = walletInfo.isHW
        },
    },
})

export { walletInfoSlice }
export const {clearAll, updateWallet, } = walletInfoSlice.actions
