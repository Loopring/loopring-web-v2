import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearAll, clearDepositHash, OnchainHashInfo, updateDepositHash } from './reducer'

export const useOnchainInfo = ():  {
    onchainInfo: OnchainHashInfo,
    clearAllWrapper: () => void,
    clearDepositHashWrapper: () => void,
    updateDepositHashWrapper:(depositHash: string) => void,
} => {
    const onchainInfo: OnchainHashInfo = useSelector((state: any) => state.favoriteMarket)
    const dispatch = useDispatch()

    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const clearDepositHashWrapper = React.useCallback(() => {
        dispatch(clearDepositHash(undefined))
    }, [dispatch])

    const updateDepositHashWrapper = React.useCallback((depositHash: string) => {
        dispatch(updateDepositHash(depositHash))
    }, [dispatch])

    return {
        onchainInfo,
        clearAllWrapper,
        clearDepositHashWrapper,
        updateDepositHashWrapper,
    }
}
