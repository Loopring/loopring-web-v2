import { useDispatch, useSelector } from 'react-redux'
import {
  reset,
  socketUpdateBalance,
  statusUnset,
  updateLegacyContracts,
  updateWalletL2Collection,
} from './reducer'
import { WalletL2CollectionStates } from './interface'
import React from 'react'
import * as loopring_defs from '@loopring-web/loopring-sdk'
import { CollectionMeta, L2CollectionFilter } from '@loopring-web/common-resources'
import { LoopringAPI } from '../../api_wrapper'
import * as sdk from '@loopring-web/loopring-sdk'
import { store } from '../index'

export function useWalletL2Collection<C extends CollectionMeta>(): WalletL2CollectionStates<C> & {
  updateLegacyContracts: () => void
  updateWalletL2Collection: (props: {
    page?: number
    filter?: L2CollectionFilter | undefined
  }) => void
  socketUpdateBalance: (balance: { [key: string]: loopring_defs.UserBalanceInfo }) => void
  statusUnset: () => void
  resetL2Collection: () => void
} {
  const walletL2Collection: WalletL2CollectionStates<C> = useSelector(
    (state: any) => state.walletL2Collection,
  )

  const dispatch = useDispatch()

  return {
    ...walletL2Collection,
    resetL2Collection: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateLegacyContracts: React.useCallback(async () => {
      const account = store.getState().account
      // const { chainId } = store.getState().system;

      if (account.accountId && LoopringAPI.userAPI) {
        const response = await LoopringAPI.userAPI.getUserNFTLegacyTokenAddress(
          {
            accountId: account.accountId,
          },
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          dispatch(updateLegacyContracts({ legacyContract: [] }))
        }
        dispatch(
          updateLegacyContracts({
            legacyContract: [...response?.raw_data?.addresses],
          }),
        )
      }
    }, [dispatch]),

    updateWalletL2Collection: React.useCallback(
      ({ page, filter }: { page?: number; filter?: L2CollectionFilter | undefined }) =>
        dispatch(updateWalletL2Collection({ page, filter })),
      [dispatch],
    ),
    socketUpdateBalance: React.useCallback(
      (balance: { [key: string]: loopring_defs.UserBalanceInfo }) =>
        dispatch(socketUpdateBalance(balance)),
      [dispatch],
    ),
  }
}
