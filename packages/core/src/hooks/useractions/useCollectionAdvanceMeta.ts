import {
  CollectionMeta,
  CollectionMetaJSON,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import { CollectionAdvanceProps, ToastType, useOpenModals } from '@loopring-web/component-lib'
import React from 'react'
import { useAccount, useModalData, useSystem, useWalletL2Collection } from '../../stores'
import { useBtnStatus } from '../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../api_wrapper'
import { useTranslation } from 'react-i18next'

export function useCollectionAdvanceMeta<T extends CollectionMeta>({
  setCollectionToastOpen,
}: {
  setCollectionToastOpen: any
}) {
  const { allowTrade, chainId } = useSystem()
  const { setShowCollectionAdvance } = useOpenModals()
  const { updateWalletL2Collection } = useWalletL2Collection()
  const { account } = useAccount()
  const [metaData, setMetaData] = React.useState('')
  const { t } = useTranslation('common')
  const {
    btnStatus,
    setLabelAndParams,
    resetBtnInfo,
    enableBtn,
    disableBtn,
    btnInfo,
    setLoadingBtn,
  } = useBtnStatus()
  const { collectionAdvanceValue, updateCollectionAdvanceData } = useModalData()
  const [error, setError] = React.useState<undefined | { code: UIERROR_CODE; message: string }>(
    undefined,
  )
  const onSubmitClick = React.useCallback(
    async (_data: T) => {
      if (
        !error &&
        collectionAdvanceValue.name?.trim() &&
        collectionAdvanceValue.tileUri?.trim() &&
        LoopringAPI.userAPI
      ) {
        setLoadingBtn()
        try {
          const response = await LoopringAPI.userAPI.submitNFTCollection(
            {
              ...collectionAdvanceValue,
              name: collectionAdvanceValue.name?.trim(),
              tileUri: collectionAdvanceValue.tileUri?.trim(),
              owner: account.accAddress,
              nftFactory: sdk.NFTFactory_Collection[chainId],
            } as sdk.CollectionBasicMeta,
            chainId as any,
            account.apiKey,
            account.eddsaKey.sk,
          )
          if (
            response &&
            ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
          ) {
            const _response: sdk.RESULT_INFO = response as sdk.RESULT_INFO
            throw new Error(
              t(
                _response.code && SDK_ERROR_MAP_TO_UI[_response.code]
                  ? SDK_ERROR_MAP_TO_UI[_response.code].messageKey
                  : SDK_ERROR_MAP_TO_UI[UIERROR_CODE.UNKNOWN].messageKey,
                { ns: 'error', name: collectionAdvanceValue.name?.trim() },
              ),
            )
          } else {
            setCollectionToastOpen({
              open: true,
              type: 'success',
              content: t('labelCreateCollectionSuccess'),
            })
            updateWalletL2Collection({ page: 1 })
          }
        } catch (error) {
          myLog('error', error)
          setCollectionToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t('labelCreateCollectionFailed') +
              `: ${(error as any)?.message ? (error as any).message : t('errorUnknown')}`,
          })
        }

        setShowCollectionAdvance({ isShow: false })
      }
      // resetBtnInfo();
      // disableBtn();
      setError(undefined)
      setMetaData('')
      updateCollectionAdvanceData({})
    },
    [collectionAdvanceValue, disableBtn, resetBtnInfo],
  )

  const updateBtnStatus = React.useCallback(() => {
    resetBtnInfo()
    if (!error && collectionAdvanceValue?.name) {
      enableBtn()
      return
    }
    if (collectionAdvanceValue === undefined || Object.keys(collectionAdvanceValue).length === 0) {
      setLabelAndParams('labelEnterMeta', {})
    } else if (error) {
      setLabelAndParams(SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]?.messageKey, {})
    } else if (!collectionAdvanceValue?.name) {
      setLabelAndParams(SDK_ERROR_MAP_TO_UI[700014].messageKey, {})
    }
    disableBtn()
    myLog('try to disable collectionAdvance btn!')
  }, [error, resetBtnInfo, enableBtn, setLabelAndParams, collectionAdvanceValue, disableBtn])

  React.useEffect(() => {
    updateBtnStatus()
  }, [collectionAdvanceValue, error])

  const collectionAdvanceProps: CollectionAdvanceProps<T> = {
    handleDataChange: (_data) => {
      setMetaData(_data)
      try {
        let _metaDataJSON: CollectionMetaJSON = JSON.parse(_data.replaceAll(/\n|\s/gi, ''))
        const _metaData: sdk.CollectionBasicMeta = {
          owner: account.accAddress,
          tileUri: _metaDataJSON?.tile_uri.trim() ?? undefined,
          name: _metaDataJSON?.name?.trim() ?? undefined,
          description: _metaDataJSON?.description?.trim() ?? undefined,
          avatar: _metaDataJSON?.avatar_uri?.trim() ?? undefined,
          banner: _metaDataJSON?.banner_uri?.trim() ?? undefined,
        }

        if (!_metaData.tileUri) {
          setError({
            code: UIERROR_CODE.ERROR_COLLECTION_METADATA_NO_TILEURI,
            message: 'empty tileUri',
          })
          updateCollectionAdvanceData({})
          return
        }
        if (!_metaData.name) {
          setError({
            code: UIERROR_CODE.ERROR_COLLECTION_NO_NAME,
            message: 'empty name',
          })
          updateCollectionAdvanceData({})
          return
        }
        setError(undefined)
        updateCollectionAdvanceData(_metaData)
      } catch (_error) {
        setError({
          code: UIERROR_CODE.ERROR_JSON_STRINGIFY,
          message: (_error as any)?.message,
        })
        return
      }
    },
    onSubmitClick,
    allowTrade,
    disabled: false,
    btnStatus,
    btnInfo,
    metaData,
  } as CollectionAdvanceProps<T>

  return {
    collectionAdvanceProps,
  }
}
