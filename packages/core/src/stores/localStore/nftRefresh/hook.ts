import { useDispatch, useSelector } from 'react-redux'
import { NFTHashInfo, NFTHashInfos } from '@loopring-web/common-resources'
import { clearNFTRefreshHash, updateNFTRefreshHash } from './reducer'

export const useNFTRefresh = (): {
  nftDataHashes: NFTHashInfo
  clearNFTRefreshHash: (nftData: string) => void
  updateNFTRefreshHash: (nftData: string) => void
} => {
  const { chainId } = useSelector((state: any) => state.system)

  const nftDataHashes: NFTHashInfos = useSelector((state: any) => state.localStore.nftHashInfos)

  const dispatch = useDispatch()

  return {
    nftDataHashes: nftDataHashes[chainId],
    clearNFTRefreshHash: (nftData: string) => {
      dispatch(clearNFTRefreshHash({ chainId, nftData }))
    },
    updateNFTRefreshHash: (nftData: string) => {
      dispatch(updateNFTRefreshHash({ chainId, nftData }))
    },
  }
}
