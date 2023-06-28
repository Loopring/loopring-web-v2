import { LoopringAPI, store, useAccount } from "@loopring-web/core";
import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import {
  ReferralsRow,
  ToastType,
  RefundRow,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  AccountStatus,
  getValuePrecisionThousand,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";
import { GetReferStatisticReason } from "@loopring-web/loopring-sdk/src/defs/loopring_defs";

export function useRefundTable<R = RefundRow>(
  setToastOpen: (state: any) => void
) {
  const {
    account: { accountId, apiKey },
    status: accountStatus,
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
  const [summary, setSummary] = useState<undefined | any>(undefined);
  const [record, setRecord] = useState<R[]>([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const getRefundTableList = useCallback(
    async ({ start, end, limit, offset }: Partial<sdk.GetReferSelf>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true);
        const response = await LoopringAPI.userAPI.getReferSelf(
          {
            accountId: accountId.toString(),
            limit,
            start,
            end,
            offset,
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
            type: ToastType.error,
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        } else {
          const list = response.record.map(({ lrcAmount, ...item }) => {
            return {
              ...item,
              amount: {
                unit: "LRC",
                value: getValuePrecisionThousand(
                  lrcAmount,
                  tokenMap["LRC"].precision,
                  tokenMap["LRC"].precision,
                  tokenMap["LRC"].precision,
                  false
                ),
              },
            } as unknown as R;
          });
          setRecord(list);
          setRecordTotal(response.totalNum);
          setShowLoading(false);
        }
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap]
  );
  React.useEffect(() => {
    const account = store.getState().account;
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState == AccountStatus.ACTIVATED
    ) {
      LoopringAPI.userAPI
        ?.getReferStatistic<sdk.ReferStatistic>(
          {
            accountId: accountId.toString(),
            reason: GetReferStatisticReason.Recommender,
          },
          apiKey
        )
        .then((response) => {
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                "error : " + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            });
          } else {
            // ;
            // ;

            setSummary({
              ...response,
              totalValue: getValuePrecisionThousand(
                response.totalProfit,
                tokenMap["LRC"].precision,
                tokenMap["LRC"].precision,
                tokenMap["LRC"].precision,
                false
              ),
              claimableValue: getValuePrecisionThousand(
                response.claimableProfit,
                tokenMap["LRC"].precision,
                tokenMap["LRC"].precision,
                tokenMap["LRC"].precision,
                false
              ),
            });
            // downsidesNum;
            // tradeNum;
            // const list = response.record.map(({ lrcAmount, ...item }) => {
            //   return {
            //     ...item,
            //     amount: {
            //       unit: "LRC",
            //       value: getValuePrecisionThousand(
            //         lrcAmount,
            //         tokenMap["LRC"].precision,
            //         tokenMap["LRC"].precision,
            //         tokenMap["LRC"].precision,
            //         false
            //       ),
            //     },
            //   } as unknown as R;
            // });
            // setRecord(list);
            // setRecordTotal(response.totalNum);
            // setShowLoading(false);
          }
          // }
          //   setSummary();
        });
    }
  }, [accountStatus]);

  return {
    summary,
    record,
    recordTotal,
    showLoading,
    getRefundTableList,
  };
}

export function useReferralsTable<R = ReferralsRow>(
  setToastOpen: (state: any) => void
) {
  const {
    account: { accountId, apiKey },
    status: accountStatus,
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
  const [summary, setSummary] = useState<undefined | any>(undefined);
  const [record, setRecord] = useState<R[]>([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const getReferralsTableList = useCallback(
    async ({ start, end, limit, offset }: Partial<sdk.GetReferDownsides>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true);
        const response = await LoopringAPI.userAPI.getReferDownsides(
          {
            accountId: accountId.toString(),
            limit,
            start,
            end,
            offset,
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
            type: ToastType.error,
            content:
              "error : " + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          });
        } else {
          const list = response.record.map(({ lrcAmount, ...item }) => {
            return {
              ...item,
              amount: {
                unit: "LRC",
                value: getValuePrecisionThousand(
                  lrcAmount,
                  tokenMap["LRC"].precision,
                  tokenMap["LRC"].precision,
                  tokenMap["LRC"].precision,
                  false
                ),
              },
            } as unknown as R;
          });
          setRecord(list);
          setRecordTotal(response.totalNum);
          setShowLoading(false);
        }
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap]
  );
  React.useEffect(() => {
    const account = store.getState().account;
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState == AccountStatus.ACTIVATED
    ) {
      LoopringAPI.userAPI
        ?.getReferStatistic<sdk.ReferStatistic>(
          {
            accountId: accountId.toString(),
            reason: GetReferStatisticReason.Invited,
          },
          apiKey
        )
        .then((response) => {
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
              (response as sdk.RESULT_INFO)?.code ?? 700001
                ];
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                "error : " + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            });
          } else {
            // ;
            // ;

            setSummary({
              ...response,
              totalValue: getValuePrecisionThousand(
                response.totalProfit,
                tokenMap[ "LRC" ].precision,
                tokenMap[ "LRC" ].precision,
                tokenMap[ "LRC" ].precision,
                false
              ),
              claimableValue: getValuePrecisionThousand(
                response.claimableProfit,
                tokenMap[ "LRC" ].precision,
                tokenMap[ "LRC" ].precision,
                tokenMap[ "LRC" ].precision,
                false
              ),
            });
            // downsidesNum;
            // tradeNum;
            // const list = response.record.map(({ lrcAmount, ...item }) => {
            //   return {
            //     ...item,
            //     amount: {
            //       unit: "LRC",
            //       value: getValuePrecisionThousand(
            //         lrcAmount,
            //         tokenMap["LRC"].precision,
            //         tokenMap["LRC"].precision,
            //         tokenMap["LRC"].precision,
            //         false
            //       ),
            //     },
            //   } as unknown as R;
            // });
            // setRecord(list);
            // setRecordTotal(response.totalNum);
            // setShowLoading(false);
          }
          // }
          //   setSummary();
        });
    }
  }, [accountStatus]);
  return {
    summary,
    record,
    recordTotal,
    showLoading,
    getReferralsTableList,
  };
}

// export function useReferralRewardSumInfo() {
//   const {
//     account: { accountId, apiKey },
//   } = useAccount();
//   const [summary, setSummary] = useState();
//
//
//   return {};
// }
