import {
  LoopringAPI,
  makeDualOrderedItem,
  useAccount,
  useTokenMap,
} from "@loopring-web/core";
import React from "react";
import {
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import { RawDataDualAssetItem } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";

export const Limit = 14;

export const useDualAsset = <R extends RawDataDualAssetItem>(
  setToastOpen?: (props: any) => void
) => {
  const { t } = useTranslation(["error"]);

  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap, idIndex } = useTokenMap();
  const [dualList, setDualList] = React.useState<R[]>([]);
  const [pagination, setDualPagination] = React.useState<{
    pageSize: number;
    total: number;
  }>({
    pageSize: Limit,
    total: 0,
  });
  const [showLoading, setShowLoading] = React.useState(true);

  const getDualTxList = React.useCallback(
    async ({ start, end, offset, limit = Limit }: any) => {
      setShowLoading(true);
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const response = await LoopringAPI.defiAPI.getDualTransactions(
          {
            // dualTypes: sdk.DUAL_TYPE,
            accountId,
            settlementStatus: sdk.SETTLEMENT_STATUS.UNSETTLED,
            offset,
            limit,
            start,
            end,
          } as any,
          apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
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
          // @ts-ignore
          let result = (response as any)?.userDualTxs.reduce(
            (prev: RawDataDualAssetItem[], item: sdk.UserDualTxsHistory) => {
              const {} = item.tokenInfoOrigin.market;
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
              const format = makeDualOrderedItem(
                item,
                sellTokenSymbol,
                buyTokenSymbol
              );
              const amount = getValuePrecisionThousand(
                sdk
                  .toBig(item.tokenInfoOrigin.amountIn)
                  .div("1e" + tokenMap[format.sellSymbol].decimals),
                tokenMap[format.sellSymbol].precision,
                tokenMap[format.sellSymbol].precision,
                tokenMap[format.sellSymbol].precision,
                true
              );
              prev.push({
                ...format,
                amount,
              });
              return prev;
            },
            [] as RawDataDualAssetItem[]
          );

          setDualList(result);
          setShowLoading(false);
          setDualPagination({
            pageSize: limit,
            total: (response as any).totalNum,
          });
        }
      }
      setShowLoading(false);
    },
    [accountId, apiKey, setToastOpen, t]
  );

  return {
    // page,
    dualList,
    showLoading,
    getDualTxList,
    pagination,
    // updateTickersUI,
  };
};
