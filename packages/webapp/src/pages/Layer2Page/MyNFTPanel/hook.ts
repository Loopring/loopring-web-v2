import {
  AccountStatus,
  myLog,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import { useAccount } from "stores/account";
import React from "react";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import { useWalletLayer2 } from "stores/walletLayer2";
import { NftData, NFTTokenInfo } from "@loopring-web/loopring-sdk";
import { useModalData } from "../../../stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
BigNumber.config({ EXPONENTIAL_AT: 100 });

export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const { account } = useAccount();
  const [isShow, setIsShow] = React.useState(false);
  const [popItem, setPopItem] = React.useState<
    Partial<NFTWholeINFO> | undefined
  >(undefined);
  const { status: walletLayer2Status, nftLayer2 } = useWalletLayer2();
  const { updateNFTTransferData, updateNFTWithdrawData } = useModalData();
  const { setShowNFTTransfer } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();

  const onDetailClose = React.useCallback(() => setIsShow(false), []);

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
      const nftData: NftData = item.nftData as NftData;
      const nftMap = await LoopringAPI?.nftAPI?.getInfoForNFTTokens({
        nftDatas:
          // [item.tokenAddress]
          [nftData],
      });
      const nftToken: Partial<NFTTokenInfo> =
        nftMap && nftMap[nftData as NftData] ? nftMap[nftData as NftData] : {};
      let tokenInfo: NFTWholeINFO = { ...item, ...nftToken } as NFTWholeINFO;
      const _id = new BigNumber(tokenInfo.nftId ?? "0", 16);
      tokenInfo = {
        ...tokenInfo,
        nftIdView: _id.toString(),
        nftBalance: tokenInfo.total ? Number(tokenInfo.total) : 0,
      };
      setPopItem(tokenInfo);
      updateNFTTransferData(tokenInfo);
      updateNFTWithdrawData(tokenInfo);
      setShowNFTTransfer({ isShow: false, ...tokenInfo });
      setIsShow(true);
    },
    [setShowNFTTransfer, updateNFTTransferData, updateNFTWithdrawData]
  );

  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      walletLayer2Status === SagaStatus.UNSET
    ) {
      initNFT();
    }
  }, [walletLayer2Status]);
  const initNFT = React.useCallback(async () => {
    let mediaPromise: any[] = [];
    for (const { nftId, tokenAddress } of nftLayer2) {
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
    const meta: any[] = await Promise.all(mediaPromise);
    setNFTList(
      nftLayer2.map((item, index) => {
        return { ...item, ...meta[index], etherscanBaseUrl };
      })
    );
  }, [etherscanBaseUrl, nftLayer2]);

  return {
    nftList,
    isShow,
    popItem,
    onDetail,
    etherscanBaseUrl,
    onDetailClose,
  };
};
