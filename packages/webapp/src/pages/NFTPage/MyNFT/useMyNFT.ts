import {
  CollectionLimit,
  CollectionMeta,
  CustomError,
  ErrorMap,
  myLog,
  MyNFTFilter,
  NFTWholeINFO,
  SagaStatus,
} from '@loopring-web/common-resources'
import React from 'react'
import {
  LoopringAPI,
  store,
  useAccount,
  useModalData,
  useNFTListDeep,
  useSystem,
  useWalletL2NFTCollection,
  useWalletLayer2NFT,
} from '@loopring-web/core'
import { useOpenModals } from '@loopring-web/component-lib'
import { BigNumber } from 'bignumber.js'
import * as sdk from '@loopring-web/loopring-sdk'
import { useHistory, useLocation } from 'react-router-dom'

BigNumber.config({ EXPONENTIAL_AT: 100 })
export const useMyNFT = ({
  collectionMeta,
  collectionPage,
  myNFTPage,
}: {
  collectionMeta: CollectionMeta | undefined
  collectionPage?: number
  myNFTPage?: number
}) => {
  const { search, ...rest } = useLocation()
  const { renderNFTPromise, infoDetail, nftListReduce } = useNFTListDeep()
  const history = useHistory()
  const [filter, setFilter] = React.useState<MyNFTFilter | undefined>(undefined)
  const searchParams = new URLSearchParams(search)
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { account } = useAccount()
  const {
    status: walletLayer2NFTStatus,
    walletLayer2NFT,
    total,
    page: page_redux,
    collection: collection_redux,
    updateWalletLayer2NFT,
  } = useWalletLayer2NFT()
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } = useModalData()

  const {
    setShowNFTDetail,
    modals: { isShowNFTDetail },
  } = useOpenModals()
  const { etherscanBaseUrl } = useSystem()
  const [page, setPage] = React.useState(-1)

  // const onDetailClose = React.useCallback(() => setIsShow(false), []);

  const onPageChange = (page: number = 1, filter?: MyNFTFilter | undefined) => {
    setFilter(filter ?? undefined)
    setPage(page)
    setIsLoading(true)
    if (page !== -1) {
      updateWalletLayer2NFT({
        page,
        collectionId: collectionMeta?.id?.toString() ?? undefined,
        collectionContractAddress: collectionMeta?.contractAddress.toString()
          ? collectionMeta?.contractAddress.toString()
          : collectionMeta?.collectionAddress?.toString() ?? undefined,
        filter,
      })
    }
    searchParams.set('myNFTPage', page.toString())
    if (filter) {
      searchParams.set('filter', JSON.stringify(filter))
    }
    history.replace({ ...rest, search: searchParams.toString() })
  }

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      let _collectionMeta = item.collectionInfo ?? collectionMeta
      if (
        item.hasOwnProperty('pendingOnSync') &&
        !item.collectionInfo &&
        collectionMeta === undefined &&
        LoopringAPI.userAPI
      ) {
        const response = await LoopringAPI.userAPI
          .getUserNFTCollection(
            {
              accountId: account.accountId.toString(),
              //@ts-ignore
              tokenAddress: item.tokenAddress,
            },
            account.apiKey,
          )
          .catch((_error) => {
            throw new CustomError(ErrorMap.TIME_OUT)
          })
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          throw new CustomError(ErrorMap.ERROR_UNKNOWN)
        }
        _collectionMeta = response.collections?.find((_item: CollectionMeta) => {
          return (
            _item?.contractAddress?.toLowerCase() === item?.tokenAddress?.toLowerCase() &&
            _item.baseUri !== ''
          )
        })
      }
      window.scrollTo(0, 0)
      setShowNFTDetail({
        isShow: true,
        ...item,
        collectionInfo: _collectionMeta,
      })
      updateNFTWithdrawData({ ...item, collectionInfo: _collectionMeta })
      updateNFTTransferData({ ...item, collectionInfo: _collectionMeta })
      if (
        item.isCounterFactualNFT &&
        item.deploymentStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED
      ) {
        await LoopringAPI.userAPI?.getAvailableBroker({ type: 0 }).then(({ broker }) => {
          updateNFTDeployData({ broker })
        })
        updateNFTDeployData({ ...item, collectionInfo: _collectionMeta })
      }
    },
    [
      collectionMeta,
      setShowNFTDetail,
      updateNFTDeployData,
      updateNFTTransferData,
      updateNFTWithdrawData,
    ],
  )

  const onNFTReload = async (item: Partial<NFTWholeINFO>, index?: number) => {
    const tokenInfo = await infoDetail(item)
    let _index = index

    setNFTList((state) => {
      if (index === undefined) {
        _index = state.findIndex(
          (_item) =>
            _item.tokenAddress?.toLowerCase() === item.tokenAddress?.toLowerCase() &&
            _item.nftId === item.nftId,
        )
      }
      if (_index) {
        state[_index] = {
          ...state[_index],
          isFailedLoadMeta: false,
          ...tokenInfo,
        }
      }
      return state
    })
  }

  const renderNFT = React.useCallback(async () => {
    setNFTList(nftListReduce(walletLayer2NFT))
    setIsLoading(false)
    renderNFTPromise({ nftLists: walletLayer2NFT as any }).then((meta: any[]) => {
      const {
        walletLayer2NFT,
        page: page_reudex,
        filter: filter_redux,
      } = store.getState().walletLayer2NFT
      myLog('walletLayer2NFT  async media render', page, page_reudex)
      if (
        page === page_reudex &&
        (!filter ||
          (filter &&
            filter?.favourite == filter_redux?.favourite &&
            filter?.hidden == filter_redux?.hidden))
      ) {
        setNFTList((state) => {
          return walletLayer2NFT.map((item, index) => {
            return {
              ...state[index],
              ...meta[index],
              tokenAddress: item.tokenAddress?.toLowerCase(),
              etherscanBaseUrl,
            }
          })
        })
      }
    })
  }, [etherscanBaseUrl, page, walletLayer2NFT, filter])

  React.useEffect(() => {
    if (
      walletLayer2NFTStatus === SagaStatus.UNSET &&
      Number(page_redux) === Number(page) &&
      ((collectionMeta === undefined && collection_redux === undefined) ||
        (collection_redux?.id == collectionMeta?.id &&
          collection_redux?.contractAddress == collectionMeta?.contractAddress))
    ) {
      renderNFT()
    }
  }, [walletLayer2NFTStatus, page, collectionMeta, page_redux, collection_redux])

  return {
    collectionMeta,
    nftList,
    onDetail,
    etherscanBaseUrl,
    onNFTReload,
    onPageChange,
    total,
    page,
    isLoading,
    walletLayer2NFT,
  }
}

export const useNFTCollection = ({
  contractStr,
  matchPreUrl,
}: {
  contractStr: string
  matchPreUrl: string
}) => {
  const history = useHistory()
  const { search } = useLocation()

  const searchParams = new URLSearchParams(search)
  const { walletL2NFTCollection } = useWalletL2NFTCollection()
  const {
    account: { accountId, apiKey },
  } = useAccount()

  const [collectionMeta, setCollectionMeta] = React.useState<undefined | CollectionMeta>(undefined)
  const checkCollection = async () => {
    const [contract, id] = contractStr ? contractStr.split('--') : [null, null]
    if (contract !== undefined && id !== undefined && LoopringAPI.userAPI) {
      const collectionMeta = walletL2NFTCollection.find((item) => {
        return (
          (id !== undefined ? Number(item.id) === Number(id) : true) &&
          item.contractAddress?.toLowerCase() === contract?.toLowerCase()
        )
      })
      if (collectionMeta) {
        setCollectionMeta(collectionMeta)
        return
      } else {
        const response = await LoopringAPI.userAPI
          .getUserNFTCollection(
            {
              tokenAddress: contract,
              collectionId: id,
              accountId: accountId.toString(),
              limit: CollectionLimit,
            } as any,
            apiKey,
          )
          .catch((_error) => {
            throw new CustomError(ErrorMap.TIME_OUT)
          })
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          throw new CustomError(ErrorMap.ERROR_UNKNOWN)
        }
        const collections = response.collections
        if (collections.length) {
          const collectionMeta = collections.find((item: any) => {
            return (
              (id !== undefined ? Number(item.id) === Number(id) : true) &&
              item.contractAddress?.toLowerCase() === contract?.toLowerCase()
            )
          })

          setCollectionMeta(collectionMeta)
          return
        } else {
          history.push(`${matchPreUrl}/byCollection` + '?' + searchParams.toString())
        }
      }
    }
  }

  React.useEffect(() => {
    const [contract, id] = contractStr ? contractStr.split('--') : [null, null]
    if (contract && id && contract.startsWith('0x')) {
      checkCollection()
    }
  }, [contractStr])
  return {
    collectionMeta,
  }
}
