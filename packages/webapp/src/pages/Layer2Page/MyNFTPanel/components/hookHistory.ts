import React, { useEffect } from "react";
import { LoopringAPI } from "api_wrapper";
import { BigNumber } from "bignumber.js";
import { NFTTableProps } from "@loopring-web/component-lib";
import { TxType } from "@loopring-web/loopring-sdk";
import { useSystem } from "stores/system";
import { useAccount } from "stores/account";
import { volumeToCountAsBigNumber } from "../../../../hooks/help";

BigNumber.config({ EXPONENTIAL_AT: 100 });
const LimitNFTHistory = 100;

export const useHistoryNFT = () => {
  const { etherscanBaseUrl } = useSystem();
  const { account } = useAccount();
  const [tabIndex, setTabIndex] = React.useState(0);

  const [nftHistory, setNftHistory] = React.useState<{
    transfers: Partial<NFTTableProps>;
    deposits: Partial<NFTTableProps>;
    withdraws: Partial<NFTTableProps>;
  }>({
    transfers: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
      },
      txType: TxType.TRANSFER,
      showloading: false,
    },
    deposits: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
      },
      txType: TxType.DEPOSIT,
      showloading: false,
    },
    withdraws: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
      },
      txType: TxType.OFFCHAIN_WITHDRAWAL,
      showloading: false,
    },
  });
  const getTransferList = React.useCallback(
    async (page = 1, limit = LimitNFTHistory) => {
      if (LoopringAPI.userAPI) {
        const { totalNum, userNFTTransfers } =
          await LoopringAPI.userAPI.getUserNFTTransferHistory(
            {
              accountId: account.accountId,
              // start: (page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        console.log(userNFTTransfers);
        setNftHistory((state) => {
          return {
            ...state,
            transfers: {
              ...state.transfers,
              pagination: {
                pageSize: LimitNFTHistory,
                total: totalNum,
              },
              rawData: userNFTTransfers.map((item) => {
                return {
                  ...item,
                  fee: {
                    unit: item.feeTokenSymbol || "",
                    value: Number(
                      volumeToCountAsBigNumber(
                        item.feeTokenSymbol,
                        item.feeAmount || 0
                      )
                    ),
                  },
                };
              }) as any,
            },
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
              // start: (page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            deposits: {
              ...state.deposits,
              pagination: {
                pageSize: LimitNFTHistory,
                total: totalNum,
              },
              rawData: userNFTDepositHistory.map((item) => {
                return {
                  ...item,
                  fee: {
                    unit: item.feeTokenSymbol || "",
                    value: Number(
                      volumeToCountAsBigNumber(
                        item.feeTokenSymbol,
                        item.feeAmount || 0
                      )
                    ),
                  },
                };
              }) as any,
            },
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
              // start: (page - 1) * limit,
              limit,
            },
            account.apiKey
          );
        setNftHistory((state) => {
          return {
            ...state,
            withdraws: {
              ...state.withdraws,
              pagination: {
                pageSize: LimitNFTHistory,
                total: totalNum,
              },
              rawData: userNFTWithdrawalHistory.map((item) => {
                return {
                  ...item,
                  fee: {
                    unit: item.feeTokenSymbol || "",
                    value: Number(
                      volumeToCountAsBigNumber(
                        item.feeTokenSymbol || "",
                        item.feeAmount || 0
                      )
                    ),
                  },
                };
              }) as any,
            },
          };
        });
      }
    },
    [nftHistory]
  );
  useEffect(() => {
    getWithdrawalList();
    getDepositList();
    getTransferList();
  }, []);

  return {
    nftHistory,
    getTransferList,
    getDepositList,
    getWithdrawalList,
    tabIndex,
    setTabIndex,
  };
};
