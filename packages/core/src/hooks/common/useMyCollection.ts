import { BigNumber } from 'bignumber.js'
import React, { useState } from 'react'
import { SagaStatus, CollectionMeta, L2CollectionFilter } from '@loopring-web/common-resources'
import { getIPFSString, LoopringAPI, makeMeta, useSystem, useWalletL2Collection } from '../../index'
import { CollectionListProps } from '@loopring-web/component-lib'

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }
BigNumber.config({ EXPONENTIAL_AT: 100 })

export const useMyCollection = <C extends CollectionMeta>(
  filter?: L2CollectionFilter,
): CollectionListProps<C> => {
  const [collectionList, setCollectionList] = React.useState<C[]>([])
  const [copyToastOpen, setCopyToastOpen] = React.useState({
    isShow: false,
    type: 'json',
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const domain = LoopringAPI.delegate?.getCollectionDomain() ?? ''
  const {
    status: walletL2CollectionStatus,
    walletL2Collection,
    total,
    page: page_reudex,
    updateWalletL2Collection,
  } = useWalletL2Collection()
  const { etherscanBaseUrl, baseURL } = useSystem()
  const [page, setPage] = useState(1)

  const onPageChange = (page: number, filter?: L2CollectionFilter) => {
    setPage(page)
    setIsLoading(true)
    updateWalletL2Collection({ page, filter })
  }

  const renderCollection = React.useCallback(async () => {
    // let mediaPromise: any[] = [];
    setCollectionList(walletL2Collection as C[])
    setIsLoading(false)
  }, [etherscanBaseUrl, page, walletL2Collection])
  React.useEffect(() => {
    onPageChange(1, filter)
  }, [])

  React.useEffect(() => {
    if (walletL2CollectionStatus === SagaStatus.UNSET && page_reudex === page) {
      renderCollection()
    }
  }, [walletL2CollectionStatus, page, page_reudex])
  return {
    setCopyToastOpen,
    collectionList,
    etherscanBaseUrl,
    onPageChange,
    domain,
    makeMeta,
    total,
    page,
    isLoading,
    copyToastOpen,
    baseURL,
    getIPFSString,
  }
}
