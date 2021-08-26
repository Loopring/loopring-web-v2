import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WalletInfo } from './interface'
import { clearAll, updateWallet, } from './reducer'

export const useWalletInfo = () => {
    
    const walletInfo: WalletInfo = useSelector((state: any) => state.walletInfo)
    const dispatch = useDispatch()

    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const updateDepositHashWrapper = React.useCallback(({ wallet, isHWAddr, }: { wallet: string, isHWAddr: boolean, }) => {
        dispatch(updateWallet({wallet, isHWAddr}))
    },  [dispatch])

    const checkHWAddr = (address: string, isFirstTime: boolean = true) => {
        const wInfo = walletInfo.walletTypeMap[address]
        return isFirstTime ? !!wInfo : !wInfo
    }

    return {
        checkHWAddr,
        walletInfo,
        clearAllWrapper,
        updateDepositHashWrapper,
    }

}
