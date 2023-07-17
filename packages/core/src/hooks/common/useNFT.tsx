import * as sdk from '@loopring-web/loopring-sdk'
import {
  IPFS_LOOPRING_SITE,
  LOOPRING_NFT_METADATA,
  LOOPRING_TAKE_NFT_META_KET,
  myLog,
  NFTWholeINFO,
} from '@loopring-web/common-resources'
import { LoopringAPI } from '../../api_wrapper'
import { BigNumber } from 'bignumber.js'
import { connectProvides } from '@loopring-web/web3-provider'
import Web3 from 'web3'
import React from 'react'
import { getIPFSString } from '../../utils'
import { useSystem } from '../../stores'
import { getMediaType } from '@loopring-web/component-lib'

export const useNFTListDeep = <T extends Partial<NFTWholeINFO>>() => {
  const { baseURL } = useSystem()

  const getMetaFromContractORIpfs = ({
    tokenAddress,
    nftId,
    isCounterFactualNFT,
    deploymentStatus,
    metadata,
  }: sdk.UserNFTBalanceInfo): Promise<LOOPRING_NFT_METADATA | {}> => {
    if (!!metadata?.imageSize?.original) {
      return Promise.resolve({})
    } else if (
      LoopringAPI.nftAPI &&
      tokenAddress &&
      (!metadata?.uri ||
        tokenAddress.toLowerCase() ===
          '0x1cACC96e5F01e2849E6036F25531A9A064D2FB5f'.toLowerCase()) &&
      nftId &&
      (!isCounterFactualNFT ||
        (isCounterFactualNFT && deploymentStatus !== sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED))
    ) {
      const _id = new BigNumber(nftId ?? '', 16)
      myLog('nftId', _id, _id.toString())
      return LoopringAPI?.nftAPI
        ?.getContractNFTMeta({
          _id: _id.toString(),
          // @ts-ignore
          nftId,
          web3: connectProvides.usedWeb3 as unknown as Web3,
          tokenAddress,
        })
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code) {
            console.log('Contract NFTMeta error:', response)
            return {}
          } else {
            return Reflect.ownKeys(LOOPRING_TAKE_NFT_META_KET).reduce((prev, key) => {
              return { ...prev, [key]: response[key] }
            }, {} as LOOPRING_NFT_METADATA)
          }
        })
        .catch((_error) => {
          return {}
        })
    } else {
      try {
        const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(nftId ?? '')
        const uri = IPFS_LOOPRING_SITE + cid
        return fetch(uri)
          .then((response) => response.json())
          .catch((_error) => {
            return {}
          })
      } catch (e) {
        return Promise.resolve({})
      }
    }
  }
  const nftListReduce = (items: sdk.UserNFTBalanceInfo[]) => {
    return items.map((item) => {
      return {
        ...item,
        nftIdView: new BigNumber(item?.nftId ?? '0', 16).toString(),
        image: item.metadata?.uri,
        ...item.metadata?.base,
        ...item.metadata?.extra,
      }
    }) as any
  }

  const infoDetail = React.useCallback(async (item: Partial<NFTWholeINFO>) => {
    const nftData: sdk.NftData = item.nftData as sdk.NftData
    let [nftMap] = await Promise.all([
      LoopringAPI.nftAPI?.getInfoForNFTTokens({
        nftDatas: [nftData],
      }),
    ])
    const nftToken: Partial<sdk.NFTTokenInfo> =
      nftMap && nftMap[nftData as sdk.NftData] ? nftMap[nftData as sdk.NftData] : {}
    let tokenInfo: NFTWholeINFO = {
      ...item,
      ...item.metadata?.base,
      ...item.metadata?.extra,
      pendingOnSync:
        item.metadata?.base && Object.keys(item.metadata?.base)?.length > 0 ? false : true,
      ...nftToken,
    } as NFTWholeINFO
    tokenInfo = {
      ...tokenInfo,
      nftIdView: new BigNumber(tokenInfo.nftId ?? '0', 16).toString(),
      nftBalance: tokenInfo.total ? Number(tokenInfo.total) - Number(tokenInfo.locked ?? 0) : 0,
    }
    if (!tokenInfo.name) {
      const meta = (await getMetaFromContractORIpfs(tokenInfo)) as LOOPRING_NFT_METADATA
      let metadata_tokenId: number | undefined = undefined
      if (meta.hasOwnProperty('tokenId')) {
        metadata_tokenId = meta['tokenId']
        delete meta['tokenId']
      }

      if (meta && meta !== {} && (meta.name || meta.image)) {
        tokenInfo = Object.assign(metadata_tokenId !== undefined ? { metadata_tokenId } : {}, {
          ...tokenInfo,
          ...(meta as any),
          animationUrl: (meta as any)?.animation_url,
          royaltyPercentage: (meta as any)?.royalty_percentage,
          isFailedLoadMeta: false,
        })
      } else {
        tokenInfo = {
          ...tokenInfo,
          isFailedLoadMeta: true,
        }
      }
    } else {
      tokenInfo = {
        ...tokenInfo,
        isFailedLoadMeta: false,
      }
    }
    if (
      tokenInfo.hasOwnProperty('animationUrl') &&
      tokenInfo.animationUrl &&
      tokenInfo?.animationUrl !== ''
    ) {
      try {
        const req = await fetch(getIPFSString(tokenInfo?.animationUrl, baseURL), {
          method: 'HEAD',
        })
        tokenInfo.__mediaType__ = getMediaType(req?.headers?.get('content-type') ?? '')
      } catch (error) {
        console.log('nft animationUrl', error)
      }

      // myLog("animationUrl", "content-type", req.headers.get("content-type"));
    }

    return tokenInfo
  }, [])

  const renderNFTPromise = React.useCallback(async ({ nftLists }: { nftLists: T[] }) => {
    let mediaPromise: any[] = []
    for (const nftBalanceItem of nftLists) {
      mediaPromise.push(infoDetail(nftBalanceItem))
    }
    return Promise.all(mediaPromise)
  }, [])

  return { renderNFTPromise, infoDetail, nftListReduce }
}
