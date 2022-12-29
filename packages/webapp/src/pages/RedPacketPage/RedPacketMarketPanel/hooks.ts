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
  RedPacketLimit,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";

export const useMarketRedPacket = <R extends RawDataDualTxsItem>() =>
  // setToastOpen: (props: any) => void
  {
    const { t } = useTranslation(["error"]);

    const {
      account: { accountId, apiKey },
    } = useAccount();

    const [luckTokenList, setLuckTokenList] = React.useState<R[]>([]);
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
      async ({
        showOfficial,
        offset,
        limit,
      }: // start,
      // end,
      // offset,
      // settlementStatus,
      // investmentStatus,
      // dualTypes,
      // limit,
      any) => {
        setShowLoading(true);
        if (LoopringAPI.luckTokenAPI && accountId && apiKey) {
          Promise.all(showOfficial?[
             LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
              {
                senderId: 0,
                hash: "",
                partitions: sdk.LuckyTokenAmountType.RANDOM,
                modes: sdk.LuckyTokenClaimType.COMMON,
                scopes: sdk.LuckyTokenViewType.PUBLIC,
                statuses: `${sdk.LuckyTokenWithdrawStatus.PROCESSING},
                ${sdk.LuckyTokenWithdrawStatus.PROCESSED},
                ${sdk.LuckyTokenWithdrawStatus.WITHDRAW_FAILED},
                ${sdk.LuckyTokenWithdrawStatus.PREPARE_FAILED}`,
                offset: 0,
                limit: 50,
                official: true,
              } as any,
              apiKey
            )
          ]:[
            ,LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
            {
              senderId: 0,
              hash: "",
              partitions: sdk.LuckyTokenAmountType.RANDOM,
              modes: sdk.LuckyTokenClaimType.COMMON,
              scopes: sdk.LuckyTokenViewType.PUBLIC,
              statuses: `${sdk.LuckyTokenWithdrawStatus.PROCESSING},
                ${sdk.LuckyTokenWithdrawStatus.PROCESSED},
                ${sdk.LuckyTokenWithdrawStatus.WITHDRAW_FAILED},
                ${sdk.LuckyTokenWithdrawStatus.PREPARE_FAILED}`,
              offset: (pagination.page - 1) * pagination?.pageSize,
              limit: pagination?.pageSize,
              official: showOfficial,
            } as any,
            apiKey
          )])
          const response =
            ;
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            // const errorItem =
            //   SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
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
            // @ts-ignore
            let result = (response as any)?.userDualTxs.reduce(
              (prev: RawDataDualAssetItem[], item: sdk.UserDualTxsHistory) => {
                const [, , coinA, coinB] =
                  (item.tokenInfoOrigin.market ?? "dual-").match(
                    /(dual-)?(\w+)-(\w+)/i
                  ) ?? [];

                let [sellTokenSymbol, buyTokenSymbol] =
                  item.dualType == DUAL_TYPE.DUAL_BASE
                    ? [
                        coinA ?? idIndex[item.tokenInfoOrigin.tokenIn],
                        coinB ?? idIndex[item.tokenInfoOrigin.tokenOut],
                      ]
                    : [
                        coinB ?? idIndex[item.tokenInfoOrigin.tokenIn],
                        coinA ?? idIndex[item.tokenInfoOrigin.tokenOut],
                      ];
                prev.push({
                  ...makeDualOrderedItem(
                    item,
                    sellTokenSymbol,
                    buyTokenSymbol,
                    0,
                    dualMarketMap[item.tokenInfoOrigin.market]
                  ),
                  amount: item.tokenInfoOrigin.amountIn,
                });
                return prev;
              },
              [] as RawDataDualAssetItem[]
            );

            setLuckTokenList(result);
            setShowLoading(false);
            setPagination((state) => {
              return {
                ...state,
                totalNum: (response as any).totalNum,
              };
            });
            // setDualPagination({
            //   pageSize: limit,
            //   total: (response as any).totalNum,
            // });
          }
        }
        setShowLoading(false);
      },
      [accountId, apiKey, t, idIndex, dualMarketMap]
    );

    return {
      // page,
      luckTokenList,
      showLoading,
      showOfficial,
      setShowOfficial,
      dualMarketMap,
      getMarketRedPacket,
      // pagination,
      // updateTickersUI,
    };
  };
