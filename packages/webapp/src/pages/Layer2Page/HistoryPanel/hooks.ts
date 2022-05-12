import React, { useCallback, useState } from "react";
import {
  useAccount,
  useTokenMap,
  tradeItemToTableDataItem,
  store,
  LoopringAPI,
} from "@loopring-web/core";
import {
  AmmSideTypes,
  RawDataAmmItem,
  RawDataTradeItem,
  RawDataTransactionItem,
  TransactionStatus,
} from "@loopring-web/component-lib";
import { volumeToCount, volumeToCountAsBigNumber } from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";
import { SDK_ERROR_MAP_TO_UI } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";

export type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: sdk.UserTxTypes[] | string;
};
enum TxTypeAMM {
  Join = "join_pool",
  Exit = "exit_pool",
}

export function useGetTxs(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
  const [txs, setTxs] = useState<RawDataTransactionItem[]>([]);
  const [txsTotal, setTxsTotal] = useState(0);
  const [showLoading, setShowLoading] = useState(false);

  const getTxnStatus = (status: string) =>
    status === ""
      ? TransactionStatus.processing
      : status === "processed"
      ? TransactionStatus.processed
      : status === "processing"
      ? TransactionStatus.processing
      : status === "received"
      ? TransactionStatus.received
      : TransactionStatus.failed;

  const getUserTxnList = useCallback(
    async ({
      tokenSymbol,
      start,
      end,
      limit,
      offset,
      types,
    }: TxsFilterProps) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true);
        const response = await LoopringAPI.userAPI.getUserTxs(
          {
            accountId,
            limit,
            tokenSymbol,
            start,
            end,
            offset,
            types,
          },
          apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
          setToastOpen({
            open: true,
            type: "error",
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        } else {
          const formattedList: RawDataTransactionItem[] = response.userTxs.map(
            (o) => {
              const feePrecision = tokenMap
                ? tokenMap[o.feeTokenSymbol].precision
                : undefined;
              return {
                ...o,
                side: o.txType as any,
                amount: {
                  unit: o.symbol || "",
                  value: Number(volumeToCount(o.symbol, o.amount)),
                },
                fee: {
                  unit: o.feeTokenSymbol || "",
                  value: Number(
                    volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0)
                  ),
                },
                memo: o.memo || "",
                time: o.timestamp,
                txnHash: o.hash,
                status: getTxnStatus(o.status),
                feePrecision: feePrecision,
              } as RawDataTransactionItem;
            }
          );
          setTxs(formattedList);
          setTxsTotal(response.totalNum);
          setShowLoading(false);
        }
      }
    },
    [accountId, apiKey, tokenMap]
  );

  return {
    txs,
    txsTotal,
    showLoading,
    getUserTxnList,
  };
}

export function useGetTrades(setToastOpen: (state: any) => void) {
  const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([]);
  const [userTradesTotal, setUserTradesTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);
  const {
    account: { accountId, apiKey },
  } = useAccount();

  const tokenMap = store.getState().tokenMap.tokenMap;
  const { t } = useTranslation(["error"]);

  const getUserTradeList = React.useCallback(
    async ({ market, orderHash, offset, limit, fromId, fillTypes }) => {
      if (
        LoopringAPI &&
        LoopringAPI.userAPI &&
        accountId &&
        apiKey &&
        tokenMap
      ) {
        setShowLoading(true);
        const response = await LoopringAPI.userAPI.getUserTrades(
          {
            accountId,
            market,
            orderHash,
            offset,
            limit,
            fromId,
            fillTypes,
          },
          apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
          setToastOpen({
            open: true,
            type: "error",
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        } else {
          setUserTrades(
            response.userTrades.map((o) => {
              return tradeItemToTableDataItem(o) as RawDataTradeItem;
            })
          );
          setUserTradesTotal(response.totalNum);
        }
        setShowLoading(false);
      }
    },
    [accountId, apiKey, tokenMap]
  );

  return {
    userTrades,
    userTradesTotal,
    getUserTradeList,
    showLoading,
  };
}

export function useGetAmmRecord(setToastOpen: (props: any) => void) {
  const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>(
    []
  );
  const { t } = useTranslation(["error"]);
  const [ammRecordTotal, setAmmRecordTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);
  const { accountId, apiKey } = store.getState().account;
  const { tokenMap } = useTokenMap();

  const getTokenName = React.useCallback(
    (tokenId?: number) => {
      if (tokenMap) {
        const keys = Object.keys(tokenMap);
        const values = Object.values(tokenMap);
        const index = values.findIndex((o) => o.tokenId === tokenId);
        if (index > -1) {
          return keys[index];
        }
        return "";
      }
      return "";
    },
    [tokenMap]
  );

  const getAmmpoolList = React.useCallback(
    async ({ tokenSymbol, start, end, txTypes, offset, limit }: any) => {
      const ammPoolAddress = tokenMap[tokenSymbol]?.address;
      setShowLoading(true);
      if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
        const response = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs(
          {
            accountId,
            txTypes: txTypes ? TxTypeAMM[txTypes] : "",
            offset,
            start,
            end,
            limit,
            ammPoolAddress,
          },
          apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
          setToastOpen({
            open: true,
            type: "error",
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        } else {
          const result = response.userAmmPoolTxs.map((o) => ({
            side:
              o.txType === sdk.AmmTxType.JOIN
                ? AmmSideTypes.Join
                : AmmSideTypes.Exit,
            amount: {
              from: {
                key: getTokenName(o.poolTokens[0]?.tokenId),
                value: String(
                  volumeToCount(
                    getTokenName(o.poolTokens[0]?.tokenId),
                    o.poolTokens[0]?.actualAmount
                  )
                ),
              },
              to: {
                key: getTokenName(o.poolTokens[1]?.tokenId),
                value: String(
                  volumeToCount(
                    getTokenName(o.poolTokens[1]?.tokenId),
                    o.poolTokens[1]?.actualAmount
                  )
                ),
              },
            },
            lpTokenAmount: String(
              volumeToCount(
                getTokenName(o.lpToken?.tokenId),
                o.lpToken?.actualAmount
              )
            ),
            fee: {
              key: getTokenName(o.poolTokens[1]?.tokenId),
              value: volumeToCount(
                getTokenName(o.poolTokens[1]?.tokenId),
                o.poolTokens[1]?.feeAmount
              )?.toFixed(6),
            },
            time: o.updatedAt,
          }));
          setAmmRecordList(result);
          setShowLoading(false);
          setAmmRecordTotal(response.totalNum);
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, getTokenName]
  );

  return {
    ammRecordList,
    showLoading,
    getAmmpoolList,
    ammRecordTotal,
  };
}
