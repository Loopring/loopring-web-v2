import { Subject } from "rxjs";
import store from "../../stores";
import {
  MetaProperty,
  myLog,
  NFTMETA,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { IpfsProvides, ipfsService } from "../ipfs";
import { LoopringAPI } from "../../api_wrapper";
import { BigNumber } from "bignumber.js";
import { AddResult } from "ipfs-core-types/types/src/root";
import { updateNFTMintData } from "../../stores/router";

export enum MintCommands {
  ProcessingIPFS,
  CompleteIPFS,
  FailedIPFS,
  SignatureMint,
  CancelSignature,
  HardwareSignature,
  Complete,
}
const subject = new Subject<{
  status: MintCommands;
  data?: {
    uniqueId?: string;
    [key: string]: any;
  };
}>();

export const mintService = {
  sendHardwareRetry: (isHardware?: boolean) => {
    subject.next({
      status: MintCommands.HardwareSignature,
    });
  },
  processingIPFS: ({
    ipfsProvides,
    uniqueId,
  }: {
    ipfsProvides: IpfsProvides;
    uniqueId: string;
  }) => {
    subject.next({
      status: MintCommands.ProcessingIPFS,
    });
    const {
      nftMintValue: { nftMETA, mintData },
    } = store.getState()._router_modalData;
    const _nftMETA = {
      image: nftMETA.image,
      name: nftMETA.name,
      royaltyPercentage: nftMETA.royaltyPercentage, // 0 - 10 for UI
      description: nftMETA.description,
      collection: nftMETA.collection,
    } as NFTMETA;
    _nftMETA.properties =
      nftMETA.properties?.reduce((prev, item) => {
        if (!!item.key?.trim() && !!item.value?.trim()) {
          return [...prev, item];
        } else {
          return prev;
        }
      }, [] as Array<MetaProperty>) ?? [];
    myLog("_nftMETA", _nftMETA);

    ipfsService.addJSON({
      ipfs: ipfsProvides.ipfs,
      json: JSON.stringify(_nftMETA),
      uniqueId, //:),
    });
  },
  completedIPFS: ({ ipfsResult }: { ipfsResult: AddResult }) => {
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
            nftIdView,
            nftId,
          },
        })
      );
      subject.next({
        status: MintCommands.CompleteIPFS,
      });
    } catch (error: any) {
      myLog("handleMintDataChange ->.cid", error);
      subject.next({
        status: MintCommands.FailedIPFS,
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
  onSocket: () => subject.asObservable(),
};
