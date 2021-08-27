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
            myLog('enter!!! updateWallet!!!')
            const walletInfo = action.payload
            //state.walletTypeMap[walletInfo.address] = walletInfo.isHW 
            let newItem = {}
            newItem[walletInfo.address] = walletInfo.isHW
            Object.assign(state.walletTypeMap, {...state.walletTypeMap, ...newItem})
            myLog('state.walletTypeMap:', state.walletTypeMap)
        },
    },
})

export { walletInfoSlice }
export const {clearAll, updateWallet, } = walletInfoSlice.actions
