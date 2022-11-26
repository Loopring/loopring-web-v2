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
import { useSearchParam } from "react-use";

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
  // const match: any = useRouteMatch("/NFT/assetsNFT/:tab?/:contract?");
  // const a = useSearchParam("myNFTPage")
  // console.log(`useSearchParam("myNFTPage")`, a)
  // searchParams?.get("myNFTPage")
  //                     ? Number(searchParams?.get("myNFTPage"))
  //                     : 1
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
  const [page, setPage] = useState(-1);

  // const onDetailClose = React.useCallback(() => setIsShow(false), []);
  
  const onPageChange = React.useCallback((page: number = 1) => {
    // const theFilter = filter ?? {hidden: false}
    // filter
    // setFilter(theFilter);
    
    
    
    // setPage(page);
    // setIsLoading(true);
    // if (page !== -1) {
    //   updateWalletLayer2NFT({
    //     page,
    //     collection: collectionMeta ?? undefined,
    //     filter,
    //   });
    // }
    // searchParams.set("myNFTPage", page.toString());
    // history.replace({ ...rest, search: searchParams.toString() });



  }, [collectionMeta, filter]) 
  // React.useEffect(() => {
  //   console.log('filter', filter)
  //   onPageChange(myNFTPage, filter);
  // }, [myNFTPage, collectionMeta?.id, collectionMeta?.contractAddress, filter]);

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      if (item.hasOwnProperty("pendingOnSync")) {
        let _collectionMeta = item.collectionInfo ?? collectionMeta;
        if (
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
          setShowNFTDetail({
            isShow: true,
            ...item,
            collectionInfo: collectionMeta,
          });
          updateNFTWithdrawData({ ...item, collectionInfo: collectionMeta });
          updateNFTTransferData({ ...item, collectionInfo: collectionMeta });
        } else {
          setShowNFTDetail({
            isShow: true,
            ...item,
            collectionInfo: _collectionMeta,
          });
          updateNFTWithdrawData({ ...item, collectionInfo: _collectionMeta });
          updateNFTTransferData({ ...item, collectionInfo: _collectionMeta });
        }
        // setPopItem({ ...item, collectionMeta });
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

  const renderNFT = React.useCallback(async () => {
    setNFTList(nftListReduce(walletLayer2NFT));
    setIsLoading(false);
    renderNFTPromise({ nftLists: walletLayer2NFT as any }).then(
      (meta: any[]) => {
        const {
          walletLayer2NFT,
          page: page_reudex,
          filter: filter_redux,
        } = store.getState().walletLayer2NFT;
        myLog("walletLayer2NFT  async media render", page, page_reudex);
        if (
          page === page_reudex &&
          (!filter ||
            (filter &&
              filter?.favourite == filter_redux?.favourite &&
              filter?.hidden == filter_redux?.hidden))
        ) {
          setNFTList((state) => {
            return walletLayer2NFT.map((item, index) => {
              return {
                ...state[index],
                ...meta[index],
                tokenAddress: item.tokenAddress?.toLowerCase(),
                etherscanBaseUrl,
              };
            });
          });
        }
      }
    );
  }, [etherscanBaseUrl, page, walletLayer2NFT, filter]);
  const location = useLocation()
  // const match = useRouteMatch('')
  // const match = useRouteMatch("/NFT/assetsNFT/:mainTab?")
  //   // const tabParams = match?.params['mainTab'] === 'byCollection' 
  //   //   ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['tab']
  //   //   : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params['tab']
  // const isByCollection = match?.params['mainTab'] === 'byCollection'
  // const tabParams = isByCollection
  //   ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['tab']
  //   : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params['tab']
  // const contractParam = isByCollection
  //     ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['contract']
      // : undefined
  const [locationState, setLocationState] = useState<any | undefined>(undefined)
  useEffect(() => {
    if (locationState && locationState.pathname === location.pathname && locationState.search === location.search) return;
    setLocationState(location)
    const [, , , byListOrCollection] = location.pathname.split('/')
    const searchParams = new URLSearchParams(location.search)
    let subTab
    let page: number
    if (byListOrCollection === 'byCollection') {
      const [, , , , contract, theSubTab] = location.pathname.split('/')
      subTab = theSubTab
      // collectionPage=1&myNFTPage=1
      page = Number(searchParams.get('collectionPage')) ?? 1
    } else {
      const [, , , , theSubTab] = location.pathname.split('/')
      subTab = theSubTab
      page = Number(searchParams.get('myNFTPage')) ?? 1
      // searchParams.get('myNFTPage')
    }
    const filter = subTab 
      ? (subTab === 'fav' ? { favourite: true } : { hidden: true })
      : { hidden: false };
    // switch (value) {
      //   case "all":
      //     if (tab === "all") {
      //       return;
      //     }
      //     _filter = { hidden: false };
      //     break;
      //   case sdk.NFT_PREFERENCE_TYPE.fav:
      //     if (tab === sdk.NFT_PREFERENCE_TYPE.fav) {
      //       return;
      //     }
      //     _filter = { favourite: true, hidden: false };
      //     break;
      //   case sdk.NFT_PREFERENCE_TYPE.hide:
      //     if (tab === sdk.NFT_PREFERENCE_TYPE.hide) {
      //       return;
      //     }
      //     _filter = { hidden: true };
      //     break;
      // }

    
    
    // location.pathname
    // const q = parseInt(params.get("q"));
    

    // setPage(page);
    setIsLoading(true);
    debugger
    if (page !== -1) {
      updateWalletLayer2NFT({
        page,
        collection: collectionMeta ?? undefined,
        filter,
      });
    }
    // searchParams.set("myNFTPage", page.toString());
    // history.replace({ ...rest, search: searchParams.toString() });
  }, [location])

  React.useEffect(() => {
    if (
      walletLayer2NFTStatus === SagaStatus.UNSET &&
      page_redux === page &&
      ((collectionMeta === undefined && collection_redux === undefined) ||
        (collection_redux?.id == collectionMeta?.id &&
          collection_redux?.contractAddress == collectionMeta?.contractAddress))
    ) {
      renderNFT();
    }
  }, [
    walletLayer2NFTStatus,
    page,
    collectionMeta,
    page_redux,
    collection_redux,
  ]);

  return {
    nftList,
    onDetail,
    etherscanBaseUrl,
    onNFTReload,
    onPageChange,
    total,
    page,
    // filter,
    setFilter,
    isLoading,
    walletLayer2NFT,
  };
};
