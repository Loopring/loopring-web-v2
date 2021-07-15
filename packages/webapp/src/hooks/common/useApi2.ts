import { useMemo, } from "react"

import { useActiveWeb3React } from "../web3/useWeb3"

import { WsAPI, ExchangeAPI, AmmpoolAPI, UserAPI, DEFAULT_TIMEOUT, } from 'loopring-sdk'

function useApi(ApiClass: any, timeout = DEFAULT_TIMEOUT) {

  const { chainId, active, } = useActiveWeb3React()

    const genApi = () => {
        if (!active || !chainId) {
            return undefined
        }

        return new ApiClass(chainId, timeout)
    }

    const api = useMemo(genApi, [ApiClass, chainId, active, timeout])

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
