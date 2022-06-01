import { Subject } from "rxjs";
import {
  LoopringAPI,
  store,
  resetNFTMintData,
  updateNFTMintData,
} from "../../index";
import {
  AccountStatus,
  AttributesProperty,
  MetaDataProperty,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { IpfsProvides, ipfsService } from "../ipfs";
import { BigNumber } from "bignumber.js";
import { AddResult } from "ipfs-core-types/types/src/root";
import * as sdk from "@loopring-web/loopring-sdk";

export enum MintCommands {
  MetaDataSetup,
  MintConfirm,
  SignatureMint,
}

const subject = new Subject<{
  status: MintCommands;
  data?: {
    uniqueId?: string;
    [key: string]: any;
  };
}>();

export const mintService = {
  emptyData: () => {
    const {
      account,
      system: { chainId },
    } = store.getState();
    let tokenAddress;
    if (account.readyState === AccountStatus.ACTIVATED && account.accAddress) {
      tokenAddress =
        LoopringAPI.nftAPI
          ?.computeNFTAddress({
            nftOwner: account.accAddress,
            nftFactory: sdk.NFTFactory[chainId],
            nftBaseUri: "",
          })
          .tokenAddress?.toLowerCase() || undefined;
    }
    store.dispatch(resetNFTMintData({ tokenAddress }));
    subject.next({
      status: MintCommands.MetaDataSetup,
      data: {
        emptyData: true,
      },
    });
  },
  backMetaDataSetup: () => {
    subject.next({
      status: MintCommands.MetaDataSetup,
    });
    const {
      nftMintValue: { nftMETA, mintData },
    } = store.getState()._router_modalData;
    store.dispatch(
      updateNFTMintData({
        nftMETA: nftMETA,
        mintData: {
          ...mintData,
          nftIdView: undefined,
          nftId: undefined,
        },
      })
    );
  },
  processingIPFS: ({
    ipfsProvides,
    uniqueId,
  }: {
    ipfsProvides: IpfsProvides;
    uniqueId: string;
  }) => {
    const {
      nftMintValue: { nftMETA },
    } = store.getState()._router_modalData;
    let _nftMETA: any = {
      image: nftMETA.image,
      name: nftMETA.name,
      royalty_percentage: nftMETA.royaltyPercentage, // 0 - 10 for UI
      description: nftMETA.description,
      collection: nftMETA.collection,
    };
    // const attributes = [];
    const obj =
      nftMETA.properties?.reduce(
        (prev, item) => {
          if (!!item.key?.trim() && !!item.value?.trim()) {
            const obj = { trait_type: item.key, value: item.value };
            prev.attributes = [...prev.attributes, obj];
            prev.properties = { ...prev.properties, [item.key]: item.value };
            return prev;
          } else {
            return prev;
          }
        },
        {
          properties: {} as MetaDataProperty,
          attributes: [] as AttributesProperty[],
        }
      ) ?? {};

    _nftMETA = {
      ..._nftMETA,
      ...obj,
    };
    myLog("_nftMETA", _nftMETA);
    ipfsService.addJSON({
      ipfs: ipfsProvides.ipfs,
      json: JSON.stringify(_nftMETA),
      uniqueId, //:),
    });
  },
  completedIPFSCallMint: ({ ipfsResult }: { ipfsResult: AddResult }) => {
    const {
      nftMintValue: { nftMETA, mintData },
    } = store.getState()._router_modalData;
    try {
      const cid = ipfsResult.cid.toString();
      let nftId: string = LoopringAPI?.nftAPI?.ipfsCid0ToNftID(cid) ?? "";
      let nftIdView = new BigNumber(nftId ?? "0", 16).toString();
      store.dispatch(
        updateNFTMintData({
          nftMETA: nftMETA,
          mintData: {
            ...mintData,
            cid,
            nftIdView,
            nftId,
          },
        })
      );
      subject.next({
        status: MintCommands.SignatureMint,
      });
    } catch (error: any) {
      myLog("handleMintDataChange ->.cid", error);
      subject.next({
        status: MintCommands.MetaDataSetup,
        data: {
          error: {
            code: UIERROR_CODE.IPFS_CID_TO_NFTID_ERROR,
            message: `error on decode ipfsResult: ${ipfsResult}`,
          },
        },
      });
    }
    // }
  },
  goMintConfirm: () => {
    subject.next({
      status: MintCommands.MintConfirm,
    });
  },
  signatureMint: (isHardware?: boolean) => {
    subject.next({
      status: MintCommands.SignatureMint,
      data: {
        isHardware: isHardware,
      },
    });
  },
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
};
