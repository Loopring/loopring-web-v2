import { EarningsRow, ToastType } from '@loopring-web/component-lib'
import {
  LoopringAPI,
  useAccount,
  useTokenMap,
  useTokenPrices,
  useUserRewards,
  volumeToCount,
} from '@loopring-web/core'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import {
  globalSetup,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  TokenType,
} from '@loopring-web/common-resources'
import { TokenInfo } from '@loopring-web/loopring-sdk'

export function useRewardsTable<R = EarningsRow>(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { tokenMap, idIndex } = useTokenMap()
  const { totalClaims, status: userRewardsStatus } = useUserRewards()
  const { tokenPrices } = useTokenPrices()

  const { t } = useTranslation(['error'])
  const [claimList, setClaimList] = React.useState<R[]>([])
  const [showLoading, setShowLoading] = React.useState(false)
  const getRewardsTableList = React.useCallback(async () => {
    setShowLoading(true)
    try {
      const list = totalClaims.reduce((prev, item) => {
        let tokenValueDollar = 0,
          amountStr: any
        const tokenInfo: TokenInfo = tokenMap[idIndex[item.tokenId]]
        if (tokenInfo.symbol) {
          let totalAmount = sdk.toBig(0)
          item.claimableInfo = item.claimableInfo?.map((_claimable) => {
            totalAmount.plus(_claimable.amount)
            return {
              ..._claimable,
              amountStr: volumeToCount(tokenInfo?.symbol, _claimable?.amount ?? 0)?.toString(),
            }
          })
          amountStr = volumeToCount(tokenInfo.symbol, totalAmount)
          tokenValueDollar = amountStr.times(tokenPrices[tokenInfo.symbol])
          prev.push({
            token: {
              type: TokenType.single,
              value: tokenInfo.symbol,
            },
            detail: item.claimableInfo,
            precision: tokenInfo.precision,
            tokenValueDollar,
            amountStr: amountStr.toString(),
            amount: totalAmount.toString(),
            rawData: item,
          } as unknown as R)
        }
        return prev
      }, [] as R[])
      setClaimList(list)
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
  }, [accountId, apiKey, setToastOpen, t, tokenMap])

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
