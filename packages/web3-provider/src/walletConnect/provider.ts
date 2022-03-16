import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import {  ConnectProviders, ErrorType, RPC_URLS } from "../command";
import { IsMobile } from "../utilities";
import { ConnectProvides } from '../providers';
const POLLING_INTERVAL = 12000;
const DEFAULT_BRIDGE = "https://bridge.walletconnect.org"

export const WalletConnectProvide = async (props?: {
  account?: string;
  darkMode?: boolean;
}): Promise<{ provider?: WalletConnectProvider; web3?: Web3 } | undefined> => {
  try {
     console.log('WALLET_CONNECT_PING:',process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING`])
     const BRIDGE_URL = (await fetch(process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING`]??'')
        .then(({ status }) => {
          return status === 200
            ? process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE`]
            : DEFAULT_BRIDGE;
        })
        .catch(() => {
          return DEFAULT_BRIDGE;
        }))??DEFAULT_BRIDGE

    console.log('WALLET_CONNECT_BRIDGE:',process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE`])

    // const BRIDGE_URL = "https://bridge.walletconnect.org";

    const provider: WalletConnectProvider = new WalletConnectProvider({
      rpc: RPC_URLS,
      bridge: BRIDGE_URL,
      pollingInterval: POLLING_INTERVAL,
      qrcode: !!IsMobile.any(),
    });
    const { connector } = provider;
    let web3: Web3 | undefined;

    if (!connector.connected && props?.account === undefined) {
      await connector.createSession();
      const uri = connector.uri;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
      } else {
        walletServices.sendProcess("nextStep", { qrCodeUrl: uri });
      }
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    } else if (!connector.connected && props?.account !== undefined) {
      console.log(
        "WalletConnect reconnect connected is failed",
        props.account,
        provider
      );
      throw new Error("walletConnect not connect");
    } else if (props?.account && provider.isWalletConnect) {
      console.log(
        "WalletConnect reconnect connected is true",
        props.account,
        provider,
        connector.session
      );
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    }
    return { provider, web3 };
  } catch (error) {
    console.log("error happen at connect wallet with WalletConnect:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletConnect,
      error:( error as any)?.message,
    });
  }
};

export const WalletConnectSubscribe = (
  provider: any,
  web3: Web3,
  _account?: string
) => {
  const { connector } = provider;
  if (provider && connector && connector.connected) {
    connector.on("connect", (error: Error | null, payload: any | null) => {
      if (error) {
        walletServices.sendError(ErrorType.FailedConnect, {
          connectName: ConnectProviders.WalletConnect,
          error,
        });
      }
      const { accounts, chainId } = payload.params[0];
      connector.approveSession({ accounts, chainId });
      //
      // // const _accounts = await web3.eth.getAccounts();
      // console.log('accounts:', accounts)
      walletServices.sendConnect(web3, provider);
    });
    connector.on(
      "session_update",
      (error: Error | null, payload: any | null) => {
        const { accounts, chainId } = payload.params[0];
        if (error) {
          walletServices.sendError(ErrorType.FailedConnect, {
            connectName: ConnectProviders.WalletConnect,
            error,
          });
        }
        connector.updateSession({ accounts, chainId });
        walletServices.sendConnect(web3, provider);
      }
    );
    connector.on("disconnect", (error: Error | null, payload: any | null) => {
      const { message } = payload.params[0];
      if (error) {
        walletServices.sendError(ErrorType.FailedConnect, {
          connectName: ConnectProviders.WalletConnect,
          error,
        });
      }
      walletServices.sendDisconnect("", message);
      console.log("WalletConnect on disconnect");
    });
  }
};

export const WalletConnectUnsubscribe = async (provider: any) => {
  if (provider && provider.connector) {
    const { connector } = provider;
    console.log("WalletConnect on Unsubscribe");
    connector.off("disconnect");
    connector.off("connect");
    connector.off("session_update");
    return;
  }
};
//)
//     new Proxy<Array<keyof typeof Commands>>(
//    [
//        'Provider',
//        'ConnectWallet',
//        'UnLockWallet',
//        'SignatureTransfer',
//        'SignatureApprove']
// , {
//     get: function (obj, prop) {
//         switch (prop){
//             case 'Provider':
//
//             case 'ConnectWallet':
//                 return async (props:any )=>{
//                     obj
//                 }
//                 break
//             case 'UnLockWallet':
//                 return async (props:any )=>{
//
//                 }
//             case 'SignatureTransfer':
//                 return async (props:any )=>{
//
//                 }
//             case 'SignatureApprove':
//                 return async (props:any )=>{
//
//                 }
//         }
//         // if(prop === 'ConnectWallet') {
//         //     return async (props:any )=>{
//         //
//         //     }
//         // }
//         //
//         // if(prop === 'UnLockWallet') {
//         //     return async (props:any )=>{
//         //
//         //     }
//         // }
//         // // 附加一个属性
//         // if (prop === 'latestBrowser') {
//         //     return obj.browsers[ obj.browsers.length - 1 ];
//         // }
//         //
//         // // 默认行为是返回属性值
//         // return obj[ prop ];
//     },
//
// })
// import { InjectedConnector } from '@web3-react/injected-connector'
// import { NetworkConnector } from '@web3-react/network-connector'
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
// import { CoinbaseConnector } from '@web3-react/Coinbase-connector'
// import { LedgerConnector } from '@web3-react/ledger-connector'
// import { TrezorConnector } from '@web3-react/trezor-connector'
// import { AuthereumConnector } from '@web3-react/authereum-connector'
// import { myLog } from 'utils/log_tools'
//
// const POLLING_INTERVAL = 12000
//
// const RPC_URLS: { [chainId: number]: string } = {
//     1: process.env.RPC_URL_1 as string,
//     5: process.env.RPC_URL_5 as string
// }
//
// myLog('RPC_URLS 1:', RPC_URLS[1])
// myLog('RPC_URLS 5:', RPC_URLS[5])
//
// export const injected = new InjectedConnector({ supportedChainIds: [1, 5,] })
//
// export const network = new NetworkConnector({
//     urls: RPC_URLS,
//     defaultChainId: 1
// })
//
// export const walletconnect = new WalletConnectConnector({
//     rpc: RPC_URLS,
//     bridge: 'https://bridge.walletconnect.org',
//     qrcode: true,
//     pollingInterval: POLLING_INTERVAL
// })
//
// export const Coinbase = new CoinbaseConnector({
//     url: RPC_URLS[1],
//     appName: 'Loopring L2'
// })
//
// export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })
//
// export const trezor = new TrezorConnector({
//     chainId: 1,
//     url: RPC_URLS[1],
//     pollingInterval: POLLING_INTERVAL,
//     manifestEmail: 'dummy@abc.xyz',
//     manifestAppUrl: 'http://localhost:1234'
// })
//
// export const authereum = new AuthereumConnector({ chainId: 42 })
