import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WalletInfo } from './interface'
import { clearAll, updateWallet, } from './reducer'

export const useWalletInfo = () => {
    
    const walletInfo: WalletInfo = useSelector((state: any) => state.walletTypeMap)
    const dispatch = useDispatch()

    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const updateDepositHashWrapper = React.useCallback(({ wallet, isHWAddr, }: { wallet: string, isHWAddr: boolean, }) => {
        dispatch(updateWallet({wallet, isHWAddr}))
    },  [dispatch])

    return {
        walletInfo,
        clearAllWrapper,
        updateDepositHashWrapper,
    }

}
