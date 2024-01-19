import {
  AccountStatus,
  CollectionMeta,
  NFTSubRouter,
  RouterPath,
  SagaStatus,
} from '@loopring-web/common-resources'
import {
  collectionService,
  useAccount,
  useEditCollection,
  useSystem,
  getIPFSString,
} from '@loopring-web/core'
import { BigNumber } from 'bignumber.js'
import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

BigNumber.config({ EXPONENTIAL_AT: 100 })
export const useCollectionPanel = <T extends CollectionMeta>({
  type,
}: {
  type: 'addCollection' | 'editCollection' | 'addLegacyCollection'
}) => {
  const match: any = useRouteMatch('/nft/:item?/:id?')
  const { t } = useTranslation('common')
  const isEdit = match?.params?.item === 'editCollection'
  const history = useHistory()
  const { baseURL } = useSystem()
  const {
    keys,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    handleOnDataChange,
    collectionValue,
    onSubmitClick,
    resetEdit,
  } = useEditCollection({ isEdit, type })
  const { account, status: accountStatus } = useAccount()
  const title = React.useMemo(() => {
    if (match?.params.item === 'addCollection') {
      return t(t('labelCollectionCreateERC1155'))
    } else if (match?.params.item === 'editCollection') {
      return t('labelEditCollectionERC1155')
    } else if (match?.params?.item === 'addLegacyCollection') {
      return t('labelLegacyCollectionTitle')
    }
  }, [account.readyState, accountStatus, match.params.id, match.params.item, t])

  const goBack = React.useCallback(() => {
    if (match?.params.item === 'addCollection') {
      history.goBack()
    } else if (match?.params.item === 'editCollection') {
      history.push(`${RouterPath.nft}/${NFTSubRouter.myCollection}`)
    } else if (match?.params?.item === 'addLegacyCollection') {
      history.push(`${RouterPath.nft}/${NFTSubRouter.importLegacyCollection}/${match?.params?.id}`)
    }
  }, [account.readyState, accountStatus, history, match?.params?.id, match?.params?.item])
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED &&
      match?.params.item === 'addCollection'
    ) {
      collectionService.emptyData()
    } else if (match?.params.item === 'editCollection' && match?.params?.id) {
      const loopringId = match?.params?.id.split('--')[1]
      if (collectionValue?.id?.toString() === loopringId.toString()) {
      } else {
        history.push(`${RouterPath.nft}/${NFTSubRouter.myCollection}`)
      }
    } else if (match?.params?.item === 'addLegacyCollection' && match?.params?.id) {
      const contract = match?.params?.id
      if (contract.startsWith('0x')) {
      } else {
        history.push(`${RouterPath.nft}/${NFTSubRouter.importLegacyCollection}`)
      }
    }
  }, [accountStatus, account.readyState, match?.params?.item])

  return {
    keys,
    title,
    goBack,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    baseURL,
    getIPFSString,
    handleOnDataChange,
    collectionValue,
    resetEdit,
    isEdit,
    onSubmitClick,
  }
}
