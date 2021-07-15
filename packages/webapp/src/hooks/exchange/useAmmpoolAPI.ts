import { useState, } from 'react'

import { usePromiseJob } from 'hooks/common/useCommon'
import { useAmmpoolAPI, } from './useApi'

import { AmmPoolConfResponse } from 'loopring-sdk'

export function useGetAmmPools() {

  const [ammpools, setAmmpools] = useState<AmmPoolConfResponse>()

  const api = useAmmpoolAPI()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getAmmPoolConf()
    }
  
    usePromiseJob(fetchData, setAmmpools, undefined, 'useGetAmmPools', [api])

  return { ammpools }

}

export function useGetAmmPoolsBalances() {

  const [ammPoolsBalances, setAmmPoolsBalances] = useState<any>()

  const api = useAmmpoolAPI()

  const fetchData = () => {
    if (!api) {
      return undefined
    }
    return api.getAmmPoolBalances()
  }

  usePromiseJob(fetchData, setAmmPoolsBalances, undefined, 'useGetAmmPoolsBalances', [api])

  return { ammPoolsBalances }

}
