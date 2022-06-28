import {
  IPFS_LOOPRING_SITE,
  LOOPRING_NFT_METADATA,
  LOOPRING_TAKE_NFT_META_KET,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
import { LoopringAPI, store } from "@loopring-web/core";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "@loopring-web/core";
import {
  NftData,
  NFTTokenInfo,
  DEPLOYMENT_STATUS,
} from "@loopring-web/loopring-sdk";
import { useModalData, useWalletLayer2NFT } from "@loopring-web/core";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import * as loopring_defs from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [popItem, setPopItem] =
    React.useState<Partial<NFTWholeINFO> | undefined>(undefined);
  const {
    status: walletLayer2NFTStatus,
    walletLayer2NFT,
    total,
    page: page_reudex,
    updateWalletLayer2NFT,
  } = useWalletLayer2NFT();
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const { setShowNFTTransfer, setShowNFTWithdraw, setShowNFTDetail } =
    useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const [page, setPage] = useState(1);
  // const onDetailClose = React.useCallback(() => setIsShow(false), []);

  const onPageChange = (page: number) => {
    setPage(page);
    setIsLoading(true);
  };

  const getMetaFromContractORIpfs = ({
    tokenAddress,
    nftId,
    isCounterFactualNFT,
    deploymentStatus,
    metadata,
  }: loopring_defs.UserNFTBalanceInfo): Promise<LOOPRING_NFT_METADATA | {}> => {
    if (!!metadata?.imageSize?.original) {
      return Promise.resolve({});
    } else if (
      LoopringAPI.nftAPI &&
      tokenAddress &&
      (!metadata?.uri ||
        tokenAddress.toLowerCase() ===
          "0x1cACC96e5F01e2849E6036F25531A9A064D2FB5f".toLowerCase()) &&
      nftId &&
      (!isCounterFactualNFT ||
        (isCounterFactualNFT &&
          deploymentStatus !== DEPLOYMENT_STATUS.NOT_DEPLOYED))
    ) {
      const _id = new BigNumber(nftId ?? "", 16);
      myLog("nftId", _id, _id.toString());
      return LoopringAPI?.nftAPI
        ?.getContractNFTMeta({
          _id: _id.toString(),
          // @ts-ignore
          nftId,
          web3: connectProvides.usedWeb3,
          tokenAddress,
        })
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code) {
            console.log("Contract NFTMeta error:", response);
            return {};
          } else {
            return Reflect.ownKeys(LOOPRING_TAKE_NFT_META_KET).reduce(
              (prev, key) => {
                return { ...prev, [key]: response[key] };
              },
              {} as LOOPRING_NFT_METADATA
            );
          }
        })
        .catch((error) => {
          return {};
        });
    } else {
      try {
        const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(nftId ?? "");
        const uri = IPFS_LOOPRING_SITE + cid;
        return fetch(uri)
          .then((response) => response.json())
          .catch((error) => {
            return {};
          });
      } catch (e) {
        return Promise.resolve({});
      }
    }
  };

  const infoDetail = React.useCallback(async (item: Partial<NFTWholeINFO>) => {
    const nftData: NftData = item.nftData as NftData;
    let [nftMap] = await Promise.all([
      LoopringAPI.nftAPI?.getInfoForNFTTokens({
        nftDatas: [nftData],
      }),
    ]);
    const nftToken: Partial<NFTTokenInfo> =
      nftMap && nftMap[nftData as NftData] ? nftMap[nftData as NftData] : {};
    let tokenInfo: NFTWholeINFO = {
      ...item,
      ...nftToken,
    } as NFTWholeINFO;
    tokenInfo = {
      ...tokenInfo,
      nftIdView: new BigNumber(tokenInfo.nftId ?? "0", 16).toString(),
      nftBalance: tokenInfo.total
        ? Number(tokenInfo.total) - Number(tokenInfo.locked ?? 0)
        : 0,
    };
    if (!tokenInfo.name) {
      const meta = (await getMetaFromContractORIpfs(
        tokenInfo
      )) as LOOPRING_NFT_METADATA;
      let metadata_tokenId: number | undefined = undefined;
      if (meta.hasOwnProperty("tokenId")) {
        metadata_tokenId = meta["tokenId"];
        delete meta["tokenId"];
      }

      if (meta && meta !== {} && (meta.name || meta.image)) {
        tokenInfo = Object.assign(
          metadata_tokenId !== undefined ? { metadata_tokenId } : {},
          {
            ...tokenInfo,
            ...(meta as any),
            isFailedLoadMeta: false,
          }
        );
      } else {
        tokenInfo = {
          ...tokenInfo,
          isFailedLoadMeta: true,
        };
      }
    } else {
      tokenInfo = {
        ...tokenInfo,
        isFailedLoadMeta: false,
      };
    }
    return tokenInfo;
  }, []);

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      if (
        item.isCounterFactualNFT &&
        item.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED
      ) {
        await LoopringAPI.userAPI
          ?.getAvailableBroker({ type: 0 })
          .then(({ broker }) => {
            updateNFTDeployData({ broker });
          });
        updateNFTDeployData(item);
      }
      updateNFTWithdrawData(item);
      setPopItem(item);
      updateNFTTransferData(item);
      setShowNFTTransfer({ isShow: false, ...item });
      setShowNFTWithdraw({ isShow: false, ...item });
      setShowNFTDetail({ isShow: true, ...item });
    },
    [
      setShowNFTDetail,
      setShowNFTTransfer,
      setShowNFTWithdraw,
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
    let mediaPromise: any[] = [];

    setNFTList(() => {
      return walletLayer2NFT.map((item) => {
        return {
          ...item,
          nftIdView: new BigNumber(item?.nftId ?? "0", 16).toString(),
          image: item.metadata?.uri,
          ...item.metadata?.base,
          ...item.metadata?.extra,
        };
      }) as any;
    });
    setIsLoading(false);
    for (const nftBalanceItem of walletLayer2NFT) {
      mediaPromise.push(infoDetail(nftBalanceItem));
    }

    Promise.all(mediaPromise).then((meta: any[]) => {
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
  }, [etherscanBaseUrl, infoDetail, page, walletLayer2NFT]);
  React.useEffect(() => {
    onPageChange(1);
  }, []);
  React.useEffect(() => {
    updateWalletLayer2NFT({ page });
  }, [page]);
  React.useEffect(() => {
    if (walletLayer2NFTStatus === SagaStatus.UNSET && page_reudex === page) {
      renderNFT();
    }
  }, [walletLayer2NFTStatus, page, page_reudex]);

  return {
    nftList,
    popItem,
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
