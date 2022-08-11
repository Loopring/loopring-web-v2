import { BigNumber } from "bignumber.js";
import React, { useState } from 'react';
import {
  SagaStatus, CollectionMeta
} from '@loopring-web/common-resources';
import {

  useSystem,
  useWalletL2Collection,
} from '../../index';
import { CollectionListProps } from '@loopring-web/component-lib';

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }
BigNumber.config({EXPONENTIAL_AT: 100});

export const useMyCollection = <C extends CollectionMeta>(): CollectionListProps<C> & { copyToastOpen: boolean } => {
  const [collectionList, setCollectionList] = React.useState<C[]>([]);
  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const {
    status: walletL2CollectionStatus,
    walletL2Collection,
    total,
    page: page_reudex,
    updateWalletL2Collection,
  } = useWalletL2Collection();
  const {etherscanBaseUrl} = useSystem();
  const [page, setPage] = useState(1);

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
    setCopyToastOpen,
    collectionList,
    etherscanBaseUrl,
    onPageChange,
    total,
    page,
    isLoading,
    copyToastOpen
  };
};
