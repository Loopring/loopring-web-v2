import React from 'react'
import { LoopringAPI } from '@loopring-web/core'

export const useToolbar = () => {
  const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([])

  const getAmmPoolBalances = React.useCallback(async () => {
    if (LoopringAPI.ammpoolAPI) {
      const response = await LoopringAPI.ammpoolAPI.getAmmPoolBalances<any[]>()
      const fomattedRes = response.raw_data.map((o) => ({
        ...o,
        poolName: o.poolName.replace('AMM-', ''),
      }))
      setAmmPoolBalances(fomattedRes)
    }
  }, [])

  React.useEffect(() => {
    getAmmPoolBalances()
  }, [])

  return {
    ammPoolBalances,
  }
}
