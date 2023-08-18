import { LoopringAPI, store, useAccount } from '@loopring-web/core'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { ReferralsRow, ToastType, RefundRow } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  AccountStatus,
  getValuePrecisionThousand,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from '@loopring-web/common-resources'
export function useRefundTable<R = RefundRow>(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
    status: accountStatus,
  } = useAccount()
  const { tokenMap } = store.getState().tokenMap
  const { t } = useTranslation(['error'])
  const [summary, setSummary] = React.useState<undefined | any>(undefined)
  const [record, setRecord] = React.useState<R[]>([])
  const [recordTotal, setRecordTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const getRefundTableList = React.useCallback(
    async ({ start, end, limit, offset }: Partial<sdk.GetReferSelf>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true)
        try {
          const response = await LoopringAPI.userAPI.getReferSelf(
            {
              accountId: accountId.toString(),
              limit,
              start,
              end,
              offset,
            },
            apiKey,
          )
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response as sdk.RESULT_INFO
          } else {
            const list = response?.records.map(({ lrcAmount, ...item }) => {
              return {
                ...item,
                amount: {
                  unit: 'LRC',
                  value: getValuePrecisionThousand(
                    sdk.toBig(lrcAmount).div('1e' + tokenMap['LRC'].decimals),
                    tokenMap['LRC'].precision,
                    tokenMap['LRC'].precision,
                    tokenMap['LRC'].precision,
                    false,
                  ),
                },
              } as unknown as R
            })
            setRecord(list)
            setRecordTotal(response.totalNum)
          }
        } catch (error) {
          let errorItem
          if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
            errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
          } else {
            errorItem = SDK_ERROR_MAP_TO_UI[700012]
          }
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
          })
        }

        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap],
  )
  React.useEffect(() => {
    const account = store.getState().account
    if (accountStatus === SagaStatus.UNSET && account.readyState == AccountStatus.ACTIVATED) {
      LoopringAPI.userAPI
        ?.getReferStatistic<sdk.ReferStatistic>(
          {
            accountId: accountId.toString(),
            reason: sdk.GetReferStatisticReason.Recommender,
          },
          apiKey,
        )
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            })
          } else {
            // ;
            // ;

            setSummary({
              ...response,
              totalValue:
                response.totalProfit == '' || response.totalProfit == '0'
                  ? undefined
                  : getValuePrecisionThousand(
                      sdk.toBig(response.totalProfit).div('1e' + tokenMap['LRC'].decimals),
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      false,
                    ),
              claimableValue:
                response.claimableProfit == '' || response.claimableProfit == '0'
                  ? undefined
                  : getValuePrecisionThousand(
                      sdk.toBig(response.claimableProfit).div('1e' + tokenMap['LRC'].decimals),
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      false,
                    ),
            })
          }
        })
    }
  }, [accountStatus])

  return {
    summary,
    record,
    recordTotal,
    showLoading,
    getRefundTableList,
  }
}

export function useReferralsTable<R = ReferralsRow>(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
    status: accountStatus,
  } = useAccount()
  const { tokenMap } = store.getState().tokenMap
  const { t } = useTranslation(['error'])
  const [summary, setSummary] = React.useState<undefined | any>(undefined)
  const [record, setRecord] = React.useState<R[]>([])
  const [recordTotal, setRecordTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const getReferralsTableList = React.useCallback(
    async ({ start, end, limit, offset }: Partial<sdk.GetReferDownsides>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true)
        try {
          const response = await LoopringAPI.userAPI.getReferDownsides(
            {
              accountId: accountId.toString(),
              limit,
              start,
              end,
              offset,
            },
            apiKey,
          )
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          } else {
            const list = response?.records.map(({ lrcAmount, ...item }) => {
              return {
                ...item,
                amount: {
                  unit: 'LRC',
                  value: getValuePrecisionThousand(
                    sdk.toBig(lrcAmount).div('1e' + tokenMap['LRC'].decimals),
                    tokenMap['LRC'].precision,
                    tokenMap['LRC'].precision,
                    tokenMap['LRC'].precision,
                    false,
                  ),
                },
              } as unknown as R
            })
            setRecord(list)
            setRecordTotal(response.totalNum)
          }
        } catch (error) {
          let errorItem
          if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
            errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
          } else {
            errorItem = SDK_ERROR_MAP_TO_UI[700012]
          }
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
          })
        }

        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap],
  )
  React.useEffect(() => {
    const account = store.getState().account
    if (accountStatus === SagaStatus.UNSET && account.readyState == AccountStatus.ACTIVATED) {
      LoopringAPI.userAPI
        ?.getReferStatistic<sdk.ReferStatistic>(
          {
            accountId: accountId.toString(),
            reason: sdk.GetReferStatisticReason.Invited,
          },
          apiKey,
        )
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            })
          } else {
            setSummary({
              ...response,
              totalValue:
                response.totalProfit == '' || response.totalProfit == '0'
                  ? undefined
                  : getValuePrecisionThousand(
                      sdk.toBig(response.totalProfit).div('1e' + tokenMap['LRC'].decimals),
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      false,
                    ),
              claimableValue:
                response.claimableProfit == '' || response.claimableProfit == '0'
                  ? undefined
                  : getValuePrecisionThousand(
                      sdk.toBig(response.claimableProfit).div('1e' + tokenMap['LRC'].decimals),
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      tokenMap['LRC'].precision,
                      false,
                    ),
            })
          }
        })
    }
  }, [accountStatus])

  return {
    summary,
    record,
    recordTotal,
    showLoading,
    getReferralsTableList,
  }
}

// export function useReferralRewardSumInfo() {
//   const {
//     account: { accountId, apiKey },
//   } = useAccount();
//   const [summary, setSummary] = React.useState();
//
//
//   return {};
// }
