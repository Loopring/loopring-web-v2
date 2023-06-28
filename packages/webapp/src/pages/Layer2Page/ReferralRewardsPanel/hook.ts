import { LoopringAPI, store, useAccount } from "@loopring-web/core";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import {
  ReferralsRow,
  ToastType,
  RefundRow,
} from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";

export function useRefundTable<R = RefundRow>(
  setToastOpen: (state: any) => void
) {
  const {
    account: { accountId, apiKey },
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
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

  return {
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
  } = useAccount();
  const { tokenMap } = store.getState().tokenMap;
  const { t } = useTranslation(["error"]);
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

  return {
    record,
    recordTotal,
    showLoading,
    getReferralsTableList,
  };
}
