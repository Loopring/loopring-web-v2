import {
  AmmpoolAPI,
  ChainId,
  DefiAPI,
  DelegateAPI,
  ExchangeAPI,
  GlobalAPI,
  NFTAPI,
  UserAPI,
  WalletAPI,
  WsAPI,
} from "@loopring-web/loopring-sdk";

export class LoopringAPI {
  public static userAPI: UserAPI | undefined = undefined;
  public static exchangeAPI: ExchangeAPI | undefined = undefined;
  public static ammpoolAPI: AmmpoolAPI | undefined = undefined;
  public static walletAPI: WalletAPI | undefined = undefined;
  public static wsAPI: WsAPI | undefined = undefined;
  public static nftAPI: NFTAPI | undefined = undefined;
  public static delegate: DelegateAPI | undefined = undefined;
  public static globalAPI: GlobalAPI | undefined = undefined;
  public static defiAPI: DefiAPI | undefined = undefined;
  public static __chainId__: ChainId | undefined = undefined;
  public static InitApi = (chainId: ChainId) => {
    LoopringAPI.userAPI = new UserAPI({ chainId }, 6000);
    LoopringAPI.exchangeAPI = new ExchangeAPI({ chainId }, 6000);
    LoopringAPI.globalAPI = new GlobalAPI({ chainId }, 10000);
    LoopringAPI.ammpoolAPI = new AmmpoolAPI({ chainId }, 6000);
    LoopringAPI.walletAPI = new WalletAPI({ chainId }, 6000);
    LoopringAPI.wsAPI = new WsAPI({ chainId }, 6000);
    LoopringAPI.nftAPI = new NFTAPI({ chainId }, 6000);
    LoopringAPI.delegate = new DelegateAPI({ chainId }, 6000);
    LoopringAPI.defiAPI = new DefiAPI({ chainId }, 6000);
    LoopringAPI.__chainId__ = chainId;
  };
}
