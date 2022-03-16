import {
  Layer1Action,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import {
  ChainId,
  LOOPRING_URLs,
  NftData,
  NFTTokenInfo,
} from "@loopring-web/loopring-sdk";
import { useModalData } from "stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import { useNFTDeposit } from "hooks/useractions/useNFTDeposit";
import { useNFTMint } from "hooks/useractions/useNFTMint";
import { useWalletLayer2NFT } from "stores/walletLayer2NFT";
import { useLayer1Store } from "../../../stores/localStore/layer1Store";
import store from "../../../stores";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const [isShow, setIsShow] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [popItem, setPopItem] =
    React.useState<Partial<NFTWholeINFO> | undefined>(undefined);
  const {
    status: walletLayer2NFTStatus,
    walletLayer2NFT,
    total,
    updateWalletLayer2NFT,
  } = useWalletLayer2NFT();
  const { clearOneItem } = useLayer1Store();

  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const {
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeposit,
    setShowNFTMint,
    modals: { isShowNFTDeposit, isShowNFTMint },
  } = useOpenModals();
  const { etherscanBaseUrl, chainId } = useSystem();
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
  const popNFTMint = React.useCallback(
    () => setShowNFTMint({ isShow: true }),
    []
  );

  const infoDetail = async (item: Partial<NFTWholeINFO>) => {
    const layer1ActionHistory = store.getState().localStore.layer1ActionHistory;

    const nftData: NftData = item.nftData as NftData;
    let [nftMap, isDeployed] = await Promise.all([
      LoopringAPI?.nftAPI?.getInfoForNFTTokens({
        nftDatas:
          // [item.tokenAddress]
          [nftData],
      }),
      LoopringAPI?.delegate
        ?.getCode(item.tokenAddress ?? "")
        .then(({ result: code }: any) => {
          return code && code.startsWith("0x") && code.length > 2;
        }),
    ]);
    const nftToken: Partial<NFTTokenInfo> =
      nftMap && nftMap[nftData as NftData] ? nftMap[nftData as NftData] : {};
    // isDeployed = !isDeployed;
    let tokenInfo: NFTWholeINFO = {
      ...item,
      isDeployed: isDeployed ? "yes" : "no",
      ...nftToken,
    } as NFTWholeINFO;
    const _id = new BigNumber(tokenInfo.nftId ?? "0", 16);
    tokenInfo = {
      ...tokenInfo,
      nftIdView: _id.toString(),
      nftBalance: tokenInfo.total ? Number(tokenInfo.total) : 0,
    };
    if (
      layer1ActionHistory[chainId] &&
      layer1ActionHistory[chainId][Layer1Action.NFTDeploy] &&
      layer1ActionHistory[chainId][Layer1Action.NFTDeploy][
        tokenInfo.tokenAddress.toLowerCase()
      ]
    ) {
      if (tokenInfo.isDeployed === "no") {
        tokenInfo = {
          ...tokenInfo,
          isDeployed: "unknown",
        };
      } else if (tokenInfo.isDeployed === "yes") {
        clearOneItem({
          chainId: chainId as ChainId,
          uniqueId: tokenInfo.tokenAddress.toLowerCase(),
          domain: Layer1Action.NFTDeploy,
        });
      }
    }
    if (["no", "unknown"].includes(tokenInfo.isDeployed)) {
      try {
        const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(tokenInfo.nftId);
        const uri = LOOPRING_URLs.IPFS_META_URL + cid;
        const meta = await fetch(uri)
          .then((response) => response.json())
          .catch((error) => {
            throw error;
          });

        tokenInfo = {
          ...tokenInfo,
          ...meta,
          isFailedLoadMeta: false,
        };
      } catch (error) {
        tokenInfo = {
          ...tokenInfo,
          isFailedLoadMeta: false,
        };
        myLog("load IPFS cid error", error);
      }
    } else if (!tokenInfo.name) {
      const meta = await LoopringAPI?.nftAPI?.getContractNFTMeta({
        _id: _id.toString(),
        nftId: tokenInfo.nftId,
        web3: connectProvides.usedWeb3,
        tokenAddress: tokenInfo.tokenAddress,
      });
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
      const tokenInfo = await infoDetail(item);
      if (tokenInfo.isDeployed === "no") {
        await LoopringAPI.userAPI?.getAvailableBroker().then(({ broker }) => {
          updateNFTDeployData({ broker });
        });
        updateNFTDeployData(tokenInfo);
      } else if (tokenInfo.isDeployed === "yes") {
        updateNFTWithdrawData(tokenInfo);
      }
      setPopItem(tokenInfo);
      updateNFTTransferData(tokenInfo);
      setShowNFTTransfer({ isShow: false, ...tokenInfo });
      setShowNFTWithdraw({ isShow: false, ...tokenInfo });
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
  // const loadNFT = React.useCallback(async  (item: Partial<NFTWholeINFO>, index:number)=>{
  //
  // },[])

  React.useEffect(() => {
    updateWalletLayer2NFT({ page });
  }, [page]);
  const initNFT = React.useCallback(async () => {
    let mediaPromise: any[] = [];
    for (const { nftId, tokenAddress } of walletLayer2NFT) {
      if (tokenAddress && nftId) {
        const _id = new BigNumber(nftId ?? "", 16);
        myLog("nftId", _id, _id.toString());
        mediaPromise.push(
          LoopringAPI?.nftAPI?.getContractNFTMeta({
            _id: _id.toString(),
            // @ts-ignore
            nftId,
            web3: connectProvides.usedWeb3,
            tokenAddress,
          })
        );
      }
    }
    try {
      const meta: any[] = await Promise.all(mediaPromise);
      setIsLoading(false);
      setNFTList(
        walletLayer2NFT.map((item, index) => {
          return {
            ...item,
            ...meta[index],
            tokenAddress: item.tokenAddress?.toLowerCase(),
            etherscanBaseUrl,
          };
        })
      );
    } catch (eror) {
      setIsLoading(false);
    }
  }, [etherscanBaseUrl, walletLayer2NFT]);
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
