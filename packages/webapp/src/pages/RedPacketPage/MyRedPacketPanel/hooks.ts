import { useTranslation } from "react-i18next";
import { LoopringAPI, useAccount, useTokenMap } from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import { SDK_ERROR_MAP_TO_UI } from "@loopring-web/common-resources";
import { RawDataRedPacketRecordsItem } from "@loopring-web/component-lib";

export const useMyRedPacketRecordTransaction = <R extends any>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [myRedPacketRecordList, setMyRedPacketRecordList] = React.useState<R[]>(
    []
  );
  const { idIndex } = useTokenMap();
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
                prev.push(item);
                return prev;
              },
              [] as RawDataRedPacketRecordsItem[]
            );

            setMyRedPacketRecordList(result);
            // setShowLoading(false);
            // setMyRedPacketRecordTotal((response as any).totalNum);
            // // setMyRedPacketRecordPagination({
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
    myRedPacketRecordList,
    showLoading,
    getMyRedPacketRecordTxList,
    myRedPacketRecordTotal,
    // pagination,
    // updateTickersUI,
  };
};

export const useMyRedPacketReceiveTransaction = <R extends any>(
  setToastOpen: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();

  const [myRedPacketReceiveList, setMyRedPacketReceiveList] = React.useState<
    R[]
  >([]);
  const { idIndex } = useTokenMap();
  const [myRedPacketReceiveTotal, setMyRedPacketReceiveTotal] =
    React.useState(0);
  // const { marketMap: myRedPacketReceiveMarketMap } = useMyRedPacketReceiveMap();
  // const [pagination, setMyRedPacketReceivePagination] = React.useState<{
  //   pageSize: number;
  //   total: number;
  // }>({
  //   pageSize: Limit,
  //   total: 0,
  // });
  const [showLoading, setShowLoading] = React.useState(true);

  const getMyRedPacketReceiveTxList = React.useCallback(
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
            setMyRedPacketReceiveTotal((response as any)?.totalNum);

            // @ts-ignore
            let result = (response as any)?.list.reduce(
              (
                prev: RawDataRedPacketReceivesItem[],
                item: sdk.LuckyTokenItemForReceive
              ) => {
                prev.push(item);
                return prev;
              },
              [] as RawDataRedPacketReceivesItem[]
            );

            setMyRedPacketReceiveList(result);
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
    myRedPacketReceiveList,
    showLoading,
    getMyRedPacketReceiveList,
    myRedPacketReceiveTotal,
    // pagination,
    // updateTickersUI,
  };
};
