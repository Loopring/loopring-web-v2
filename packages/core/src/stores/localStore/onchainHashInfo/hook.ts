import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AccountHashInfo, ChainHashInfos, SagaStatus, TxInfo } from '@loopring-web/common-resources'
import {
  clearAll,
  clearDepositHash,
  updateDepositHash,
  updateHadUnknownCollection,
} from './reducer'
import { updateWalletLayer1 } from '../../walletLayer1/reducer'
import { updateWalletLayer2 } from '../../walletLayer2/reducer'
import { WalletLayer1States } from '../../walletLayer1'

export const useOnChainInfo = (): {
  chainInfos: AccountHashInfo
  clearAllWrapper: () => void
  clearDepositHash: (accountAddress?: string) => void
  updateDepositHash: (
    depositHash: string,
    accountAddress: string,
    status?: 'success' | 'failed',
    args?: { [key: string]: any },
  ) => void
  updateHadUnknownCollection: (props: { accountAddress: string }) => void
} => {
  const { chainId } = useSelector((state: any) => state.system)

  const chainInfos: ChainHashInfos = useSelector((state: any) => state.localStore.chainHashInfos)

  const walletLayer1: WalletLayer1States = useSelector((state: any) => state.walletLayer1)

  const dispatch = useDispatch()

  const clearAllWrapper = React.useCallback(() => {
    dispatch(clearAll(undefined))
  }, [dispatch])

  const _clearDepositHash = React.useCallback(
    (accountAddress?: string) => {
      dispatch(clearDepositHash({ chainId, accountAddress }))
    },
    [dispatch, chainId],
  )

  const _updateDepositHash = React.useCallback(
    (
      depositHash: string,
      accountAddress: string,
      status?: 'success' | 'failed',
      args?: { [key: string]: any },
    ) => {
      // accountAddress
      const props: { txInfo: TxInfo; accountAddress: string } = {
        txInfo: {
          hash: depositHash,
          status,
          ...args,
          // reason:'activeAccount'|'regular'|'reset'
        },
        accountAddress,
      }
      if (
        status === 'success' &&
        walletLayer1.status !== SagaStatus.PENDING
        // && chainInfos.depositHashes[ accountAddress ].find(ele => ele.hash === depositHash && ele.status == 'pending')
      ) {
        dispatch(updateWalletLayer1(undefined))
        dispatch(updateWalletLayer2(undefined))
      }
      dispatch(updateDepositHash({ ...props, chainId }))
    },
    [dispatch, walletLayer1.status],
  )

  return {
    chainInfos: chainInfos[chainId],
    clearAllWrapper,
    clearDepositHash: _clearDepositHash,
    updateDepositHash: _updateDepositHash,
    updateHadUnknownCollection: React.useCallback(
      (props: { accountAddress: string }) => {
        dispatch(updateHadUnknownCollection({ ...props, chainId }))
      },
      [dispatch, walletLayer1.status],
    ),
  }
}
