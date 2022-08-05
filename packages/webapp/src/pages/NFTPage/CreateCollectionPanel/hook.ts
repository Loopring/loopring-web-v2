import {
  AccountStatus,
  CollectionMeta,
  FeeInfo,
  MintTradeNFT,
  NFTMETA,
  SagaStatus,
} from "@loopring-web/common-resources";
import { ipfsService, useCollectionMeta, useModalData } from "@loopring-web/core";
import { BigNumber } from "bignumber.js";
import { useNFTMeta } from "@loopring-web/core";
import { mintService, useNFTMint } from "@loopring-web/core";
import React from "react";
import { useAccount } from "@loopring-web/core";
import { IpfsFile } from '@loopring-web/component-lib';
const enum MINT_VIEW_STEP {
  METADATA,
  MINT_CONFIRM,
}
BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useCollectionPanel = <T extends CollectionMeta>({isEdit = false}: { isEdit?: boolean }) => {
  // const [currentTab, setCurrentTab] = React.useState<MINT_VIEW_STEP>(
  //   MINT_VIEW_STEP.METADATA
  // );
  const {collectionValue, updateCollectionData} = useModalData();

  const [keys, setKeys] = React.useState<{ [ key: string ]: undefined | IpfsFile }>(() => {
    return isEdit ? {} : {
      banner: undefined,
      name: undefined,
      tileUri: undefined,
      avatar: undefined,
      thumbnail: undefined
    }
  });

  const {account, status: accountStatus} = useAccount();
  const {ipfsProvides} = useCollectionMeta({keys, setKeys});
  const handleOnDataChange = React.useCallback((key: string, value: any) => {
    let uniqueId = key + '|' + Date.now();
    switch (key) {
      case 'banner':
        // updateCollectionData({...collectionValue,banner:value});
        // ipfsService.onSocket()
        ipfsService.addFile({
          ipfs: ipfsProvides.ipfs,
          file: value.file,
          uniqueId: uniqueId,
        });
        setKeys((state) => {
          return {
            ...state, banner: {
              file: value.file,
              isProcessing: true,
              error: undefined,
              uniqueId: uniqueId,
              isUpdateIPFS: true,
              cid: '',
            }
          }
        });
        break;
      case 'name':
        updateCollectionData({...collectionValue, name: value});
        break;
      case 'tileUri':
        ipfsService.addFile({
          ipfs: ipfsProvides.ipfs,
          file: value.file,
          uniqueId: uniqueId,
        });
        setKeys((state) => {
          return {
            ...state, tileUri: {
              file: value.file,
              isProcessing: true,
              error: undefined,
              uniqueId: uniqueId,
              isUpdateIPFS: true,
              cid: '',
            }
          }
        });
        break;
      case 'avatar':
        ipfsService.addFile({
          ipfs: ipfsProvides.ipfs,
          file: value.file,
          uniqueId: uniqueId,
        });
        setKeys((state) => {
          return {
            ...state, avatar: {
              file: value.file,
              isProcessing: true,
              error: undefined,
              uniqueId: uniqueId,
              isUpdateIPFS: true,
              cid: '',
            }
          }
        });
        break;

    }
  }, [collectionValue])

  // const {
  //   onFilesLoad,
  //   onDelete,
  //   ipfsMediaSources,
  //   ipfsProvides,
  //   nftMetaProps,
  //   chargeFeeTokenList,
  //   isFeeNotEnough,
  //   checkFeeIsEnough,
  //   handleFeeChange,
  //   feeInfo,
  //   errorOnMeta,
  //   // resetMETADAT,
  // } = useNFTMeta<Me>({ handleTabChange, nftMintValue });
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      mintService.emptyData();
    }
  }, [accountStatus, account.readyState]);
  // const { nftMintProps } = useNFTMint<Me, Mi, I, C>({
  //   chargeFeeTokenList,
  //   isFeeNotEnough,
  //   checkFeeIsEnough,
  //   handleFeeChange,
  //   feeInfo,
  //   handleTabChange,
  //   nftMintValue,
  // });

  return {
    ipfsProvides,
    keys,
    handleOnDataChange,
  };
};
