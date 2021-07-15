import { WsAPI, ExchangeAPI, AmmpoolAPI, UserAPI, DEFAULT_TIMEOUT, } from 'loopring-sdk'
import store, { RootState } from 'stores'
import { useSelector } from 'react-redux'

import { useMemo } from 'react'

function useApi(ApiClass: any, timeout = DEFAULT_TIMEOUT) {
    // const chainId = store.getState().trading.chainId
    // return new ApiClass(chainId, timeout)

  const { chainId, } = useSelector((state: RootState) => state.trading)

  const genApi = () => {
      if (!chainId) {
          return undefined
      }

      return new ApiClass(chainId, timeout)
  }

  const api = useMemo(genApi, [ApiClass, chainId, timeout])

  return api
}

export function useWsAPI() {
    return useApi(WsAPI) as WsAPI
}

export function useExchangeAPI() {
    return useApi(ExchangeAPI) as ExchangeAPI
}

export function useAmmpoolAPI() {
    return useApi(AmmpoolAPI) as AmmpoolAPI
}

export function useUserAPI() {
    return useApi(UserAPI) as UserAPI
}
