import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { NFTHashInfos, TxInfo } from '@loopring-web/common-resources'
import { ChainId } from '@loopring-web/loopring-sdk'

const initialState: NFTHashInfos = {
  [ChainId.GOERLI]: { nftDataHashes: {} },
  [ChainId.MAINNET]: { nftDataHashes: {} },
  [ChainId.SEPOLIA]: { nftDataHashes: {} },
  [ChainId.TAIKOHEKLA]: { nftDataHashes: {} },
  // withdrawHashes:{},
}

const NFTHashInfoSlice: Slice<NFTHashInfos> = createSlice<
  NFTHashInfos,
  SliceCaseReducers<NFTHashInfos>,
  'nftHashInfos'
>({
  name: 'nftHashInfos',
  initialState,
  reducers: {
    // @ts-ignore
    clearAll(state: NFTHashInfos, _action: PayloadAction<undefined>) {
      state = { ...initialState }
    },
    clearNFTRefreshHash(
      state: NFTHashInfos,
      action: PayloadAction<{ nftData: string; chainId: ChainId }>,
    ) {
      const { nftData, chainId } = action.payload
      if (nftData && state[chainId].nftDataHashes[nftData]) {
        delete state[chainId].nftDataHashes[nftData]
      } else {
        state[chainId].nftDataHashes = {}
      }
    },
    updateNFTRefreshHash(
      state: NFTHashInfos,
      action: PayloadAction<{
        nftData: string
        chainId: ChainId
      }>,
    ) {
      const { nftData, chainId } = action.payload
      if (!state[chainId] || !state[chainId].nftDataHashes) {
        state[chainId] = { ...state[chainId], nftDataHashes: {} }
      }
      if (state[chainId].nftDataHashes[nftData.toLowerCase()]) {
        const _timestamp = Date.now()
        const _txInfo: Required<TxInfo> = state[chainId].nftDataHashes[nftData.toLowerCase()]
        if (_timestamp >= _txInfo.timestamp + 30 * 60 * 1000) {
          delete state[chainId].nftDataHashes[nftData.toLowerCase()]
        }
      } else {
        const txInfo: Required<TxInfo> = {
          status: 'pending',
          timestamp: Date.now(),
          hash: nftData,
        }

        state[chainId].nftDataHashes = {
          ...state[chainId].nftDataHashes,
          [nftData.toLowerCase()]: txInfo,
        }
      }
    },
  },
})

export { NFTHashInfoSlice }
export const { clearAll, clearNFTRefreshHash, updateNFTRefreshHash } = NFTHashInfoSlice.actions
