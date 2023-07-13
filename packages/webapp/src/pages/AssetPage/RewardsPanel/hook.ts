import { ToastType } from '@loopring-web/component-lib'
import { useAccount, useUserRewards } from '@loopring-web/core'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { myLog, SagaStatus, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'

export function useRewardsTable(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { totalClaims, status: userRewardsStatus } = useUserRewards()

  const { t } = useTranslation(['error'])
  const [claimList, setClaimList] = React.useState(
    Reflect.ownKeys(totalClaims ?? {}).map((key) => totalClaims[key]) ?? [],
  )
  const [showLoading, setShowLoading] = React.useState(false)
  const getRewardsTableList = React.useCallback(async () => {
    setShowLoading(true)
    try {
      myLog('totalClaims', totalClaims)
      // myLog('totalClaims', list)
      setClaimList(Reflect.ownKeys(totalClaims).map((key) => totalClaims[key]))
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
  }, [accountId, totalClaims, apiKey, setToastOpen, t])

  React.useEffect(() => {
    if (userRewardsStatus === SagaStatus.UNSET) {
      getRewardsTableList()
    }
  }, [userRewardsStatus])
  return {
    claimList,
    showLoading,
    getRewardsTableList,
  }
}
