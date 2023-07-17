import { useDispatch, useSelector } from 'react-redux'
import { reset, socketUpdateBalance, statusUnset, updateWalletLayer2NFT } from './reducer'
import { MyNFTFilter } from '@loopring-web/common-resources'
import { WalletLayer2NFTStates } from './interface'
import React from 'react'
import * as loopring_defs from '@loopring-web/loopring-sdk'

export function useWalletLayer2NFT(): WalletLayer2NFTStates & {
  updateWalletLayer2NFT: (props: {
    page?: number
    nftDatas?: string
    collectionId: string | undefined
    collectionContractAddress: string | undefined
    filter?: MyNFTFilter | undefined
  }) => void
  socketUpdateBalance: (balance: { [key: string]: loopring_defs.UserBalanceInfo }) => void
  statusUnset: () => void
  resetLayer2NFT: () => void
} {
  const walletLayer2NFT: WalletLayer2NFTStates = useSelector((state: any) => state.walletLayer2NFT)
  const dispatch = useDispatch()

  return {
    ...walletLayer2NFT,
    resetLayer2NFT: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateWalletLayer2NFT: React.useCallback(
      ({
        page,
        collectionId,
        collectionContractAddress,
        nftDatas,
        filter,
      }: {
        page?: number
        nftDatas?: string
        collectionId: string | undefined
        collectionContractAddress: string | undefined
        filter?: MyNFTFilter | undefined
      }) =>
        dispatch(
          updateWalletLayer2NFT({
            page,
            collectionId,
            collectionContractAddress,
            nftDatas,
            filter,
          }),
        ),
      [dispatch],
    ),
    socketUpdateBalance: React.useCallback(
      (balance: { [key: string]: loopring_defs.UserBalanceInfo }) =>
        dispatch(socketUpdateBalance(balance)),
      [dispatch],
    ),
  }
}
