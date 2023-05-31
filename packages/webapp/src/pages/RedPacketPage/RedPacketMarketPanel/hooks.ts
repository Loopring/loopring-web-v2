import { useTranslation } from "react-i18next";
import { LoopringAPI, useAccount, useTokenMap } from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  globalSetup,
  RedPacketLimit,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import _ from "lodash";
import { useRouteMatch } from "react-router-dom";
import { ToastType } from "@loopring-web/component-lib";

export const useMarketRedPacket = <R extends sdk.LuckyTokenItemForReceive>({
  setToastOpen,
}: {
  setToastOpen: (props: any) => void;
}) => {
  const { t } = useTranslation(["error"]);
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { idIndex } = useTokenMap();
  const [hideOpen, setHideOpen] = React.useState<boolean>(false);
  const [showLoading, setShowLoading] = React.useState(true);
  let match: any = useRouteMatch("/redPacket/markets/:item");

  const [pagination, setPagination] = React.useState<{
    pageSize: number;
    total: number;
    page: number;
  }>({
    pageSize: RedPacketLimit,
    total: 0,
    page: 1,
  });
  const [luckTokenList, setLuckTokenList] = React.useState<{
    officialList: R[];
    publicList: R[];
    publicTotal: number;
  }>({
    officialList: [],
    publicList: [],
    publicTotal: 0,
  });

  const getMarketRedPacket = React.useCallback(
    async ({ showOfficial, offset }: any) => {
      setShowLoading(true);
      const statuses = [
        sdk.LuckyTokenWithdrawStatus.PROCESSING,
        sdk.LuckyTokenWithdrawStatus.PROCESSED,
      ];
      if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
        const isNft = match?.params?.item?.toUpperCase() === "NFT";
        let responses: any[];
        if (showOfficial) {
          responses = await LoopringAPI.luckTokenAPI
            ?.getLuckTokenLuckyTokens(
              {
                senderId: 0,
                hash: "",
                partitions: "0,1",
                modes: "0,1",
                scopes: sdk.LuckyTokenViewType.PUBLIC,
                statuses: statuses.join(","),
                offset: 0,
                limit: 50,
                official: true,
                isNft,
              } as any,
              apiKey
            )
            .then(async (resOfficial) => {
              const officialLength = resOfficial.list.length;
              const resNonOfficial =
                await LoopringAPI.luckTokenAPI?.getLuckTokenLuckyTokens(
                  {
                    senderId: 0,
                    hash: "",
                    partitions: "0,1",
                    modes: "0,1",
                    scopes: sdk.LuckyTokenViewType.PUBLIC,
                    statuses: statuses.join(","),
                    offset,
                    limit: pagination?.pageSize - officialLength,
                    isNft,
                  } as any,
                  apiKey
                );
              return [resOfficial, resNonOfficial];
            });
        } else {
          const nonOfficialRes =
            await LoopringAPI.luckTokenAPI?.getLuckTokenLuckyTokens(
              {
                senderId: 0,
                hash: "",
                partitions: "0,1",
                modes: "0,1",
                scopes: sdk.LuckyTokenViewType.PUBLIC,
                statuses: statuses.join(","),
                offset,
                limit: pagination?.pageSize,
                isNft,
              } as any,
              apiKey
            );
          responses = [{}, nonOfficialRes];
        }

        if (
          (responses[0] as sdk.RESULT_INFO).code ||
          (responses[0] as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[
              (responses[0] as sdk.RESULT_INFO)?.code ?? 700001
            ];
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                "error : " + errorItem
                  ? t(errorItem.messageKey)
                  : (responses[0] as sdk.RESULT_INFO).message,
            });
          }
        } else {
          setLuckTokenList({
            officialList: (responses[0]?.list ?? []) as R[],
            publicList:
              responses?.length === 2 ? (responses[1]?.list as R[]) : [],
            publicTotal: responses[1]?.totalNum!,
          });
          setShowLoading(false);
          setPagination((state) => {
            return {
              ...state,
              totalNum: responses?.length === 2 ? responses[1].totalNum : 0,
            };
          });
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, t, idIndex, match?.params?.item]
  );
  const updateData = _.debounce(({ currPage, showOfficial }) => {
    getMarketRedPacket({
      offset: (currPage - 1) * pagination?.pageSize,
      showOfficial: currPage === 1,
    });
    setPagination((state) => {
      return {
        ...state,
        page: currPage,
      };
    });
  }, globalSetup.wait);

  const handlePageChange = React.useCallback(
    ({ page }: { page: number; showOfficial?: boolean }) => {
      updateData({ currPage: page });
    },
    [updateData]
  );
  React.useEffect(() => {
    updateData.cancel();
    handlePageChange({ page: 1 });
    return () => {
      updateData.cancel();
    };
  }, [pagination?.pageSize, match?.params?.item]);

  return {
    pagination,
    luckTokenList,
    showLoading,
    hideOpen,
    setHideOpen,
    getMarketRedPacket,
    handlePageChange,
  };
};
