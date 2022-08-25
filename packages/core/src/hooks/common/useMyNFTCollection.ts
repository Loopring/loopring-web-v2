import { CollectionMeta, SagaStatus } from "@loopring-web/common-resources";
import React from "react";
import {
  getIPFSString,
  LoopringAPI,
  makeMeta,
  useSystem,
  useWalletL2NFTCollection,
} from "../../index";
import { useLocation } from "react-router-dom";

export const useMyNFTCollection = <C extends CollectionMeta>() => {
  const { etherscanBaseUrl, baseURL } = useSystem();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const defaultPage = Number(searchParams.has("collectionPage")) ?? 1;
  const [page, setPage] = React.useState(defaultPage ? defaultPage : 1);
  const [collectionList, setCollectionList] = React.useState<C[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copyToastOpen, setCopyToastOpen] = React.useState({
    isShow: false,
    type: "json",
  });
  const domain = LoopringAPI.delegate?.getCollectionDomain() ?? "";

  const {
    status: walletL2NFTCollectionStatus,
    total,
    walletL2NFTCollection,
    page: page_reudex,
    updateWalletL2NFTCollection,
  } = useWalletL2NFTCollection();

  const onPageChange = (page: number) => {
    setPage(page);
    setIsLoading(true);
    updateWalletL2NFTCollection({ page });
  };

  const renderCollection = React.useCallback(async () => {
    // let mediaPromise: any[] = [];
    const list = walletL2NFTCollection.map((item: any) => {
      return {
        ...item.collection,
        count: item.count,
      };
    });
    setCollectionList(list as C[]);
    setIsLoading(false);
  }, [etherscanBaseUrl, page, walletL2NFTCollection]);

  React.useEffect(() => {
    onPageChange(defaultPage ? defaultPage : 1);
  }, []);

  React.useEffect(() => {
    if (
      walletL2NFTCollectionStatus === SagaStatus.UNSET &&
      page_reudex === page
    ) {
      // const { walletL2NFTCollection } = store.getState().walletL2NFTCollection;
      renderCollection();
    }
  }, [walletL2NFTCollectionStatus, page, page_reudex]);

  return {
    setCopyToastOpen,
    collectionList,
    etherscanBaseUrl,
    onPageChange,
    domain,
    makeMeta,
    total,
    page,
    isLoading,
    copyToastOpen,
    baseURL,
    getIPFSString,
  };
};
