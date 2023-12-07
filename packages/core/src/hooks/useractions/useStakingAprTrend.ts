import React from 'react'
import { useOpenModals } from '@loopring-web/component-lib'
import { CustomErrorWithCode, myLog, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'
import { useDefiMap } from '../../stores'
import { LoopringAPI } from '../../api_wrapper'
import * as sdk from '@loopring-web/loopring-sdk'

export const useStakingAprTrend = () => {
  const { marketMap: defiMarketMap, marketLeverageMap } = useDefiMap()
  const [isLoading, setLoading] = React.useState(false)
  const [{ trends, defiInfo }, setTrends] = React.useState({
    trends: [],
    defiInfo: undefined,
  })

  const {
    modals: { isShowETHStakingApr },
  } = useOpenModals()
  React.useEffect(() => {
    if (isShowETHStakingApr.isShow && isShowETHStakingApr.symbol) {
      setLoading(true)
      // isShowETHStakingApr.info
      LoopringAPI.defiAPI
        .getDefiApys({
          request: {
            defiType: isShowETHStakingApr.info?.type,
            product: isShowETHStakingApr.symbol,
            limit: 90,
          },
        })
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
            throw new CustomErrorWithCode(errorItem)
          } else {
            const _defiMarketMap = {
              ...defiMarketMap,
              ...marketLeverageMap,
            }
            setTrends({
              defiInfo: _defiMarketMap[isShowETHStakingApr.symbol],
              trends: response.apys,
            })
            setLoading(false)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    return () => {}
  }, [isShowETHStakingApr.isShow])
  myLog('isLoading', isLoading)

  return {
    isLoading,
    trends,
    defiInfo,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  }
}
