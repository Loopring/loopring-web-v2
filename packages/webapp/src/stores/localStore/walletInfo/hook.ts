import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'stores'
import { WalletInfo } from './interface'
import { clearAll, updateWallet, } from './reducer'

export const useWalletInfo = () => {
    
    const walletInfo: WalletInfo = useSelector((state: RootState) => state.localStore.walletInfo)
    const dispatch = useDispatch()

    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const updateDepositHashWrapper = React.useCallback(({ wallet, isHWAddr, }: { wallet: string, isHWAddr: boolean, }) => {
        dispatch(updateWallet({wallet, isHWAddr}))
    },  [dispatch])

    const checkHWAddr = React.useCallback((address: string) => {
        if (!address) {
            return false
        }
        const wInfo = walletInfo.walletTypeMap[address]
        return !!wInfo
    }, [walletInfo])

    return {
        checkHWAddr,
        walletInfo,
        clearAllWrapper,
        updateDepositHashWrapper,
    }

}
