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
import { useModalData } from "stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import { useNFTDeposit } from "hooks/useractions/useNFTDeposit";
import * as loopring_defs from "@loopring-web/loopring-sdk/dist/defs/loopring_defs";

BigNumber.config({ EXPONENTIAL_AT: 100 });
const LimitNFTHistory = 50;
export const useMyNFT = () => {
  const [nftList, setNFTList] = React.useState<Partial<NFTWholeINFO>[]>([]);
  const [nftHistory, setNftHistory] = React.useState<{
    transfers: {
      totalNum: number;
      userNFTTransfers: loopring_defs.UserNFTTransferHistoryTx[];
      page: number;
    };
    deposits: {
      totalNum: number;
      userNFTDepositHistory: loopring_defs.UserNFTDepositHistoryTx[];
      page: number;
    };
    withdraws: {
      totalNum: number;
      userNFTWithdrawalHistory: loopring_defs.UserNFTWithdrawalHistoryTx[];
      page: number;
    };
  }>({
    transfers: { totalNum: 0, userNFTTransfers: [], page: 1 },
    deposits: { totalNum: 0, userNFTDepositHistory: [], page: 1 },
    withdraws: { totalNum: 0, userNFTWithdrawalHistory: [], page: 1 },
  });
  const { account } = useAccount();
  const [isShow, setIsShow] = React.useState(false);
  const [popItem, setPopItem] = React.useState<
    Partial<NFTWholeINFO> | undefined
  >(undefined);
  const { status: walletLayer2Status, nftLayer2 } = useWalletLayer2();
  const { updateNFTTransferData, updateNFTWithdrawData, updateNFTDeployData } =
    useModalData();

  const {
    setShowNFTTransfer,
    setShowNFTWithdraw,
    setShowNFTDeposit,
    modals: { isShowNFTDeposit },
  } = useOpenModals();
  const { etherscanBaseUrl } = useSystem();
  const { nftDepositProps } = useNFTDeposit();
  const onDetailClose = React.useCallback(() => setIsShow(false), []);
  const getTransferList = React.useCallback(
    async (page = 1, limit = LimitNFTHistory) => {
      if (LoopringAPI.userAPI) {
        const { totalNum, userNFTTransfers } =
          await LoopringAPI.userAPI.getUserNFTTransferHistory(
            {
              accountId: account.accountId,
              start: (nftHistory.transfers.page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            transfers: { totalNum, userNFTTransfers, page },
          };
        });
      }
    },
    [nftHistory]
  );
  const getDepositList = React.useCallback(
    async (page = 1, limit = LimitNFTHistory) => {
      if (LoopringAPI.userAPI) {
        const { totalNum, userNFTDepositHistory } =
          await LoopringAPI.userAPI.getUserNFTDepositHistory(
            {
              accountId: account.accountId,
              start: (nftHistory.transfers.page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            deposits: { totalNum, userNFTDepositHistory, page },
          };
        });
      }
    },
    [nftHistory]
  );
  const getWithdrawalList = React.useCallback(
    async (page = 1, limit = LimitNFTHistory) => {
      if (LoopringAPI.userAPI) {
        const { totalNum, userNFTWithdrawalHistory } =
          await LoopringAPI.userAPI.getUserNFTWithdrawalHistory(
            {
              accountId: account.accountId,
              start: (nftHistory.transfers.page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            withdraws: { totalNum, userNFTWithdrawalHistory, page },
          };
        });
      }
    },
    [nftHistory]
  );
  const popNFTDeposit = React.useCallback(
    () => setShowNFTDeposit({ isShow: true }),
    []
  );
  const onNFTDepositClose = React.useCallback(
    () => setShowNFTDeposit({ isShow: false }),
    []
  );

  const onDetail = React.useCallback(
    async (item: Partial<NFTWholeINFO>) => {
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
        isDeployed,
        ...nftToken,
      } as NFTWholeINFO;
      const _id = new BigNumber(tokenInfo.nftId ?? "0", 16);
      tokenInfo = {
        ...tokenInfo,
        nftIdView: _id.toString(),
        nftBalance: tokenInfo.total ? Number(tokenInfo.total) : 0,
      };
      if (!isDeployed) {
        await LoopringAPI.userAPI?.getAvailableBroker().then(({ broker }) => {
          updateNFTDeployData({ broker });
        });
        updateNFTDeployData(tokenInfo);
      } else {
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
    getTransferList();
    getDepositList();
    getWithdrawalList();
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
        return {
          ...item,
          ...meta[index],
          etherscanBaseUrl,
        };
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
    isShowNFTDeposit,
    nftDepositProps,
    onNFTDepositClose,
    popNFTDeposit,
    nftHistory,
    getTransferList,
    getDepositList,
    getWithdrawalList,
  };
};
