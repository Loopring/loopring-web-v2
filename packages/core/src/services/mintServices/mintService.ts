import { Subject } from 'rxjs'
import { LoopringAPI, store, resetNFTMintData, updateNFTMintData, LAST_STEP } from '../../index'
import {
  AccountStatus,
  // AccountStatus,
  AttributesProperty,
  CollectionMeta,
  CustomError,
  ErrorMap,
  MetaDataProperty,
  myLog,
  UIERROR_CODE,
} from '@loopring-web/common-resources'
import { IpfsProvides, ipfsService } from '../ipfs'
import { BigNumber } from 'bignumber.js'
import { AddResult } from 'ipfs-core-types/types/src/root'
import * as sdk from '@loopring-web/loopring-sdk'

// import * as sdk from "@loopring-web/loopring-sdk";

export enum MintCommands {
  MetaDataSetup,
  MintConfirm,
  SignatureMint,
}

const subject = new Subject<{
  status: MintCommands
  data?: {
    uniqueId?: string
    [key: string]: any
  }
}>()

export const mintService = {
  emptyData: async (
    props:
      | {
          contractAddress?: string | undefined
          lastStep?: LAST_STEP | undefined
        }
      | undefined,
  ) => {
    const {
      account,
      // system: { chainId },
    } = store.getState()
    let tokenAddress = props?.contractAddress,
      collection: undefined | CollectionMeta = undefined
    if (tokenAddress && account.readyState === AccountStatus.ACTIVATED && account.accAddress) {
      const response = await LoopringAPI.userAPI?.getUserOwenCollection(
        {
          owner: account.accAddress,
          tokenAddress: props?.contractAddress,
        },
        account.apiKey,
      )
      if (
        response &&
        ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
      ) {
        throw new CustomError(ErrorMap.ERROR_UNKNOWN)
      }
      collection = (response as any).collections[0]
    }
    store.dispatch(resetNFTMintData({ tokenAddress, collection, lastStep: props?.lastStep }))
    subject.next({
      status: MintCommands.MetaDataSetup,
      data: {
        emptyData: true,
        collection,
      },
    })
  },
  processingIPFS: ({
    ipfsProvides,
    uniqueId,
  }: {
    ipfsProvides: IpfsProvides
    uniqueId: string
  }) => {
    const {
      nftMintValue: { nftMETA },
    } = store.getState()._router_modalData
    let _nftMETA: any = {
      image: nftMETA.image,
      animation_url: nftMETA.animationUrl ?? nftMETA.image,
      name: nftMETA.name,
      royalty_percentage: nftMETA.royaltyPercentage, // 0 - 10 for UI
      description: nftMETA.description,
      collection_metadata: nftMETA.collection_metadata,
      mint_channel: 'Loopring',
    }
    // const attributes = [];
    const obj =
      nftMETA.properties?.reduce(
        (prev, item) => {
          if (!!item.key?.trim() && !!item.value?.trim()) {
            const obj = { trait_type: item.key, value: item.value }
            prev.attributes = [...prev.attributes, obj]
            prev.properties = { ...prev.properties, [item.key]: item.value }
            return prev
          } else {
            return prev
          }
        },
        {
          properties: {} as MetaDataProperty,
          attributes: [] as AttributesProperty[],
        },
      ) ?? {}

    _nftMETA = {
      ..._nftMETA,
      ...obj,
    }
    myLog('_nftMETA', _nftMETA)
    ipfsService.addJSON({
      ipfs: ipfsProvides.ipfs,
      json: JSON.stringify(_nftMETA),
      uniqueId, //:),
    })
  },
  completedIPFSCallMint: ({ ipfsResult }: { ipfsResult: AddResult }) => {
    const {
      nftMintValue: { nftMETA, mintData, collection },
    } = store.getState()._router_modalData
    try {
      const cid = ipfsResult.cid.toString()
      let nftId: string = LoopringAPI?.nftAPI?.ipfsCid0ToNftID(cid) ?? ''
      let nftIdView = new BigNumber(nftId ?? '0', 16).toString()
      store.dispatch(
        updateNFTMintData({
          nftMETA: nftMETA,
          mintData: {
            ...mintData,
            cid,
            nftIdView,
            nftId,
          },
          collection,
        }),
      )
      subject.next({
        status: MintCommands.SignatureMint,
      })
    } catch (error: any) {
      myLog('handleMintDataChange ->.cid', error)
      subject.next({
        status: MintCommands.MetaDataSetup,
        data: {
          error: {
            code: UIERROR_CODE.IPFS_CID_TO_NFTID_ERROR,
            message: `error on decode ipfsResult: ${ipfsResult}`,
          },
        },
      })
    }
    // }
  },
  goMintConfirm: (isHardware?: boolean) => {
    subject.next({
      status: MintCommands.MintConfirm,
      data: {
        isHardware: isHardware,
      },
    })
  },
  backMetaDataSetup: () => {
    subject.next({
      status: MintCommands.MetaDataSetup,
      data: {
        emptyData: false,
      },
    })
  },
  signatureMint: () => {
    subject.next({
      status: MintCommands.SignatureMint,
    })
  },
  onSocket: () => subject.asObservable(),
}
