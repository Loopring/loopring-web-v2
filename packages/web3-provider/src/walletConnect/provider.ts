import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from "web3";
import { walletServices } from '../walletServices';
import { ErrorType } from '../command';
import { ConnectProviders } from '@loopring-web/common-resources';

// const BRIDGE_URL = process.env.REACT_APP_WALLET_CONNECT_BRIDGE ?? 'https://bridge.walletconnect.org'

// myLog('---BRIDGE_URL:', BRIDGE_URL)

const RPC_URLS: { [ chainId: number ]: string } = {
    1: process.env.REACT_APP_RPC_URL_1 as string,
    5: process.env.REACT_APP_RPC_URL_5 as string
}

const POLLING_INTERVAL = 12000

export const WalletConnectProvide = async (account?: string): Promise<{ provider?: WalletConnectProvider, web3?: Web3, } | undefined> => {
    try {
        const BRIDGE_URL = await (fetch('https://wcbridge.loopring.network/hello').then(({status}) => {
            return status === 200 ? process.env.REACT_APP_WALLET_CONNECT_BRIDGE : 'https://bridge.walletconnect.org'
        }).catch(() => {
            return 'https://bridge.walletconnect.org';
        }))

        const provider: WalletConnectProvider = new WalletConnectProvider({
            rpc: RPC_URLS,
            bridge: BRIDGE_URL,
            pollingInterval: POLLING_INTERVAL,
            qrcode: false,
        });
        const {connector} = provider;
        let web3: Web3 | undefined;

        if (!connector.connected && account === undefined) {
            await connector.createSession();
            const uri = connector.uri;
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {

            } else {
                walletServices.sendProcess('nextStep', {qrCodeUrl: uri});
            }
            await provider.enable();
            web3 = new Web3(provider as any);
            walletServices.sendConnect(web3, provider);

        } else if (!connector.connected && account !== undefined) {
            console.log('WalletConnect reconnect connected is failed', account, provider)
            // WalletConnectUnsubscribe(provider);
            // walletServices.sendDisconnect('', 'walletConnect not connect');
            web3 = undefined
            throw new Error('walletConnect not connect');
        } else if (account && provider.isWalletConnect) {
            console.log('WalletConnect reconnect connected is true', account, provider, connector.session)
            await provider.enable();
            web3 = new Web3(provider as any);
            walletServices.sendConnect(web3, provider)
        }
        return {provider, web3}
    } catch (error) {
        console.log('error happen at connect wallet with WalletConnect:', error)
        walletServices.sendError(ErrorType.FailedConnect, {connectName: ConnectProviders.WalletConnect, error})
    }
}

export const WalletConnectSubscribe = (provider: any, web3: Web3, account?: string) => {
    const {connector} = provider;
    if (provider && connector && connector.connected) {

        connector.on("connect", (error: Error | null, payload: any | null) => {
            if (error) {
                walletServices.sendError(ErrorType.FailedConnect, {connectName: ConnectProviders.WalletConnect, error})
            }
            const {accounts, chainId} = payload.params[ 0 ];
            connector.approveSession({accounts, chainId})
            //
            // // const _accounts = await web3.eth.getAccounts();
            // console.log('accounts:', accounts)
            walletServices.sendConnect(web3, provider)
        });
        connector.on("session_update", (error: Error | null, payload: any | null) => {
            const {accounts, chainId} = payload.params[ 0 ];
            if (error) {
                walletServices.sendError(ErrorType.FailedConnect, {connectName: ConnectProviders.WalletConnect, error})
            }
            connector.updateSession({accounts, chainId})
            walletServices.sendConnect(web3, provider);
        });
        connector.on("disconnect", (error: Error | null, payload: any | null) => {
            const {message} = payload.params[ 0 ];
            if (error) {
                walletServices.sendError(ErrorType.FailedConnect, {connectName: ConnectProviders.WalletConnect, error})
            }
            walletServices.sendDisconnect('', message);
            console.log('WalletConnect on disconnect')
        });
    }
}

export const WalletConnectUnsubscribe = async (provider: any) => {
    if (provider && provider.connector) {
        const {connector} = provider;
        console.log('WalletConnect on Unsubscribe')
        connector.off('disconnect');
        connector.off('connect')
        connector.off('session_update');
        return
    }
}
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
// import { WalletLinkConnector } from '@web3-react/walletlink-connector'
// import { LedgerConnector } from '@web3-react/ledger-connector'
// import { TrezorConnector } from '@web3-react/trezor-connector'
// import { AuthereumConnector } from '@web3-react/authereum-connector'
// import { myLog } from 'utils/log_tools'
//
// const POLLING_INTERVAL = 12000
//
// const RPC_URLS: { [chainId: number]: string } = {
//     1: process.env.REACT_APP_RPC_URL_1 as string,
//     5: process.env.REACT_APP_RPC_URL_5 as string
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
// export const walletlink = new WalletLinkConnector({
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
