import {
  RawDataDualAssetItem,
  RawDataDualTxsItem,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import {
  LoopringAPI,
  makeDualOrderedItem,
  useAccount,
  useDualMap,
  useTokenMap,
} from "@loopring-web/core";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  globalSetup,
  RedPacketLimit,
  SDK_ERROR_MAP_TO_UI,
  TableType,
} from "@loopring-web/common-resources";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";
import _ from "lodash";

export const useMarketRedPacket = <R extends sdk.LuckyTokenItemForReceive>() =>
  // setToastOpen: (props: any) => void
  {
    const { t } = useTranslation(["error"]);

    const {
      account: { accountId, apiKey },
    } = useAccount();

    const [luckTokenList, setLuckTokenList] = React.useState<{
      officialList: R[];
      publicList: R[];
    }>({
      officialList: [],
      publicList: [],
    });
    const { idIndex } = useTokenMap();
    const [pagination, setPagination] = React.useState<{
      pageSize: number;
      total: number;
      page: number;
    }>({
      pageSize: RedPacketLimit,
      total: 0,
      page: 1,
    });
    const { marketMap: dualMarketMap } = useDualMap();
    const [showOfficial, setShowOfficial] = React.useState<boolean>(false);

    // const [pagination, setDualPagination] = React.useState<{
    //   pageSize: number;
    //   total: number;
    // }>({
    //   pageSize: Limit,
    //   total: 0,
    // });
    const [showLoading, setShowLoading] = React.useState(true);

    const getMarketRedPacket = React.useCallback(
      async ({ showOfficial, offset }: any) => {
        setShowLoading(true);
        if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
          const responses = await Promise.all([
            LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
              {
                senderId: 0,
                hash: "",
                partitions: sdk.LuckyTokenAmountType.RANDOM,
                modes: sdk.LuckyTokenClaimType.COMMON,
                scopes: sdk.LuckyTokenViewType.PUBLIC,
                statuses: `${sdk.LuckyTokenWithdrawStatus.PROCESSING},${sdk.LuckyTokenWithdrawStatus.PROCESSED},${sdk.LuckyTokenWithdrawStatus.WITHDRAW_FAILED},${sdk.LuckyTokenWithdrawStatus.PREPARE_FAILED}`,
                offset: 0,
                limit: 50,
                official: true,
              } as any,
              apiKey
            ),
            ...(showOfficial
              ? []
              : [
                  LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
                    {
                      senderId: 0,
                      hash: "",
                      partitions: sdk.LuckyTokenAmountType.RANDOM,
                      modes: sdk.LuckyTokenClaimType.COMMON,
                      scopes: sdk.LuckyTokenViewType.PUBLIC,
                      statuses: `${sdk.LuckyTokenWithdrawStatus.PROCESSING},${sdk.LuckyTokenWithdrawStatus.PROCESSED},${sdk.LuckyTokenWithdrawStatus.WITHDRAW_FAILED},${sdk.LuckyTokenWithdrawStatus.PREPARE_FAILED}`,
                      offset,
                      limit: pagination?.pageSize,
                      official: showOfficial,
                    } as any,
                    apiKey
                  ),
                ]),
          ]);

          if (
            (responses[0] as sdk.RESULT_INFO).code ||
            (responses[0] as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (responses[0] as sdk.RESULT_INFO)?.code ?? 700001
              ];
            // if (setToastOpen) {
            //   setToastOpen({
            //     open: true,
            //     type: "error",
            //     content:
            //       "error : " + errorItem
            //         ? t(errorItem.messageKey)
            //         : (response as sdk.RESULT_INFO).message,
            //   });
            // }
          } else {
            setLuckTokenList({
              officialList: responses[0]?.list as R[],
              publicList:
                responses?.length === 2 ? (responses[1].list as R[]) : [],
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
      [accountId, apiKey, t, idIndex, dualMarketMap]
    );
    const updateData = _.debounce(({ currPage, showOfficial }) => {
      getMarketRedPacket({
        offset: (currPage - 1) * pagination?.pageSize,
        showOfficial,
      });
      setPagination((state) => {
        return {
          ...state,
          page: currPage,
        };
      });
    }, globalSetup.wait);

    const handlePageChange = React.useCallback(
      ({ page, showOfficial }: { page: number; showOfficial?: boolean }) => {
        updateData({ currPage: page });
      },
      [updateData, showOfficial]
    );
    React.useEffect(() => {
      updateData.cancel();
      handlePageChange({ page: 1, showOfficial });
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

    return {
      luckTokenList,
      showLoading,
      showOfficial,
      setShowOfficial,
      dualMarketMap,
      getMarketRedPacket,
      handlePageChange,
    };
  };
