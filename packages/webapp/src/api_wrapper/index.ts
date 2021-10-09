import { AmmpoolAPI, ChainId, ExchangeAPI, UserAPI, WalletAPI, WsAPI } from 'loopring-sdk';
import store from 'stores'

export function getChainId() {
    const chainId = store.getState().system.chainId as ChainId
    return {chainId,}
}

export class LoopringAPI {

    public static userAPI: UserAPI | undefined = undefined
    public static exchangeAPI: ExchangeAPI | undefined = undefined
    public static ammpoolAPI: AmmpoolAPI | undefined = undefined
    public static walletAPI: WalletAPI | undefined = undefined
    public static wsAPI: WsAPI | undefined = undefined

    public static InitApi = (chainId: ChainId) => {
        const baseUrl = chainId === ChainId.GOERLI ? 'https://uat2.loopring.io' : 'https://api3.loopring.io'
        LoopringAPI.userAPI = new UserAPI({baseUrl})
        LoopringAPI.exchangeAPI = new ExchangeAPI({baseUrl})
        LoopringAPI.ammpoolAPI = new AmmpoolAPI({baseUrl})
        LoopringAPI.walletAPI = new WalletAPI({baseUrl})
        LoopringAPI.wsAPI = new WsAPI({baseUrl})
    }

}
