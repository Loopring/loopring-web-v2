import { ToastType } from '@loopring-web/component-lib'
import { ClaimCommands, claimServices, useAccount, useUserRewards } from '@loopring-web/core'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { CLAIM_TYPE, myLog, SagaStatus, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'

export function useRewardsTable(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { totalClaims, errorMessage, status: userRewardsStatus, getUserRewards } = useUserRewards()
  const subject = React.useMemo(() => claimServices.onSocket(), [])

  const { t } = useTranslation(['error'])
  const [claimList, setClaimList] = React.useState(
    Reflect.ownKeys(totalClaims ?? {}).map((key) => totalClaims[key]) ?? [],
  )
  const [showLoading, setShowLoading] = React.useState(false)
  const getRewardsTableList = React.useCallback(async () => {
    setShowLoading(true)
    try {
      myLog('totalClaims', totalClaims)
      if (errorMessage) {
      } else {
        setClaimList(Reflect.ownKeys(totalClaims).map((key) => totalClaims[key]))
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
  }, [accountId, totalClaims, apiKey, setToastOpen, t])
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      switch (props.status) {
        case ClaimCommands.Success:
          if (props?.data?.type == CLAIM_TYPE.allToken) {
            getUserRewards()
          }
          break
        default:
          break
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [subject])
  React.useEffect(() => {
    if (userRewardsStatus === SagaStatus.UNSET) {
      getRewardsTableList()
    }
  }, [userRewardsStatus])
  return {
    claimList,
    showLoading,
    errorMessage,
    getRewardsTableList,
    getUserRewards,
  }
}
