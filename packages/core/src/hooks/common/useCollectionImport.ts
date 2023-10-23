import { BigNumber } from 'bignumber.js'
import React from 'react'
import {
  Account,
  CollectionMeta,
  CustomError,
  ErrorMap,
  L2CollectionFilter,
  NFTWholeINFO,
  RouterPath,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  getIPFSString,
  LoopringAPI,
  makeMeta,
  useAccount,
  useCollectionManage,
  useMyCollection,
  useWalletL2Collection,
} from '../../index'
import { ImportCollectionStep, ImportCollectionViewProps } from '@loopring-web/component-lib'
import { useHistory, useRouteMatch } from 'react-router-dom'

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }
BigNumber.config({ EXPONENTIAL_AT: 100 })

export const useCollectionImport = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>,
>(): ImportCollectionViewProps<Co, NFT> => {
  const { account } = useAccount()
  const history = useHistory()
  let match: any = useRouteMatch('/nft/importLegacyCollection/:id?')
  const stepList = match?.params?.id?.split('--')
  const contract = stepList && stepList[0]?.startsWith('0x') && stepList[0]
  const contractId = stepList && stepList[1]
  const [step, setStep] = React.useState<ImportCollectionStep>(ImportCollectionStep.SELECTCONTRACT)
  const { legacyContract } = useWalletL2Collection()

  const [onLoading, setOnLoading] = React.useState<boolean>(false)

  // const [contractList, setContractList] = React.useState<string[]>([""]);
  const [selectContract, setSelectContract] = React.useState<
    { value: string; total?: number; list?: sdk.UserNFTBalanceInfo[] } | undefined
  >(undefined)
  const [filter, setFilter] = React.useState<{
    isLegacy: boolean
    tokenAddress: string
  }>({
    isLegacy: true,
    tokenAddress: selectContract?.value ?? '',
  })
  const { onPageChange: onCollectionPageChange, ...collectionListProps } = useMyCollection<Co>(
    filter as any,
  )
  const [selectCollection, setSelectCollection] = React.useState<Co | undefined>(undefined)
  const onContractChange = React.useCallback(
    async (item) => {
      setSelectContract({ value: item })
      setOnLoading(true)
      let _filter = { offset: 0 }
      if (LoopringAPI.userAPI) {
        const { userNFTBalances, totalNum } = await LoopringAPI.userAPI
          .getUserNFTLegacyBalance(
            {
              collectionId: -1,
              accountId: account.accountId,
              tokenAddress: item,
              limit: 3,
              ..._filter,
              metadata: true, // close metadata
            },
            account.apiKey,
          )
          .catch((_error) => {
            throw new CustomError(ErrorMap.TIME_OUT)
          })
        setSelectContract((state) => ({
          ...state,
          value: item,
          list: userNFTBalances,
          total: totalNum,
        }))
      }
      setOnLoading(false)
    },
    [account.accountId, account.apiKey],
  )
  React.useEffect(() => {
    if (
      collectionListProps.isLoading === false &&
      selectCollection === undefined &&
      collectionListProps.total
    ) {
      onCollectionChange(collectionListProps.collectionList[0])
    }
    ;() => {
      setSelectCollection(undefined)
    }
  }, [collectionListProps.isLoading])

  const { collection, selectedNFTS, onNFTSelected, baseURL, onNFTSelectedMethod, ...nftProps } =
    useCollectionManage<Co, NFT>({ collection: selectCollection })
  const onCollectionChange = React.useCallback((item: Co | undefined) => {
    setSelectCollection(item)
  }, [])

  const onContractNext = React.useCallback(
    async (value: string) => {
      const _filter = {
        isLegacy: true,
        tokenAddress: value,
      }
      setFilter(_filter)
      setOnLoading(true)
      collectionListProps.collectionList = []
      onCollectionPageChange(1, _filter)
    },
    [collectionListProps],
  )

  const onCollectionNext = React.useCallback(() => {}, [])

  const onClick = React.useCallback(() => {}, [])
  React.useEffect(() => {
    if (stepList && contract) {
      onContractChange(contract)
      onContractNext(contract)
      setStep(ImportCollectionStep.SELECTCOLLECTION)
    } else if (stepList && contractId) {
      setStep(ImportCollectionStep.SELECTNFT)
    } else {
      if (legacyContract?.length) {
        onContractChange(legacyContract[0])
      }
      setStep(ImportCollectionStep.SELECTCONTRACT)
    }
  }, [legacyContract])
  React.useEffect(() => {
    if (!collectionListProps.isLoading && onLoading === true) {
      setOnLoading(false)
    }
  }, [collectionListProps.isLoading])

  return {
    account: account as Account,
    onContractChange,
    onContractNext,
    onCollectionChange,
    onCollectionNext,
    onNFTSelected,
    onNFTSelectedMethod,
    step,
    baseURL,
    getIPFSString,
    setStep: (item) => {
      switch (item) {
        case ImportCollectionStep.SELECTCOLLECTION:
          history.replace(`${RouterPath.nft}/importLegacyCollection/${selectContract?.value}`)
          break
        case ImportCollectionStep.SELECTNFT:
          history.replace(
            `${RouterPath.nft}/importLegacyCollection/${selectContract?.value}--${selectCollection?.id}`,
          )
          break
        case ImportCollectionStep.SELECTCONTRACT:
        default:
          history.replace(`${RouterPath.nft}/importLegacyCollection`)
          break
      }
      setStep(item)
    },
    disabled: false,
    onLoading,
    onClick,
    data: {
      contractList: legacyContract,
      selectContract,
      selectNFTList: selectedNFTS as NFT[],
      selectCollection,
      collectionInputProps: {
        collection: selectCollection,
        collectionListProps: {
          onPageChange: React.useCallback(
            (page: number, _filter?: L2CollectionFilter | undefined) => {
              onCollectionPageChange(page, { ...filter, ..._filter })
            },
            [filter],
          ),
          ...collectionListProps,
        },
        domain: LoopringAPI.delegate?.getCollectionDomain(),
        makeMeta,
      } as any,
      nftProps: nftProps as any,
    },
  }
}
