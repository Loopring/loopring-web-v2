import {
  AccountStatus,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import {
  LOOPRING_URLs,
  NftData,
  NFTTokenInfo,
  DEPLOYMENT_STATUS,
} from "@loopring-web/loopring-sdk";
import { useModalData } from "stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import { useWalletLayer2NFT } from "stores/walletLayer2NFT";
import * as loopring_defs from "@loopring-web/loopring-sdk";
import { useAccount } from "stores/account";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const [isShow, setIsShow] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { account, status: accountStatus } = useAccount();
  const [popItem, setPopItem] =
    React.useState<Partial<NFTWholeINFO> | undefined>(undefined);
  const {
    status: walletLayer2NFTStatus,
    walletLayer2NFT,
    total,
    updateWalletLayer2NFT,
  } = useWalletLayer2NFT();
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const {
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeposit,
    setShowNFTMint,
    modals: { isShowNFTDeposit, isShowNFTMint },
  } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const [page, setPage] = useState(1);
  const onDetailClose = React.useCallback(() => setIsShow(false), []);
  const popNFTDeposit = React.useCallback(
    () => setShowNFTDeposit({ isShow: true }),
    []
  );

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
  }: loopring_defs.UserNFTBalanceInfo): Promise<any> => {
    if (!!metadata?.imageSize?.original) {
      return Promise.resolve({});
    } else if (
      LoopringAPI.nftAPI &&
      tokenAddress &&
      (!metadata?.imageSize?.original ||
        tokenAddress.toLowerCase() ==
          "0x1cACC96e5F01e2849E6036F25531A9A064D2FB5f".toLowerCase()) &&
      nftId &&
      (!isCounterFactualNFT ||
        (isCounterFactualNFT &&
          deploymentStatus !== DEPLOYMENT_STATUS.NOT_DEPLOYED))
    ) {
      const _id = new BigNumber(nftId ?? "", 16);
      myLog("nftId", _id, _id.toString());
      //TODO move to server cache
      return LoopringAPI?.nftAPI
        ?.getContractNFTMeta({
          _id: _id.toString(),
          // @ts-ignore
          nftId,
          web3: connectProvides.usedWeb3,
          tokenAddress,
        })
        .catch((error) => {
          return {};
        });
    } else {
      myLog("ipfsNftIDToCid", nftId);
      try {
        const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(nftId ?? "");
        const uri = LOOPRING_URLs.IPFS_META_URL + cid;
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

  const popNFTMint = React.useCallback(
    () => setShowNFTMint({ isShow: true }),
    []
  );

  const infoDetail = async (item: Partial<NFTWholeINFO>) => {
    const nftData: NftData = item.nftData as NftData;
    let [nftMap] = await Promise.all([
      LoopringAPI?.nftAPI?.getInfoForNFTTokens({
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
      const meta = await getMetaFromContractORIpfs(tokenInfo);
      if (meta && (meta.name || meta.image)) {
        tokenInfo = {
          ...tokenInfo,
          ...meta,
          isFailedLoadMeta: false,
        };
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
  };

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      if (
        item.isCounterFactualNFT &&
        item.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED
      ) {
        await LoopringAPI.userAPI?.getAvailableBroker().then(({ broker }) => {
          updateNFTDeployData({ broker });
        });
        updateNFTDeployData(item);
      }
      updateNFTWithdrawData(item);
      setPopItem(item);
      updateNFTTransferData(item);
      setShowNFTTransfer({ isShow: false, ...item });
      setShowNFTWithdraw({ isShow: false, ...item });
      setIsShow(true);
    },
    [setShowNFTTransfer, updateNFTTransferData, updateNFTWithdrawData]
  );
  const onNFTError = (item: Partial<NFTWholeINFO>, index?: number) => {
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
          isFailedLoadMeta: true,
        };
      }
      return state;
    });
  };
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

  const initNFT = React.useCallback(async () => {
    let mediaPromise: any[] = [];
    setNFTList(() => {
      return walletLayer2NFT.map((item) => {
        return {
          ...item,
          nftIdView: new BigNumber(item?.nftId ?? "0", 16).toString(),
          image: item.metadata?.uri,
          ...item.metadata?.base,
        };
      });
    });
    setIsLoading(false);
    for (const nftBalanceItem of walletLayer2NFT) {
      mediaPromise.push(infoDetail(nftBalanceItem));
    }

    // const meta: any[] = await
    Promise.all(mediaPromise).then((meta: any[]) => {
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
    });
  }, [etherscanBaseUrl, walletLayer2NFT]);
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      updateWalletLayer2NFT({ page });
    }
  }, [page, accountStatus, account.readyState]);
  React.useEffect(() => {
    if (walletLayer2NFTStatus === SagaStatus.UNSET) {
      initNFT();
    }
  }, [walletLayer2NFTStatus]);

  return {
    nftList,
    isShow,
    popItem,
    onDetail,
    etherscanBaseUrl,
    onDetailClose,
    isShowNFTDeposit,
    isShowNFTMint,
    popNFTDeposit,
    popNFTMint,
    onNFTError,
    onNFTReload,
    onPageChange,
    total,
    page,
    isLoading,
    walletLayer2NFT,
  };
};
