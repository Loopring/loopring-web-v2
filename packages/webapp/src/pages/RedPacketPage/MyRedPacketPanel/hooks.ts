import { useTranslation } from "react-i18next";
import {
  LoopringAPI,
  useAccount,
  useTokenMap,
  volumeToCountAsBigNumber,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  CoinInfo,
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import {
  RawDataRedPacketReceivesItem,
  RawDataRedPacketRecordsItem,
} from "@loopring-web/component-lib";

export const useMyRedPacketRecordTransaction = <
  R extends RawDataRedPacketRecordsItem
>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [myRedPacketRecordList, setMyRedPacketRecordList] = React.useState<R[]>(
    []
  );
  const { idIndex, coinMap, tokenMap } = useTokenMap();
  const [myRedPacketRecordTotal, setMyRedPacketRecordTotal] = React.useState(0);
  // const { marketMap: myRedPacketRecordMarketMap } = useMyRedPacketRecordMap();
  // const [pagination, setMyRedPacketRecordPagination] = React.useState<{
  //   pageSize: number;
  //   total: number;
  // }>({
  //   pageSize: Limit,
  //   total: 0,
  // });
  const [showLoading, setShowLoading] = React.useState(true);

  const getMyRedPacketRecordTxList = React.useCallback(
    async ({ offset, limit }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
              {
                senderId: accountId,
                scopes: sdk.LuckyTokenViewType,
                statuses: `0,1,2,3,4`,
                official: false,
              } as any,
              apiKey
            );
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
            if (setToastOpen) {
              setToastOpen({
                open: true,
                type: "error",
                content:
                  "error : " + errorItem
                    ? t(errorItem.messageKey)
                    : (response as sdk.RESULT_INFO).message,
              });
            }
          } else {
            setMyRedPacketRecordTotal((response as any)?.totalNum);
            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (
                prev: RawDataRedPacketRecordsItem[],
                item: sdk.LuckyTokenItemForReceive
              ) => {
                const token = tokenMap[idIndex[item.tokenId]];
                const tokenInfo = coinMap[token.symbol ?? ""];
                const type = coinMap[idIndex[item.tokenId] ?? ""];
                const totalAmount = getValuePrecisionThousand(
                  volumeToCountAsBigNumber(
                    token.symbol,
                    item.tokenAmount.totalAmount
                  ),
                  token.precision,
                  token.precision,
                  token.precision,
                  false
                );
                const remainAmount = getValuePrecisionThousand(
                  volumeToCountAsBigNumber(
                    token.symbol,
                    item.tokenAmount.remainAmount
                  ),
                  token.precision,
                  token.precision,
                  token.precision,
                  false
                );

                prev.push({
                  token: tokenInfo as CoinInfo<any>,
                  type: item.type.scope, //sdk.LuckyTokenItemStatus
                  status: item.status,
                  validSince: item.validSince,
                  validUntil: item.validSince,
                  totalCount: item.tokenAmount.totalCount,
                  remainCount: item.tokenAmount.remainCount,
                  totalAmount,
                  remainAmount,
                  createdAt: item.createdAt,
                  rawData: item,
                });
                return prev;
              },
              [] as RawDataRedPacketRecordsItem[]
            );

            setMyRedPacketRecordList(result);
          }
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t, idIndex]
  );
  const onItemClick = () => {};

  return {
    // page,
    onItemClick,
    myRedPacketRecordList,
    showLoading,
    getMyRedPacketRecordTxList,
    myRedPacketRecordTotal,
    // pagination,
    // updateTickersUI,
  };
};

export const useMyRedPacketReceiveTransaction = <
  R extends RawDataRedPacketReceivesItem
>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [redPacketReceiveList, setRedPacketReceiveList] = React.useState<R[]>(
    []
  );
  const { idIndex } = useTokenMap();
  const [redPacketReceiveTotal, setRedPacketReceiveTotal] = React.useState(0);
  // const { marketMap: myRedPacketReceiveMarketMap } = useMyRedPacketReceiveMap();
  // const [pagination, setMyRedPacketReceivePagination] = React.useState<{
  //   pageSize: number;
  //   total: number;
  // }>({
  //   pageSize: Limit,
  //   total: 0,
  // });
  const [showLoading, setShowLoading] = React.useState(true);

  const getRedPacketReceiveList = React.useCallback(
    async ({ offset, limit }: any) => {
      setShowLoading(true);
      if (LoopringAPI.luckTokenAPI && accountId) {
        if (apiKey) {
          const response =
            await LoopringAPI.luckTokenAPI.getLuckTokenClaimHistory(
              {
                offset,
                limit,
              } as any,
              apiKey
            );
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
            if (setToastOpen) {
              setToastOpen({
                open: true,
                type: "error",
                content:
                  "error : " + errorItem
                    ? t(errorItem.messageKey)
                    : (response as sdk.RESULT_INFO).message,
              });
            }
          } else {
            setRedPacketReceiveTotal((response as any)?.totalNum);

            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (prev: R[], item: sdk.LuckyTokenItemForReceive) => {
                prev.push(item);
                return prev;
              },
              [] as R[]
            );

            setRedPacketReceiveList(result);
            // setShowLoading(false);
            // setMyRedPacketReceiveTotal((response as any).totalNum);
            // // setMyRedPacketReceivePagination({
            //   pageSize: limit,
            //   total: (response as any).totalNum,
            // });
          }
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t, idIndex]
  );

  return {
    // page,
    redPacketReceiveList,
    showLoading,
    getRedPacketReceiveList,
    redPacketReceiveTotal,
    // pagination,
    // updateTickersUI,
  };
};
