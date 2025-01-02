import {
  AmmpoolAPI,
  ChainId,
  DefiAPI,
  DelegateAPI,
  ExchangeAPI,
  GlobalAPI,
  LuckTokenAPI,
  NFTAPI,
  UserAPI,
  WalletAPI,
  WsAPI,
  ContactAPI,
  VaultAPI,
  RabbitWithdrawAPI
} from '@loopring-web/loopring-sdk'

export class LoopringAPI {
  public static userAPI: UserAPI | undefined = undefined
  public static exchangeAPI: ExchangeAPI | undefined = undefined
  public static ammpoolAPI: AmmpoolAPI | undefined = undefined
  public static walletAPI: WalletAPI | undefined = undefined
  public static wsAPI: WsAPI | undefined = undefined
  public static nftAPI: NFTAPI | undefined = undefined
  public static delegate: DelegateAPI | undefined = undefined
  public static globalAPI: GlobalAPI | undefined = undefined
  public static defiAPI: DefiAPI | undefined = undefined
  public static luckTokenAPI: LuckTokenAPI | undefined = undefined
  public static contactAPI: ContactAPI | undefined = undefined
  public static vaultAPI: VaultAPI | undefined = undefined
  public static rabbitWithdrawAPI: RabbitWithdrawAPI | undefined = undefined
  public static __chainId__: ChainId | undefined = undefined
  public static InitApi = (chainId: ChainId) => {
    LoopringAPI.userAPI = new UserAPI({ chainId }, 15000)
    LoopringAPI.luckTokenAPI = new LuckTokenAPI({ chainId }, 15000)
    LoopringAPI.exchangeAPI = new ExchangeAPI({ chainId }, 15000)
    LoopringAPI.globalAPI = new GlobalAPI({ chainId }, 25000)
    LoopringAPI.ammpoolAPI = new AmmpoolAPI({ chainId }, 15000)
    LoopringAPI.walletAPI = new WalletAPI({ chainId }, 15000)
    LoopringAPI.wsAPI = new WsAPI({ chainId }, 15000)
    LoopringAPI.nftAPI = new NFTAPI({ chainId }, 15000)
    LoopringAPI.delegate = new DelegateAPI({ chainId }, 15000)
    LoopringAPI.defiAPI = new DefiAPI({ chainId }, 12000)
    LoopringAPI.contactAPI = new ContactAPI({ chainId }, 15000)
    LoopringAPI.vaultAPI = new VaultAPI({ chainId }, 15000)
    LoopringAPI.rabbitWithdrawAPI = new RabbitWithdrawAPI({ chainId }, 15000)
    LoopringAPI.__chainId__ = chainId
  }
  public static setBaseURL = (baseURL: string) => {
    LoopringAPI.userAPI?.setBaseUrl(baseURL)
    LoopringAPI.luckTokenAPI?.setBaseUrl(baseURL)
    LoopringAPI.exchangeAPI?.setBaseUrl(baseURL)
    LoopringAPI.globalAPI?.setBaseUrl(baseURL)
    LoopringAPI.ammpoolAPI?.setBaseUrl(baseURL)
    LoopringAPI.walletAPI?.setBaseUrl(baseURL)
    LoopringAPI.wsAPI?.setBaseUrl(baseURL)
    LoopringAPI.nftAPI?.setBaseUrl(baseURL)
    LoopringAPI.delegate?.setBaseUrl(baseURL)
    LoopringAPI.defiAPI?.setBaseUrl(baseURL)
    LoopringAPI.contactAPI?.setBaseUrl(baseURL)
    LoopringAPI.vaultAPI?.setBaseUrl(baseURL)
    LoopringAPI.rabbitWithdrawAPI?.setBaseUrl(baseURL)
  }
}

export { getContractTypeByNetwork } from './wallet'