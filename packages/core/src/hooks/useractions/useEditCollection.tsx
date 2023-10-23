import {
  CollectionMeta,
  ErrorType,
  IPFS_HEAD_URL,
  myLog,
  NFTSubRouter,
  RouterPath,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
} from '@loopring-web/common-resources'

import { BigNumber } from 'bignumber.js'
import React from 'react'
import {
  getIPFSString,
  ipfsService,
  LoopringAPI,
  store,
  useAccount,
  useBtnStatus,
  useIPFS,
  useModalData,
  useSystem,
  useToast,
  useWalletL2Collection,
} from '../../index'
import { IpfsFile, ToastType, useToggle } from '@loopring-web/component-lib'
import { useHistory, useRouteMatch } from 'react-router-dom'
import * as sdk from '@loopring-web/loopring-sdk'
import { AddResult } from 'ipfs-core-types/src/root'
import { useTranslation } from 'react-i18next'

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }

BigNumber.config({ EXPONENTIAL_AT: 100 })
export const useEditCollection = <T extends CollectionMeta>({
  isEdit = false,
  type,
}: {
  isEdit?: boolean
  type: 'addCollection' | 'editCollection' | 'addLegacyCollection'
}) => {
  const {
    toggle: { collectionNFT },
  } = useToggle()
  const {
    toastOpen: collectionToastOpen,
    setToastOpen: setCollectionToastOpen,
    closeToast: collectionToastClose,
  } = useToast()
  let match: any = useRouteMatch('/nft/:type?/:tokenAddress?')
  const { t } = useTranslation('common')
  const [disabled, _setDisabled] = React.useState(!collectionNFT.enable)
  const { collectionValue, updateCollectionData, resetCollectionData } = useModalData()
  const [collectionOldValue] = React.useState<T | undefined>(
    isEdit
      ? ({
          ...collectionValue,
        } as T)
      : undefined,
  )

  const { baseURL, chainId } = useSystem()
  const { updateWalletL2Collection } = useWalletL2Collection()
  const history = useHistory()
  const keysEditInit = (collection: Partial<CollectionMeta> = {}) => {
    // const req = Promise.all([
    //   fetch(getIPFSString(collection.banner, baseURL), {
    //     method: "HEAD",
    //   }),
    //   fetch(getIPFSString(collection.tileUri, baseURL), {
    //     method: "HEAD",
    //   }),
    //   fetch(getIPFSString(collection.avatar, baseURL), {
    //     method: "HEAD",
    //   }),
    // ]).then([]);
    // tokenInfo.__mediaType__ = getMediaType(
    //   req?.headers?.get("content-type") ?? ""
    // );
    return {
      banner: collection.banner
        ? ({
            error: undefined,
            file: {
              type: 'image/*',
            },
            fullSrc: getIPFSString(collection.banner, baseURL),
            localSrc: getIPFSString(collection.banner, baseURL),
            isProcessing: false,
            isUpdateIPFS: false,
            uniqueId: '',
          } as unknown as IpfsFile)
        : undefined,
      tileUri: collection.tileUri
        ? ({
            error: undefined,
            file: {
              type: 'image/*',
            },
            fullSrc: getIPFSString(collection.tileUri, baseURL),
            localSrc: getIPFSString(collection.tileUri, baseURL),
            isProcessing: false,
            isUpdateIPFS: false,
            uniqueId: '',
          } as unknown as IpfsFile)
        : undefined,
      avatar: collection.avatar
        ? ({
            error: undefined,
            file: {
              type: 'image/*',
            },
            fullSrc: getIPFSString(collection.avatar, baseURL),
            localSrc: getIPFSString(collection.avatar, baseURL),
            isProcessing: false,
            isUpdateIPFS: false,
            uniqueId: '',
          } as unknown as IpfsFile)
        : undefined,
    }
  }
  const [keys, setKeys] = React.useState<{
    [key: string]: undefined | IpfsFile
  }>(() => {
    return isEdit
      ? keysEditInit(collectionOldValue)
      : {
          banner: undefined,
          // name: undefined,
          tileUri: undefined,
          avatar: undefined,
          // thumbnail: undefined,
        }
  })

  const { account } = useAccount()

  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
    setLoadingBtn,
  } = useBtnStatus()
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo()

      const ipfsProcessing = Reflect.ownKeys(keys).find(
        (key) => keys[key as string]?.isProcessing === true,
      )

      if (
        !error &&
        collectionValue &&
        collectionValue.name &&
        collectionValue.tileUri &&
        ipfsProcessing === undefined
      ) {
        enableBtn()
        return
      }
      if (!collectionValue?.name) {
        setLabelAndParams('labelCollectionRequiredName', {})
      }
      if (!collectionValue?.tileUri) {
        setLabelAndParams('labelCollectionRequiredTileUri', {})
      }

      if (ipfsProcessing) {
        setLoadingBtn()
        return
      }

      disableBtn()
      myLog('try to disable nftMint btn!')
    },
    [resetBtnInfo, keys, collectionValue, disableBtn, enableBtn, setLabelAndParams, setLoadingBtn],
  )

  React.useEffect(() => {
    updateBtnStatus()
  }, [collectionValue, updateBtnStatus, keys])
  React.useEffect(() => {
    return () => {
      resetCollectionData()
    }
  }, [])
  const onSubmitClick = React.useCallback(async () => {
    if (collectionValue.name?.trim() && collectionValue.tileUri?.trim() && LoopringAPI.userAPI) {
      setLoadingBtn()
      if (isEdit && type === 'editCollection' && collectionOldValue?.id) {
        try {
          const response = await LoopringAPI.userAPI.submitEditNFTCollection(
            {
              name: collectionValue.name?.trim(),
              tileUri: collectionValue.tileUri?.trim(),
              accountId: account.accountId,
              banner: collectionValue.banner?.trim() ?? '',
              avatar: collectionValue.avatar?.trim() ?? '',
              description: collectionValue.description?.trim() ?? '',
              collectionId: collectionOldValue.id ?? '',
              // @ts-ignore
              thumbnail: '',
            },
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
                { ns: 'error', name: collectionValue.name?.trim() },
              ),
            )
          } else {
            setCollectionToastOpen({
              open: true,
              type: ToastType.success,
              content: t('labelEditCollectionSuccess'),
            })
            updateWalletL2Collection({ page: 1 })
            history.push(`${RouterPath.nft}/${NFTSubRouter.myCollection}`)
          }
          updateCollectionData({ ...collectionOldValue })
          setKeys({
            banner: undefined,
            name: undefined,
            tileUri: undefined,
            avatar: undefined,
            thumbnail: undefined,
          })
        } catch (error) {
          setCollectionToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t('labelEditCollectionFailed') +
              `: ${(error as any)?.message ? (error as any).message : t('errorUnknown')}`,
          })
          resetBtnInfo()
        }
      } else if (type === 'addLegacyCollection' && account.accountId && match.params.tokenAddress) {
        try {
          const response = await LoopringAPI.userAPI.submitNFTLegacyCollection(
            {
              ...collectionValue,
              tokenAddress: match.params.tokenAddress,
              accountId: account.accountId,
              name: collectionValue.name?.trim(),
              tileUri: collectionValue.tileUri?.trim(),
            },
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
                { ns: 'error', name: collectionValue.name?.trim() },
              ),
            )
          } else {
            setCollectionToastOpen({
              open: true,
              type: ToastType.success,
              content: t('labelCreateCollectionSuccess'),
            })
            updateWalletL2Collection({ page: 1 })
            history.push(
              `${RouterPath.nft}/${NFTSubRouter.importLegacyCollection}/${match.params.tokenAddress}`,
            )
          }
          updateCollectionData({})
          setKeys({
            banner: undefined,
            name: undefined,
            tileUri: undefined,
            avatar: undefined,
            thumbnail: undefined,
          })
        } catch (error) {
          setCollectionToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t('labelCreateCollectionFailed') +
              `: ${(error as any)?.message ? (error as any).message : t('errorUnknown')}`,
          })
          resetBtnInfo()
        }
      } else {
        try {
          const response = await LoopringAPI.userAPI.submitNFTCollection(
            {
              ...collectionValue,
              name: collectionValue.name?.trim(),
              tileUri: collectionValue.tileUri?.trim(),
              owner: account.accAddress,
              nftFactory: sdk.NFTFactory_Collection[chainId],
            } as sdk.CollectionMeta,
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
                { ns: 'error', name: collectionValue.name?.trim() },
              ),
            )
          } else {
            setCollectionToastOpen({
              open: true,
              type: ToastType.success,
              content: t('labelCreateCollectionSuccess'),
            })
            updateWalletL2Collection({ page: 1 })
            history.push(`${RouterPath.nft}/${NFTSubRouter.myCollection}`)
          }
          updateCollectionData({})
          setKeys({
            banner: undefined,
            name: undefined,
            tileUri: undefined,
            avatar: undefined,
            thumbnail: undefined,
          })
        } catch (error) {
          setCollectionToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t('labelCreateCollectionFailed') +
              `: ${(error as any)?.message ? (error as any).message : t('errorUnknown')}`,
          })
          resetBtnInfo()
        }
      }
    }
  }, [
    account,
    chainId,
    collectionOldValue,
    collectionValue,
    history,
    isEdit,
    resetBtnInfo,
    setCollectionToastOpen,
    setLoadingBtn,
    t,
    updateCollectionData,
    updateWalletL2Collection,
    match.params.tokenAddress,
  ])

  const handleOnDataChange = React.useCallback(
    (key: string, value: any) => {
      const collectionValue = store.getState()._router_modalData.collectionValue
      myLog('collectionValue', collectionValue)
      updateCollectionData({ ...collectionValue, [key]: value })
    },
    [updateCollectionData],
  )

  const onDelete = React.useCallback(
    (key: string) => {
      setKeys((state) => {
        return {
          ...state,
          [key]: undefined,
        }
      })
      handleOnDataChange(key, undefined)
    },
    [handleOnDataChange],
  )

  const handleFailedUpload = React.useCallback(
    (data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId
        }) as string
        if (key) {
          handleOnDataChange(key, undefined)
          return {
            ...state,
            [key]: {
              ...state[key],
              isProcessing: false,
              ...{
                error: data.error
                  ? data.error
                  : {
                      code: UIERROR_CODE.UNKNOWN,
                      message: `Ipfs Error ${data}`,
                    },
              },
            } as IpfsFile,
          }
        } else {
          return state
        }
      })
    },
    [handleOnDataChange],
  )
  const handleSuccessUpload = React.useCallback(
    (data: AddResult & { uniqueId: string }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId
        }) as string
        if (key) {
          const cid = data.cid.toString()
          handleOnDataChange(key, `${IPFS_HEAD_URL}${data.path}`)
          return {
            ...state,
            [key as any]: {
              ...state[key as any],
              ...{
                cid,
                fullSrc: getIPFSString(`${IPFS_HEAD_URL}${data.path}`, baseURL),
                isProcessing: false,
              },
            },
          }
        } else {
          return state
        }
      })
    },
    [baseURL, handleOnDataChange],
  )

  const { ipfsProvides } = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  })

  const onFilesLoad = React.useCallback(
    (key: string, value: IpfsFile) => {
      let uniqueId = key + '|' + Date.now()
      value.isUpdateIPFS = true
      ipfsService.addFile({
        ipfs: ipfsProvides.ipfs,
        file: value.file,
        uniqueId: uniqueId,
      })
      setKeys((state) => {
        return {
          ...state,
          [key]: {
            ...value,
            file: value.file,
            uniqueId: uniqueId,
            cid: '',
          },
        }
      })
    },
    [ipfsProvides.ipfs],
  )

  return {
    keys,
    isEdit,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    handleOnDataChange,
    collectionValue,
    resetEdit: isEdit
      ? () => {
          updateCollectionData({ ...collectionOldValue })
          setKeys(keysEditInit(collectionOldValue))
        }
      : undefined,
    onSubmitClick,
  }
}
