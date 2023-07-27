import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { ChainHashInfos, NetworkMap, TxInfo } from '@loopring-web/common-resources'
import { ChainId } from '@loopring-web/loopring-sdk'

const OnChainHashInfoSlice: Slice<ChainHashInfos> = createSlice<
  ChainHashInfos,
  SliceCaseReducers<ChainHashInfos>,
  'chainHashInfos'
>({
  name: 'chainHashInfos',
  initialState: Reflect.ownKeys(NetworkMap).reduce((prev, item) => {
    prev[NetworkMap[item]?.chainId] = { depositHashes: {}, showHadUnknownCollection: {} }
    return prev
  }, {}),
  reducers: {
    // @ts-ignore
    clearAll(state: ChainHashInfos, _action: PayloadAction<undefined>) {
      state = {
        ...Reflect.ownKeys(NetworkMap).reduce((prev, item) => {
          prev[NetworkMap[item]?.chainId] = { depositHashes: {}, showHadUnknownCollection: {} }
          return prev
        }, {}),
      }
    },
    clearDepositHash(
      state: ChainHashInfos,
      action: PayloadAction<{ accountAddress?: string; chainId: ChainId }>,
    ) {
      const { accountAddress, chainId } = action.payload
      if (accountAddress && state[chainId].depositHashes) {
        state[chainId].depositHashes[accountAddress] = []
      } else {
        state[chainId].depositHashes = {}
      }
    },
    clearWithdrawHash(_state: ChainHashInfos) {
      // state[chainId].withdrawHashes = {}
    },
    updateHadUnknownCollection(
      state: ChainHashInfos,
      action: PayloadAction<{
        accountAddress: string
        chainId: ChainId
      }>,
    ) {
      const { accountAddress, chainId } = action.payload
      if (!state[chainId] || !state[chainId].depositHashes) {
        state[chainId] = { ...state[chainId], depositHashes: {}, showHadUnknownCollection: {} }
      }
      if (accountAddress) {
        state[chainId].showHadUnknownCollection = {
          ...state[chainId].showHadUnknownCollection,
          [accountAddress]: true,
        }
      }
    },
    updateDepositHash(
      state: ChainHashInfos,
      action: PayloadAction<{
        txInfo: TxInfo
        accountAddress: string
        chainId: ChainId
      }>,
    ) {
      const { txInfo, accountAddress, chainId } = action.payload
      if (!state[chainId] || !state[chainId].depositHashes) {
        state[chainId] = { ...state[chainId], depositHashes: {}, showHadUnknownCollection: {} }
      }
      if (accountAddress && txInfo) {
        if (!txInfo.status) {
          txInfo.status = 'pending'
          txInfo.timestamp = Date.now()
          state[chainId].depositHashes = {
            [accountAddress]: state[chainId].depositHashes[accountAddress]
              ? [...[txInfo], ...state[chainId].depositHashes[accountAddress]]
              : [txInfo],
          }
        } else if (state[chainId].depositHashes[accountAddress]) {
          const index = state[chainId].depositHashes[accountAddress].findIndex(
            (item) => item.hash === txInfo.hash,
          )
          if (index !== -1) {
            state[chainId].depositHashes[accountAddress][index] = {
              ...state[chainId].depositHashes[accountAddress][index],
              status: txInfo.status,
            }
          }
        }

        if (
          state[chainId].depositHashes[accountAddress] &&
          state[chainId].depositHashes[accountAddress].length > 5
        ) {
          state[chainId].depositHashes[accountAddress].length = 5
        }
      }
    },
  },
})

export { OnChainHashInfoSlice }
export const {
  clearAll,
  clearDepositHash,
  updateDepositHash,
  clearWithdrawHash,
  updateWithdrawHash,
  updateHadUnknownCollection,
} = OnChainHashInfoSlice.actions
