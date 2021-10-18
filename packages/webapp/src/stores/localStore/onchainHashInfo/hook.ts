import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChainHashInfos, TxInfo } from'@loopring-web/common-resources';
import { clearAll, clearDepositHash, updateDepositHash } from './reducer'

export const useOnChainInfo = (): {
    chainInfos: ChainHashInfos,
    clearAllWrapper: () => void,
    clearDepositHashWrapper: () => void,
    updateDepositHash: (depositHash: string,accountAddress:string,status?:'success'|'failed') => void,
} => {
    const chainInfos: ChainHashInfos = useSelector((state: any) => state.localStore.chainHashInfos)
    const dispatch = useDispatch()
    
    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const clearDepositHashWrapper = React.useCallback(() => {
        dispatch(clearDepositHash(undefined))
    }, [dispatch])

    const _updateDepositHash = React.useCallback((depositHash: string,accountAddress:string,status?:'success'|'failed') => {
        // accountAddress
        const props:{txInfo: TxInfo,accountAddress:string } = {
            txInfo: {
                hash: depositHash,
                status,
                // reason:'activeAccount'|'regular'|'reset'
            }, accountAddress,
        }
        dispatch(updateDepositHash(props))
    }, [dispatch])

    return {
        chainInfos,
        clearAllWrapper,
        clearDepositHashWrapper,
        updateDepositHash:_updateDepositHash,
    }
}
