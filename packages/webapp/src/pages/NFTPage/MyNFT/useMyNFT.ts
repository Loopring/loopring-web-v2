import {
  CollectionMeta,
  CustomError,
  ErrorMap,
  IPFS_LOOPRING_SITE,
  LOOPRING_NFT_METADATA,
  LOOPRING_TAKE_NFT_META_KET,
  Media,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
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
  const { search, ...rest } = useLocation();
  const { renderNFTPromise, infoDetail, nftListReduce } = useNFTListDeep();
  const history = useHistory();
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

  const { setShowNFTDetail } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const [page, setPage] = useState(-1);

  // const onDetailClose = React.useCallback(() => setIsShow(false), []);

  const onPageChange = (page: number = 1) => {
    setPage(page);
    setIsLoading(true);
    if (page !== -1) {
      updateWalletLayer2NFT({
        page,
        collection: collectionMeta ?? undefined,
      });
    }
    searchParams.set("myNFTPage", page.toString());
    history.replace({ ...rest, search: searchParams.toString() });
  };

  // const getMetaFromContractORIpfs = ({
  //   tokenAddress,
  //   nftId,
  //   isCounterFactualNFT,
  //   deploymentStatus,
  //   metadata,
  // }: sdk.UserNFTBalanceInfo): Promise<LOOPRING_NFT_METADATA | {}> => {
  //   if (!!metadata?.imageSize?.original) {
  //     return Promise.resolve({});
  //   } else if (
  //     LoopringAPI.nftAPI &&
  //     tokenAddress &&
  //     (!metadata?.uri ||
  //       tokenAddress.toLowerCase() ===
  //         "0x1cACC96e5F01e2849E6036F25531A9A064D2FB5f".toLowerCase()) &&
  //     nftId &&
  //     (!isCounterFactualNFT ||
  //       (isCounterFactualNFT &&
  //         deploymentStatus !== sdk.DEPLOYMENT_STATUS.NOT_DEPLOYED))
  //   ) {
  //     const _id = new BigNumber(nftId ?? "", 16);
  //     myLog("nftId", _id, _id.toString());
  //     return LoopringAPI?.nftAPI
  //       ?.getContractNFTMeta({
  //         _id: _id.toString(),
  //         // @ts-ignore
  //         nftId,
  //         web3: connectProvides.usedWeb3 as unknown as Web3,
  //         tokenAddress,
  //       })
  //       .then((response) => {
  //         if ((response as sdk.RESULT_INFO).code) {
  //           console.log("Contract NFTMeta error:", response);
  //           return {};
  //         } else {
  //           return Reflect.ownKeys(LOOPRING_TAKE_NFT_META_KET).reduce(
  //             (prev, key) => {
  //               return { ...prev, [key]: response[key] };
  //             },
  //             {} as LOOPRING_NFT_METADATA
  //           );
  //         }
  //       })
  //       .catch((error) => {
  //         return {};
  //       });
  //   } else {
  //     try {
  //       const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(nftId ?? "");
  //       const uri = IPFS_LOOPRING_SITE + cid;
  //       return fetch(uri)
  //         .then((response) => response.json())
  //         .catch((error) => {
  //           return {};
  //         });
  //     } catch (e) {
  //       return Promise.resolve({});
  //     }
  //   }
  // };

  // const infoDetail = React.useCallback(async (item: Partial<NFTWholeINFO>) => {
  //   const nftData: sdk.NftData = item.nftData as sdk.NftData;
  //   let [nftMap] = await Promise.all([
  //     LoopringAPI.nftAPI?.getInfoForNFTTokens({
  //       nftDatas: [nftData],
  //     }),
  //   ]);
  //   const nftToken: Partial<sdk.NFTTokenInfo> =
  //     nftMap && nftMap[nftData as sdk.NftData]
  //       ? nftMap[nftData as sdk.NftData]
  //       : {};
  //   let tokenInfo: NFTWholeINFO = {
  //     ...item,
  //     ...item.metadata?.base,
  //     ...item.metadata?.extra,
  //     pendingOnSync:
  //       item.metadata?.base && Object.keys(item.metadata?.base)?.length > 0
  //         ? false
  //         : true,
  //     ...nftToken,
  //   } as NFTWholeINFO;
  //   tokenInfo = {
  //     ...tokenInfo,
  //     nftIdView: new BigNumber(tokenInfo.nftId ?? "0", 16).toString(),
  //     nftBalance: tokenInfo.total
  //       ? Number(tokenInfo.total) - Number(tokenInfo.locked ?? 0)
  //       : 0,
  //   };
  //   if (!tokenInfo.name) {
  //     const meta = (await getMetaFromContractORIpfs(
  //       tokenInfo
  //     )) as LOOPRING_NFT_METADATA;
  //     let metadata_tokenId: number | undefined = undefined;
  //     if (meta.hasOwnProperty("tokenId")) {
  //       metadata_tokenId = meta["tokenId"];
  //       delete meta["tokenId"];
  //     }
  //
  //     if (meta && meta !== {} && (meta.name || meta.image)) {
  //       tokenInfo = Object.assign(
  //         metadata_tokenId !== undefined ? { metadata_tokenId } : {},
  //         {
  //           ...tokenInfo,
  //           ...(meta as any),
  //           isFailedLoadMeta: false,
  //         }
  //       );
  //     } else {
  //       tokenInfo = {
  //         ...tokenInfo,
  //         isFailedLoadMeta: true,
  //       };
  //     }
  //   } else {
  //     tokenInfo = {
  //       ...tokenInfo,
  //       isFailedLoadMeta: false,
  //     };
  //   }
  //   if (
  //     tokenInfo.hasOwnProperty("animationUrl") &&
  //     tokenInfo.animationUrl &&
  //     tokenInfo?.animationUrl !== ""
  //   ) {
  //     const req = await fetch(getIPFSString(tokenInfo?.animationUrl, baseURL), {
  //       method: "HEAD",
  //     });
  //     // myLog("animationUrl", "content-type", req.headers.get("content-type"));
  //
  //     if (/audio/gi.test(req?.headers?.get("content-type") ?? "")) {
  //       tokenInfo.__mediaType__ = Media.Audio;
  //     }
  //     if (/video/gi.test(req?.headers?.get("content-type") ?? "")) {
  //       tokenInfo.__mediaType__ = Media.Video;
  //     }
  //     if (/image/gi.test(req?.headers?.get("content-type") ?? "")) {
  //       tokenInfo.__mediaType__ = Media.Image;
  //     }
  //   }
  //
  //   return tokenInfo;
  // }, []);

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      if (item.hasOwnProperty("pendingOnSync")) {
        if (collectionMeta === undefined && LoopringAPI.userAPI) {
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
          const collectionMeta = response.collections?.find((_item: any) => {
            return (
              _item?.contractAddress?.toLowerCase() ===
              item?.tokenAddress?.toLowerCase()
            );
          });
          setShowNFTDetail({ isShow: true, ...item, collectionMeta });
          updateNFTWithdrawData({ ...item, collectionMeta });
          updateNFTTransferData({ ...item, collectionMeta });
        } else {
          setShowNFTDetail({ isShow: true, ...item, collectionMeta });
          updateNFTWithdrawData({ ...item, collectionMeta });
          updateNFTTransferData({ ...item, collectionMeta });
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
          updateNFTDeployData({ ...item, collectionMeta });
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
    renderNFTPromise({ nftLists: walletLayer2NFT }).then((meta: any[]) => {
      const { walletLayer2NFT, page: page_reudex } =
        store.getState().walletLayer2NFT;
      myLog("walletLayer2NFT  async media render", page, page_reudex);
      if (page === page_reudex) {
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
    });
  }, [etherscanBaseUrl, page, walletLayer2NFT]);
  React.useEffect(() => {
    onPageChange(myNFTPage);
  }, [myNFTPage, collectionMeta?.id, collectionMeta?.contractAddress]);

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
    isLoading,
    walletLayer2NFT,
  };
};
