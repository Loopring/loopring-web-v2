import { Subject } from 'rxjs'
import { resetCollectionData, store } from '../../index'

export enum ContractCommands {
  CreateTokenAddress,
  CreateMetaData,
  CreateTokenAddressFailed,
  // MintConfirm,
  // SignatureMint,
}

const subject = new Subject<{
  status: ContractCommands
  data?: {
    uniqueId?: string
    [key: string]: any
  }
}>()

// const socket =  ipfsService.onSocket();

export const collectionService = {
  emptyData: async () => {
    store.dispatch(resetCollectionData({}))
    // const {
    //   account,
    //   // system: { chainId },
    // } = store.getState();
    // let tokenAddress = contractAddress, collection: undefined | CollectionMeta = undefined;
    // if (tokenAddress && account.readyState === AccountStatus.ACTIVATED && account.accAddress) {
    //   const response = await LoopringAPI.userAPI?.getUserOwenCollection({
    //     owner: account.accAddress,
    //     address: contractAddress
    //   }, account.apiKey);
    //   if (
    //     response &&
    //     ((response as sdk.RESULT_INFO).code ||
    //       (response as sdk.RESULT_INFO).message)
    //   ) {
    //     throw new CustomError(ErrorMap.ERROR_UNKNOWN);
    //   }
    //   collection = (response as any).collections[ 0 ];
    // }
    // store.dispatch(resetNFTMintData({tokenAddress, collection}));
    // subject.next({
    //   status: MintCommands.MetaDataSetup,
    //   data: {
    //     emptyData: true,
    //   },
    // });
  },
  // generateCollectionTokenAddress: async ({cid}: { cid: CID }) => {
  //    // const {
  //    //   account,
  //    //   system: {chainId},
  //    // } = store.getState();
  //    // if (account.readyState === AccountStatus.ACTIVATED && account.accAddress) {
  //    //   if (account.accAddress && LoopringAPI.nftAPI) {
  //    //     // return (
  //    //     const tokenAddress = await LoopringAPI.nftAPI?.computeNFTAddress({
  //    //       nftOwner: account.accAddress,
  //    //       nftFactory: sdk.NFTFactory[ chainId ],
  //    //       nftBaseUri: `ipfs://${cid}`,
  //    //     }).tokenAddress || undefined
  //    //     // );
  //    //     subject.next({
  //    //       status: ContractCommands.CreateMetaData,
  //    //       data: {tokenAddress},
  //    //     });
  //    //
  //    //   } else {
  //    //     subject.next({
  //    //       status: ContractCommands.CreateTokenAddressFailed,
  //    //       data: undefined,
  //    //     });
  //    //
  //    //     return Promise.resolve();
  //    //     // return undefined;
  //    //   }
  //    // }
  //  },
  // backMetaDataSetup: () => {
  // updateIpfsGetTokenAddress: (ipfsProvides: IpfsProvides, uniqueId: string) => {
  //   // ipfsService.addJSON({
  //   //   ipfs: ipfsProvides.ipfs,
  //   //   json: JSON.stringify({name: name}),
  //   //   uniqueId, //:),
  //   // });
  // },
  //   subject.next({
  //     status: MintCommands.MetaDataSetup,
  //   });
  //   const {
  //     nftMintValue: { nftMETA, mintData },
  //   } = store.getState()._router_modalData;
  //   store.dispatch(
  //     updateNFTMintData({
  //       nftMETA: nftMETA,
  //       mintData: {
  //         ...mintData,
  //         nftIdView: undefined,
  //         nftId: undefined,
  //       },
  //     })
  //   );
  // },
  // processingIPFS: ({
  //   ipfsProvides,
  //   uniqueId,
  // }: {
  //   ipfsProvides: IpfsProvides;
  //   uniqueId: string;
  // }) => {
  //   const {
  //     nftMintValue: { nftMETA },
  //   } = store.getState()._router_modalData;
  //   let _nftMETA: any = {
  //     image: nftMETA.image,
  //     animation_url: nftMETA.image,
  //     name: nftMETA.name,
  //     royalty_percentage: nftMETA.royaltyPercentage, // 0 - 10 for UI
  //     description: nftMETA.description,
  //     collection: nftMETA.collection,
  //     mint_channel: "Loopring",
  //   };
  //   // const attributes = [];
  //   const obj =
  //     nftMETA.properties?.reduce(
  //       (prev, item) => {
  //         if (!!item.key?.trim() && !!item.value?.trim()) {
  //           const obj = { trait_type: item.key, value: item.value };
  //           prev.attributes = [...prev.attributes, obj];
  //           prev.properties = { ...prev.properties, [item.key]: item.value };
  //           return prev;
  //         } else {
  //           return prev;
  //         }
  //       },
  //       {
  //         properties: {} as MetaDataProperty,
  //         attributes: [] as AttributesProperty[],
  //       }
  //     ) ?? {};
  //
  //   _nftMETA = {
  //     ..._nftMETA,
  //     ...obj,
  //   };
  //   myLog("_nftMETA", _nftMETA);
  //   ipfsService.addJSON({
  //     ipfs: ipfsProvides.ipfs,
  //     json: JSON.stringify(_nftMETA),
  //     uniqueId, //:),
  //   });
  // },
  // completedIPFSCallMint: ({ ipfsResult }: { ipfsResult: AddResult }) => {
  //   const {
  //     nftMintValue: { nftMETA, mintData },
  //   } = store.getState()._router_modalData;
  //   try {
  //     const cid = ipfsResult.cid.toString();
  //     let nftId: string = LoopringAPI?.nftAPI?.ipfsCid0ToNftID(cid) ?? "";
  //     let nftIdView = new BigNumber(nftId ?? "0", 16).toString();
  //     store.dispatch(
  //       updateNFTMintData({
  //         nftMETA: nftMETA,
  //         mintData: {
  //           ...mintData,
  //           cid,
  //           nftIdView,
  //           nftId,
  //         },
  //       })
  //     );
  //     subject.next({
  //       status: MintCommands.SignatureMint,
  //     });
  //   } catch (error: any) {
  //     myLog("handleMintDataChange ->.cid", error);
  //     subject.next({
  //       status: MintCommands.MetaDataSetup,
  //       data: {
  //         error: {
  //           code: UIERROR_CODE.IPFS_CID_TO_NFTID_ERROR,
  //           message: `error on decode ipfsResult: ${ipfsResult}`,
  //         },
  //       },
  //     });
  //   }
  //   // }
  // },
  // goMintConfirm: () => {
  //   subject.next({
  //     status: MintCommands.MintConfirm,
  //   });
  // },
  // signatureMint: (isHardware?: boolean) => {
  //   subject.next({
  //     status: MintCommands.SignatureMint,
  //     data: {
  //       isHardware: isHardware,
  //     },
  //   });
  // },
  // signatureHardware: () => {
  //   subject.next({
  //     status: MintCommands.SignatureHardware,
  //     data: {
  //       isHardware: true,
  //     },
  //   });
  //   // subject.next({
  //   //   status: MintCommands.HardwareSignature,
  //   // });
  // },
  onSocket: () => subject.asObservable(),
}
