import { Subject } from "rxjs";
import store from "../../stores";
import { MetaProperty, myLog, NFTMETA } from "@loopring-web/common-resources";
import { IpfsProvides, ipfsService } from "../ipfs";

export enum MintCommands {
  ProcessingIPFS,
  //CompleteIPFS,
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
    const _nftMETA = { ...nftMETA } as NFTMETA;
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
  // processingIPFS: (data: any) => {
  //   subject.next({
  //     status: MintCommands.ProcessingIPFS,
  //     data,
  //   });
  // },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
