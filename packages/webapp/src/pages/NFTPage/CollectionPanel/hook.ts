import { BigNumber } from "bignumber.js";
import React, { useState } from 'react';
import {
  SagaStatus
} from '@loopring-web/common-resources';
import {

  useSystem,
  useWalletL2Collection,
} from '@loopring-web/core';
import { useOpenModals } from '@loopring-web/component-lib';
import * as sdk from '@loopring-web/loopring-sdk';

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }
BigNumber.config({EXPONENTIAL_AT: 100});

export const useMyCollection = () => {
  const [collectionList, setCollectionList] = React.useState<sdk.NFTCollection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  // const [popItem, setPopItem] =
  //   React.useState<Partial<NFTWholeINFO> | undefined>(undefined);
  const {
    status: walletL2CollectionStatus,
    walletL2Collection,
    total,
    page: page_reudex,
    updateWalletL2Collection,
  } = useWalletL2Collection();
  // const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
  //   useModalData();

  const {setShowNFTDetail} = useOpenModals();
  const {etherscanBaseUrl} = useSystem();
  const [page, setPage] = useState(1);
  // const onDetailClose = React.useCallback(() => setIsShow(false), []);

  const onPageChange = (page: number) => {
    setPage(page);
    setIsLoading(true);
  };


  const renderCollection = React.useCallback(async () => {
    // let mediaPromise: any[] = [];
    setCollectionList(walletL2Collection);
    setIsLoading(false);
  }, [etherscanBaseUrl, page, walletL2Collection]);
  React.useEffect(() => {
    onPageChange(1);
  }, []);
  React.useEffect(() => {
    updateWalletL2Collection({page});
  }, [page]);
  React.useEffect(() => {
    if (walletL2CollectionStatus === SagaStatus.UNSET && page_reudex === page) {
      renderCollection();
    }
  }, [walletL2CollectionStatus, page, page_reudex]);


  return {
    // nftList,
    // popItem,
    // onDetail,

    collectionList,
    etherscanBaseUrl,
    onPageChange,
    total,
    page,
    isLoading,
  };
};
