import React, { useCallback, useState } from "react";
import { useAccount } from "stores/account/hook";
import {
  AmmSideTypes,
  RawDataAmmItem,
  RawDataTradeItem,
  RawDataTransactionItem,
  TransactionStatus,
} from "@loopring-web/component-lib";
import { volumeToCount, volumeToCountAsBigNumber } from "hooks/help";
import { LoopringAPI } from "api_wrapper";
import store from "stores";
import { AmmTxType, UserTxTypes } from "@loopring-web/loopring-sdk";
import { tradeItemToTableDataItem } from "utils/formatter_tool";

export type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: UserTxTypes[] | string;
};

export function useGetTxs() {
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;

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
        const userTxnList = await LoopringAPI.userAPI.getUserTxs(
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

        const formattedList = userTxnList.userTxs.map((o) => {
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
          };
        });
        setTxs(formattedList);
        setTxsTotal(userTxnList.totalNum);
        setShowLoading(false);
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

export function useGetTrades() {
  const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([]);
  const [userTradesTotal, setUserTradesTotal] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(true);
  const {
    account: { accountId, apiKey },
  } = useAccount();

  const tokenMap = store.getState().tokenMap.tokenMap;

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
        const userTrades = await LoopringAPI.userAPI.getUserTrades(
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

        if (userTrades && userTrades.userTrades) {
          setUserTrades(
            userTrades.userTrades.map((o) => {
              return tradeItemToTableDataItem(o) as RawDataTradeItem;
            })
          );
          setUserTradesTotal(userTrades.totalNum);
        }
        setShowLoading(false);
      }
    },
    [accountId, apiKey, tokenMap]
  );

  // React.useEffect(() => {
  //     getUserTradeList({})
  // }, [getUserTradeList])

  return {
    userTrades,
    userTradesTotal,
    getUserTradeList,
    showLoading,
  };
}

export function useGetAmmRecord() {
  const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>(
    []
  );
  const [showLoading, setShowLoading] = React.useState(true);
  const { accountId, apiKey } = store.getState().account;
  const { tokenMap } = store.getState().tokenMap;

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

  const getAmmpoolList = React.useCallback(async () => {
    if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
      const ammpool = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs(
        {
          accountId,
        },
        apiKey
      );
      if (ammpool && ammpool.userAmmPoolTxs) {
        const result = ammpool.userAmmPoolTxs.map((o) => ({
          side:
            o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
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
      }
    }
  }, [accountId, apiKey, getTokenName]);

  return {
    ammRecordList,
    showLoading,
    getAmmpoolList,
  };
}
