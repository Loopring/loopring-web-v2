import React from 'react'
import {
  ErrorType,
  IPFS_HEAD_URL,
  MINT_LIMIT,
  myLog,
  NFTMETA,
  UIERROR_CODE,
  CollectionMeta,
  LIVE_FEE_TIMES,
} from '@loopring-web/common-resources'
import { IpfsFile, NFTMetaProps } from '@loopring-web/component-lib'
import {
  store,
  useBtnStatus,
  useChargeFees,
  NFT_MINT_VALUE,
  useModalData,
  MintCommands,
  mintService,
  LoopringAPI,
  useSystem,
  getIPFSString,
} from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { ipfsService, useIPFS } from '../ipfs'
import { AddResult } from 'ipfs-core-types/types/src/root'

export function useNFTMeta<T extends NFTMETA, Co extends CollectionMeta>({
  handleTabChange,
  nftMintValue,
}: {
  nftMintValue: NFT_MINT_VALUE<any>
  handleTabChange: (value: 0 | 1) => void
}) {
  const subject = React.useMemo(() => mintService.onSocket(), [])
  const { updateNFTMintData, resetNFTMintData } = useModalData()
  const [errorOnMeta, setErrorOnMeta] = React.useState<sdk.RESULT_INFO | undefined>(undefined)
  const [_, setCIDUniqueId] = React.useState<string | undefined>(undefined)
  const [keys, setKeys] = React.useState<{
    [key: string]: undefined | IpfsFile
  }>(() => {
    return {
      image: undefined,
      animationUrl: undefined,
    }
  })
  const [userAgree, setUserAgree] = React.useState(false)
  const { baseURL } = useSystem()
  const domain = LoopringAPI.delegate?.getCollectionDomain() ?? ''

  const handleOnMetaChange = React.useCallback(
    (_newnftMeta: Partial<T> & { collection?: CollectionMeta }) => {
      const { nftMETA, mintData, collection } = store.getState()._router_modalData.nftMintValue
      const buildNFTMeta = { ...nftMETA }
      const buildMint = { ...mintData }
      let buildCollection = { ...collection }
      Reflect.ownKeys(_newnftMeta).map((key) => {
        switch (key) {
          case 'image':
            buildNFTMeta.image = _newnftMeta.image
            break
          case 'animationUrl':
            buildNFTMeta.animationUrl = _newnftMeta.animationUrl
            break
          case 'name':
            buildNFTMeta.name = _newnftMeta.name
            break
          case 'royaltyPercentage':
            const value = Number(_newnftMeta.royaltyPercentage)
            buildMint.royaltyPercentage = value
            buildNFTMeta.royaltyPercentage = value
            // if (
            //   Number.isInteger(value) &&
            //   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value)
            // ) {
            //   buildNFTMeta.royaltyPercentage = value;
            //   buildMint.royaltyPercentage = value;
            // }
            break
          case 'description':
            buildNFTMeta.description = _newnftMeta.description
            break
          case 'collection':
            buildMint.tokenAddress = _newnftMeta.collection?.contractAddress
            // @ts-ignore
            buildNFTMeta.collection_metadata = `${domain}/${_newnftMeta.collection?.collectionAddress}`
            buildCollection = _newnftMeta.collection ? _newnftMeta.collection : buildCollection
            break
          case 'properties':
            buildNFTMeta.properties = _newnftMeta.properties
            break
        }
      })
      updateNFTMintData({
        mintData: buildMint,
        nftMETA: buildNFTMeta,
        collection: buildCollection,
      })
      myLog('updateNFTMintData buildNFTMeta', buildNFTMeta)
    },
    [updateNFTMintData],
  )
  // const handleOnMetaChange = React.useCallback(
  //   (key: string, value: any) => {
  //     const collectionValue =
  //       store.getState()._router_modalData.collectionValue;
  //     myLog("collectionValue", collectionValue);
  //     updateCollectionData({ ...collectionValue, [key]: value });
  //   },
  //   [updateCollectionData]
  // );

  const handleFailedUpload = React.useCallback(
    (data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId
        }) as string
        if (key) {
          handleOnMetaChange({ [key]: undefined } as Partial<T>)
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
    [handleOnMetaChange],
  )
  const handleSuccessUpload = React.useCallback(
    (data: AddResult & { uniqueId: string }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId
        }) as string
        if (key) {
          const cid = data.cid.toString()
          handleOnMetaChange({
            [key]: `${IPFS_HEAD_URL}${data.path}`,
          } as unknown as Partial<T>)
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
      setCIDUniqueId((cidUniqueID) => {
        if (cidUniqueID && cidUniqueID === data.uniqueId) {
          mintService.completedIPFSCallMint({ ipfsResult: data })
        }
        return cidUniqueID
      })
    },
    [baseURL, handleOnMetaChange],
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

  // const onFilesLoad = React.useCallback(
  //   (value: IpfsFile) => {
  //     value.isUpdateIPFS = true;
  //     setIpfsMediaSources(value);
  //     ipfsService.addFile({
  //       ipfs: ipfsProvides.ipfs,
  //       file: value.file,
  //       uniqueId: value.uniqueId,
  //     });
  //   },
  //   [ipfsProvides.ipfs]
  // );
  // const onDelete = React.useCallback(() => {
  //   setIpfsMediaSources(undefined);
  //   handleOnMetaChange({
  //     image: undefined,
  //   } as Partial<T>);
  // }, [handleOnMetaChange]);

  const onDelete = React.useCallback(
    (keys: string[]) => {
      setKeys((state) => {
        keys.forEach((key: string) => {
          handleOnMetaChange({ [key]: undefined } as Partial<T>)
          state = {
            ...state,
            [key]: undefined,
          }
        })
        return state
      })
    },
    [handleOnMetaChange],
  )

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    resetIntervalTime,
  } = useChargeFees({
    tokenAddress: nftMintValue?.mintData?.tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: ({ fee }) => {
      const { nftMETA, mintData, collection } = store.getState()._router_modalData.nftMintValue
      if (mintData?.tokenAddress === collection?.contractAddress) {
        // myLog("fee", fee);
        updateNFTMintData({
          nftMETA: nftMETA,
          mintData: { ...mintData, fee },
          collection,
        })
      }
    },
  })
  const { btnStatus, btnInfo, enableBtn, disableBtn, setLabelAndParams, resetBtnInfo } =
    useBtnStatus()
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo()
      myLog(
        'nftMetaBtnStatus nftMintValue:',
        'mintData',
        nftMintValue.mintData,
        'nftMETA',
        nftMintValue.nftMETA,
        'userAgree',
        userAgree,
        'error',
        error,
      )
      if (
        !error &&
        nftMintValue &&
        nftMintValue.mintData &&
        nftMintValue.nftMETA &&
        userAgree &&
        // tokenAddress &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
        !!nftMintValue.nftMETA.name &&
        !!nftMintValue.nftMETA.image &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        nftMintValue.collection
        // && !isFeeNotEnough.isFeeNotEnough
      ) {
        enableBtn()
        return
      }
      if (error) {
        setLabelAndParams(error.messageKey ?? '', { ...error.options })
      }
      if (!userAgree) {
        setLabelAndParams('labelMintUserAgree', {})
      }
      if (nftMintValue.collection) {
        setLabelAndParams('labelMintNoCollectionBtn', {})
      }

      if (!nftMintValue.nftMETA.image || nftMintValue.nftMETA.image.trim() == '') {
        setLabelAndParams('labelMintNoImageBtn', {})
      }
      if (!nftMintValue.collection) {
        setLabelAndParams('labelCollectionSelect', {})
      }
      if (!nftMintValue.nftMETA.name || nftMintValue.nftMETA.name.trim() == '') {
        setLabelAndParams('labelMintNoNameBtn', {})
      }
      if (
        !(
          nftMintValue.nftMETA.royaltyPercentage !== undefined &&
          Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
          nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
          nftMintValue.nftMETA.royaltyPercentage / 1 <= 10
        )
      ) {
        setLabelAndParams('labelMintWrongRoyaltyBtn', {})
      }

      if (
        !(
          nftMintValue.mintData.tradeValue &&
          Number(nftMintValue.mintData.tradeValue) > 0 &&
          Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT
        )
      ) {
        setLabelAndParams('labelMintTradeValueBtn', {})
      }

      disableBtn()
      myLog('try to disable nftMint btn!')
    },
    [
      resetBtnInfo,
      nftMintValue,
      userAgree,
      // tokenAddress,
      // isFeeNotEnough,
      disableBtn,
      enableBtn,
      setLabelAndParams,
    ],
  )

  React.useEffect(() => {
    updateBtnStatus()
  }, [nftMintValue.mintData, nftMintValue.nftMETA, userAgree, updateBtnStatus])

  const resetMETADAT = (_nftMintValue?: NFT_MINT_VALUE<any>) => {
    onDelete(['image', 'animationUrl'])
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES })
  }
  const onMetaClick = React.useCallback(() => {
    const uniqueId = (nftMintValue.nftMETA as T).name + Date.now()
    setCIDUniqueId(uniqueId)
    mintService.processingIPFS({ ipfsProvides, uniqueId })
  }, [ipfsProvides, nftMintValue.nftMETA])

  const handleUserAgree = (value: boolean) => {
    setUserAgree(value)
  }
  const nftMetaProps: Omit<NFTMetaProps<T, Co>, 'collectionInputProps'> = {
    handleOnMetaChange,
    isFeeNotEnough,
    baseURL,
    handleFeeChange,
    userAgree,
    handleUserAgree,
    chargeFeeTokenList,
    feeInfo,
    nftMetaBtnStatus: btnStatus,
    btnInfo,
    onMetaClick,
    domain,
  }
  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.MetaDataSetup:
          handleTabChange(0)
          setErrorOnMeta(data?.error)
          if (data?.emptyData) {
            resetMETADAT()
          }
          break
      }
    },
    [handleTabChange],
  )
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props)
    })
    return () => {
      resetNFTMintData()
      subscription.unsubscribe()
    }
  }, [subject])
  return {
    onFilesLoad,
    onDelete,
    keys,
    ipfsProvides,
    nftMetaProps,
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    resetIntervalTime,
    // tokenAddress,
    // resetMETADAT,
    errorOnMeta,
  }
}
