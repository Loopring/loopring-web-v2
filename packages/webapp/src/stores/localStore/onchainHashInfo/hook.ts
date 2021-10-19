import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChainHashInfos, SagaStatus, TxInfo } from '@loopring-web/common-resources';
import { clearAll, clearDepositHash, updateDepositHash } from './reducer'
import { updateWalletLayer1, WalletLayer1States } from '../../walletLayer1';
import { updateWalletLayer2 } from '../../walletLayer2';

export const useOnChainInfo = (): {
    chainInfos: ChainHashInfos,
    clearAllWrapper: () => void,
    clearDepositHashWrapper: () => void,
    updateDepositHash: (depositHash: string, accountAddress: string, status?: 'success' | 'failed') => void,
} => {
    const chainInfos: ChainHashInfos = useSelector((state: any) => state.localStore.chainHashInfos)
    const walletLayer1: WalletLayer1States = useSelector((state: any) => state.walletLayer1)

    const dispatch = useDispatch()

    const clearAllWrapper = React.useCallback(() => {
        dispatch(clearAll(undefined))
    }, [dispatch])

    const clearDepositHashWrapper = React.useCallback(() => {
        dispatch(clearDepositHash(undefined))
    }, [dispatch])

    const _updateDepositHash = React.useCallback((depositHash: string,accountAddress:string,status?:'success'|'failed') => {
        // accountAddress
        const props: { txInfo: TxInfo, accountAddress: string } = {
            txInfo: {
                hash: depositHash,
                status,
                // reason:'activeAccount'|'regular'|'reset'
            }, accountAddress,
        }
        if (status === 'success'
            && walletLayer1.status !== SagaStatus.PENDING
            // && chainInfos.depositHashes[ accountAddress ].find(ele => ele.hash === depositHash && ele.status == 'pending')
        ) {
            dispatch(updateWalletLayer1(undefined))
            dispatch(updateWalletLayer2(undefined))
        }
        dispatch(updateDepositHash(props))
    }, [dispatch, walletLayer1.status])

    return {
        chainInfos,
        clearAllWrapper,
        clearDepositHashWrapper,
        updateDepositHash:_updateDepositHash,
    }
}
