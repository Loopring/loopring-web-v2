import { useDispatch, useSelector } from 'react-redux'
import { reset, socketUpdateBalance, statusUnset, updateWalletL2NFTCollection } from './reducer'
import { WalletL2NFTCollectionStates } from './interface'
import React from 'react'
import * as loopring_defs from '@loopring-web/loopring-sdk'
import { CollectionMeta } from '@loopring-web/common-resources'

export function useWalletL2NFTCollection<
  C extends CollectionMeta,
>(): WalletL2NFTCollectionStates<C> & {
  updateWalletL2NFTCollection: (props: { page?: number }) => void
  socketUpdateBalance: (balance: { [key: string]: loopring_defs.UserBalanceInfo }) => void
  statusUnset: () => void
  resetL2NFTCollection: () => void
} {
  const walletL2NFTCollection: WalletL2NFTCollectionStates<C> = useSelector(
    (state: any) => state.walletL2NFTCollection,
  )
  const dispatch = useDispatch()

  return {
    ...walletL2NFTCollection,
    resetL2NFTCollection: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateWalletL2NFTCollection: React.useCallback(
      ({ page }: { page?: number }) => dispatch(updateWalletL2NFTCollection({ page })),
      [dispatch],
    ),
    socketUpdateBalance: React.useCallback(
      (balance: { [key: string]: loopring_defs.UserBalanceInfo }) =>
        dispatch(socketUpdateBalance(balance)),
      [dispatch],
    ),
  }
}
