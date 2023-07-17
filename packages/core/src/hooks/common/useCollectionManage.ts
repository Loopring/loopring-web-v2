import { BigNumber } from 'bignumber.js'
import React from 'react'
import { CollectionMeta, NFTLimit, NFTWholeINFO } from '@loopring-web/common-resources'
import {
  getIPFSString,
  LoopringAPI,
  useAccount,
  useNFTListDeep,
  useSystem,
  useToast,
} from '../../index'
import { CollectionManageProps, CollectionMethod, ToastType } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'

BigNumber.config({ EXPONENTIAL_AT: 100 })

export const useCollectionManage = <Co extends CollectionMeta, NFT extends Partial<NFTWholeINFO>>({
  collection,
  pageSize = NFTLimit,
}: {
  collection?: CollectionMeta | undefined
  pageSize?: number
}): CollectionManageProps<Co, NFT> => {
  const { account } = useAccount()
  const { chainId } = useSystem()
  const { t } = useTranslation()
  const [filter, setFilter] = React.useState({})
  const toastObj = useToast()
  const { renderNFTPromise, nftListReduce } = useNFTListDeep()

  const [selectedNFTS, setSelectedNFTS] = React.useState<NFT[]>([])
  const [{ listNFT, total, page }, setListNFTValue] = React.useState<{
    listNFT: NFT[]
    total: number
    page: number
  }>({
    listNFT: [],
    total: 0,
    page: 1,
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const onFilterNFT = React.useCallback(
    async (props: { legacyFilter?: sdk.LegacyNFT | 'all'; limit?: number; page?: number }) => {
      if (collection && LoopringAPI.userAPI) {
        onNFTSelected('removeAll')
        setFilter(props)
        setIsLoading(true)
        const { legacyFilter = sdk.LegacyNFT.undecided, limit = pageSize, page: _page = 1 } = props
        const response = await LoopringAPI.userAPI.getUserNFTLegacyBalance(
          {
            accountId: account.accountId,
            tokenAddress: collection.contractAddress,
            // @ts-ignore
            collectionId: legacyFilter !== 'all' ? collection?.id : undefined,
            filter: legacyFilter !== 'all' ? legacyFilter : undefined,
            offset: (_page - 1) * limit,
            limit,
            metadata: true,
          },
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        } else {
          setListNFTValue({
            total: response.totalNum,
            page: _page,
            listNFT: nftListReduce(response.userNFTBalances),
          })
          setIsLoading(false)
          renderNFTPromise({ nftLists: response.userNFTBalances as any }).then((meta: any[]) => {
            if (page === _page) {
              setListNFTValue((state) => {
                return {
                  ...state,
                  listNFT: state.listNFT?.map((item, index) => {
                    return {
                      ...item,
                      ...meta[index],
                      tokenAddress: item.tokenAddress?.toLowerCase(),
                      // etherscanBaseUrl,
                    }
                  }),
                }
              })
            }
          })
        }
        setIsLoading(false)
      }
    },
    [collection],
  )
  const { baseURL } = useSystem()
  const onNFTSelected = React.useCallback(
    (_item: NFT | 'addAll' | 'removeAll') => {
      if (_item === 'addAll') {
        setSelectedNFTS(listNFT)
      } else if (_item === 'removeAll') {
        setSelectedNFTS([])
      } else {
        setSelectedNFTS((state) => {
          let has = false
          const previewList = (state ?? []).reduce((prev, item) => {
            if (_item.nftData === item.nftData) {
              has = true
              return prev
            } else {
              return [...prev, item]
            }
          }, [] as NFT[])
          return has ? previewList : [_item, ...selectedNFTS]
        })
      }
    },
    [selectedNFTS, listNFT],
  )
  const onNFTSelectedMethod = React.useCallback(
    async (items: NFT[], method: CollectionMethod) => {
      let hashList: string[] = []
      if (collection && items.length && collection?.id) {
        let collectionId: number = 0
        hashList = items.reduce((prev, item) => {
          return [...prev, item.nftData ?? '']
        }, [] as string[])
        setIsLoading(true)
        switch (method) {
          case CollectionMethod.moveOut:
            collectionId = 0
            break
          case CollectionMethod.moveIn:
            collectionId = Number(collection?.id)
            break
          default:
            break
        }
        const response = await LoopringAPI.userAPI?.submitUpdateNFTLegacyCollection(
          {
            accountId: account.accountId,
            nftHashes: hashList,
            collectionId,
          },
          chainId as any,
          account.apiKey,
          account.eddsaKey.sk,
        )
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          toastObj.setToastOpen({
            open: true,
            type: ToastType.error,
            content: t('labelNFTMoveFailed'),
          })
        } else {
          toastObj.setToastOpen({
            open: true,
            type: ToastType.success,
            content: t('labelNFTMoveSuccess'),
          })
        }
        onFilterNFT({ ...filter })
      }
    },
    [filter],
  )
  React.useEffect(() => {
    if (collection?.id && account.accountId) {
      onNFTSelected('removeAll')
      onFilterNFT({})
    }
  }, [collection?.id])
  return {
    collection: (collection ?? {}) as Partial<Co>,
    selectedNFTS,
    onNFTSelected,
    total,
    toastObj,
    page,
    listNFT,
    baseURL,
    getIPFSString,
    onNFTSelectedMethod,
    onFilterNFT,
    isLoading,
    filter,
  }
}
