import { AmmpoolAPI, ChainId, ExchangeAPI, UserAPI, WalletAPI, WsAPI } from "loopring-sdk"
import store from 'stores'

export function getChainId(){
    const chainId = store.getState().system.chainId
    return { chainId: chainId as ChainId }
}

export class LoopringAPI {
    
    public static userAPI: UserAPI | undefined = undefined
    public static exchangeAPI: ExchangeAPI | undefined = undefined
    public static ammpoolAPI: AmmpoolAPI | undefined = undefined
    public static walletAPI: WalletAPI | undefined = undefined
    public static wsAPI: WsAPI | undefined = undefined

    public static InitApi = (chainId: ChainId) => {
        LoopringAPI.userAPI = new UserAPI({ chainId }) 
        LoopringAPI.exchangeAPI = new ExchangeAPI({ chainId }) 
        LoopringAPI.ammpoolAPI = new AmmpoolAPI({ chainId }) 
        LoopringAPI.walletAPI = new WalletAPI({ chainId }) 
        LoopringAPI.wsAPI = new WsAPI({ chainId }) 
    }

}
