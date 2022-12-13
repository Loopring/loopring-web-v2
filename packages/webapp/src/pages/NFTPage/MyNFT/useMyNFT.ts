import {
  CollectionMeta,
  CustomError,
  ErrorMap,
  IPFS_LOOPRING_SITE,
  LOOPRING_NFT_METADATA,
  LOOPRING_TAKE_NFT_META_KET,
  Media,
  myLog,
  MyNFTFilter,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useEffect, useState } from "react";
import {
  getIPFSString,
  LoopringAPI,
  store,
  useAccount,
} from "@loopring-web/core";
import { useSystem, useNFTListDeep } from "@loopring-web/core";
import { useModalData, useWalletLayer2NFT } from "@loopring-web/core";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import * as sdk from "@loopring-web/loopring-sdk";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useSelector } from "react-redux";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMyNFT = ({
  collectionMeta,
  collectionPage,
  myNFTPage,
}: {
  collectionMeta: CollectionMeta | undefined;
  collectionPage?: number;
  myNFTPage?: number;
}) => {
  const { search, ...rest } = useLocation();
  const { renderNFTPromise, infoDetail, nftListReduce } = useNFTListDeep();
  const history = useHistory();
  const [filter, setFilter] =
    React.useState<MyNFTFilter | undefined>(undefined);
  const searchParams = new URLSearchParams(search);
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { account } = useAccount();
  const {
    status: walletLayer2NFTStatus,
    walletLayer2NFT,
    total,
    page: page_redux,
    collection: collection_redux,
    updateWalletLayer2NFT,
  } = useWalletLayer2NFT();
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const {
    setShowNFTDetail,
    modals: { isShowNFTDetail },
  } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      let _collectionMeta = item.collectionInfo ?? collectionMeta;
      if (
        item.hasOwnProperty("pendingOnSync") &&
        !item.collectionInfo &&
        collectionMeta === undefined &&
        LoopringAPI.userAPI
      ) {
        const response = await LoopringAPI.userAPI
          .getUserNFTCollection(
            {
              accountId: account.accountId.toString(),
              //@ts-ignore
              tokenAddress: item.tokenAddress,
            },
            account.apiKey
          )
          .catch((_error) => {
            throw new CustomError(ErrorMap.TIME_OUT);
          });
        if (
          response &&
          ((response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message)
        ) {
          throw new CustomError(ErrorMap.ERROR_UNKNOWN);
        }
        _collectionMeta = response.collections?.find(
          (_item: CollectionMeta) => {
            return (
              _item?.contractAddress?.toLowerCase() ===
                item?.tokenAddress?.toLowerCase() && _item.baseUri !== ""
            );
          }
        );
      }
      window.scrollTo(0, 0);
      setShowNFTDetail({
        isShow: true,
        ...item,
        collectionInfo: _collectionMeta,
      });
      updateNFTWithdrawData({ ...item, collectionInfo: _collectionMeta });
      updateNFTTransferData({ ...item, collectionInfo: _collectionMeta });
      if (
        item.isCounterFactualNFT &&
        item.deploymentStatus === sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED
      ) {
        await LoopringAPI.userAPI
          ?.getAvailableBroker({ type: 0 })
          .then(({ broker }) => {
            updateNFTDeployData({ broker });
          });
        updateNFTDeployData({ ...item, collectionInfo: _collectionMeta });
      }
    },
    [
      collectionMeta,
      setShowNFTDetail,
      updateNFTDeployData,
      updateNFTTransferData,
      updateNFTWithdrawData,
    ]
  );

  const onNFTReload = async (item: Partial<NFTWholeINFO>, index?: number) => {
    const tokenInfo = await infoDetail(item);
    let _index = index;

    setNFTList((state) => {
      if (index === undefined) {
        _index = state.findIndex(
          (_item) =>
            _item.tokenAddress?.toLowerCase() ===
              item.tokenAddress?.toLowerCase() && _item.nftId === item.nftId
        );
      }
      if (_index) {
        state[_index] = {
          ...state[_index],
          isFailedLoadMeta: false,
          ...tokenInfo,
        };
      }
      return state;
    });
  };
  const walletLayer2NFT2 = useSelector(
    (state: any) => state.walletLayer2NFT.walletLayer2NFT
  );
  React.useEffect(() => {
    setNFTList(nftListReduce(walletLayer2NFT2));
    setIsLoading(false);
    renderNFTPromise({ nftLists: walletLayer2NFT2 as any }).then(
      (meta: any[]) => {
        setNFTList((state) => {
          return walletLayer2NFT2.map((item: any, index: any) => {
            return {
              ...state[index],
              ...meta[index],
              tokenAddress: item.tokenAddress?.toLowerCase(),
              etherscanBaseUrl,
            };
          });
        });
        // }
      }
    );
  }, [walletLayer2NFT2]);
  const location = useLocation();
  const [, , , byListOrCollection] = location.pathname.split("/");
  const page =
    byListOrCollection === "byCollection"
      ? Number(searchParams.get("collectionPage"))
        ? Number(searchParams.get("collectionPage"))
        : 1
      : Number(searchParams.get("myNFTPage"))
      ? Number(searchParams.get("myNFTPage"))
      : 1;
  const [locationState, setLocationState] =
    useState<any | undefined>(undefined);
  useEffect(() => {
    if (
      locationState &&
      locationState.pathname === location.pathname &&
      locationState.search === location.search
    )
      return;
    setLocationState(location);
    const [, , , byListOrCollection] = location.pathname.split("/");
    const searchParams = new URLSearchParams(location.search);
    let subTab;
    let page: number;
    let collectionId: string | undefined;
    let collectionContractAddress: string | undefined;
    if (byListOrCollection === "byCollection") {
      const [, , , , contract, theSubTab] = location.pathname.split("/");
      subTab = theSubTab;
      page = Number(searchParams.get("collectionPage"))
        ? Number(searchParams.get("collectionPage"))
        : 1;
      collectionId =
        contract && contract.split("--") ? contract.split("--")[1] : undefined;
      collectionContractAddress =
        contract && contract.split("--") ? contract.split("--")[0] : undefined;
    } else {
      const [, , , , theSubTab] = location.pathname.split("/");
      subTab = theSubTab;
      page = Number(searchParams.get("myNFTPage"))
        ? Number(searchParams.get("myNFTPage"))
        : 1;
    }
    const filter = subTab
      ? subTab === "fav"
        ? { favourite: true }
        : { hidden: true }
      : { hidden: false };
    setIsLoading(true);
    if (page !== -1) {
      // contract.sp
      updateWalletLayer2NFT({
        page,
        collectionId,
        collectionContractAddress,
        filter,
      });
    }
  }, [location, collectionMeta]);
  return {
    nftList,
    onDetail,
    etherscanBaseUrl,
    onNFTReload,
    // onPageChange,
    total,
    page,
    // filter,
    setFilter,
    isLoading,
    walletLayer2NFT,
  };
};
