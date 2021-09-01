import { WalletConnectProvide, WalletConnectSubscribe, WalletConnectUnsubscribe } from './walletConnect';
import { MetaMaskProvide, MetaMaskSubscribe, MetaMaskUnsubscribe } from './metamask';
import { IpcProvider } from 'web3-core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ConnectProviders } from '@loopring-web/common-resources';


export class ConnectProvides {
    public usedProvide: undefined | IpcProvider | WalletConnectProvider;
    public usedWeb3: undefined | Web3;

    private _provideName: string | undefined;

    get provideName(): string | undefined {
        return this._provideName;
    }

    // private provderObj:provider|undefined
    public MetaMask = async () => {
        this._provideName = ConnectProviders.MetaMask;
        this.clearProviderSubscribe();
        const obj = await MetaMaskProvide();
        if (obj) {
            this.usedProvide = obj.provider
            this.usedWeb3 = obj.web3
        }
        this.subScribe()

    }

    public WalletConnect = async (account?: string) => {
        this._provideName = ConnectProviders.WalletConnect;
        this.clearProviderSubscribe();
        try {
           const obj = await WalletConnectProvide(account);
           if (obj) {
               this.usedProvide = obj.provider
               this.usedWeb3 = obj.web3
           }
           console.log('WalletConnect subScribe')
           this.subScribe(account)
        }catch (e){
            throw e;
        }

    };

    public clear = async () => {
        return await this.clearProviderSubscribe();
    }

    private clearProviderSubscribe = async () => {
        switch (this._provideName) {
            case  ConnectProviders.WalletConnect:
                if (this.usedProvide) {
                    await (this.usedProvide as WalletConnectProvider).connector.killSession();
                }
                await WalletConnectUnsubscribe(this.usedProvide);
                delete this.usedProvide;
                delete this.usedWeb3;
                break;
            case  ConnectProviders.MetaMask:
                await MetaMaskUnsubscribe(this.usedProvide);
                delete this.usedProvide;
                delete this.usedWeb3;
                break;
        }
        
        return
    }

    private subScribe = (account?:string) => {
        switch (this._provideName) {
            case  ConnectProviders.WalletConnect:
                WalletConnectSubscribe(this.usedProvide, this.usedWeb3 as Web3, account)
                break
            case  ConnectProviders.MetaMask:
                MetaMaskSubscribe(this.usedProvide, this.usedWeb3 as Web3)
                break
        }
    }

}

export const connectProvides = new ConnectProvides();


//
//
//
//
//     new Proxy<{
//     WalletConnect:undefined|provider,
//     MetaMask:undefined|provider,
//     usedProvide: undefined|IpcProvider|WalletConnectProvider,
//     usedWeb3:undefined|Web3,
//     clear: undefined,
// }>({
//     WalletConnect:undefined,
//     MetaMask:undefined,
//     usedWeb3:undefined,
//     usedProvide: undefined,
//     clear:undefined
// }, {
//     get: async function (obj, prop) {
//         switch (prop){
//             case 'usedProvide':
//                 return obj.usedProvide;
//             case 'usedWeb3':
//                 return obj.usedWeb3;
//         }
//
//
//
//         let provderObj;
//         walletServices.sendProcess('waiting');
//         // let provider,web3;
//         switch (prop) {
//             case ConnectProviders.MetaMask:
//                 // if(obj.usedProvide === ConnectProviders.MetaMask){
//                 //     return  obj.MetaMask
//                 // }else{
//                 //     obj.usedProvide = ConnectProviders.MetaMask;
//                 provderObj  = await MetaMaskProvide();
//                 if(provderObj) {
//                     obj.usedProvide =  provderObj.provider
//                     obj.usedWeb3 =    provderObj.web3
//                 }
//
//                 break;
//
//                 // }
//             case ConnectProviders.WalletConnect:
//                 // if(obj.usedProvide === ConnectProviders.WalletConnect){
//                 //     delete  obj.WalletConnect
//                 // }
//                 // obj.usedProvide = ConnectProviders.WalletConnect;
//                 provderObj = await WalletConnectProvide();
//                 if(provderObj) {
//                     obj.usedProvide =  provderObj.provider
//                     obj.usedWeb3 =    provderObj.web3
//                 }
//                 break;
//             case 'clear':
//             default:
//                 obj.usedProvide
//
//         }
//         if( obj.usedProvide) {
//             // @ts-ignore
//             obj.usedProvide.on("accountsChanged", (accounts: Array<string>) => {
//                 // const _accounts = await web3.eth.getAccounts();
//                 console.log('accounts:',accounts)
//                 // walletServices.sendConnect(web3,provider)
//             });
//             // @ts-ignore
//             obj.usedProvide.on("chainChanged", (chainId: number) => {
//                 walletServices.sendChainChanged(chainId);
//             });
//             // @ts-ignore
//             obj.usedProvide.on("disconnect", (code: number, reason: string) => {
//                 if(obj.usedProvide instanceof WalletConnectProvider) {
//                     const {connector} = obj.usedProvide as WalletConnectProvider;
//                     connector.killSession();
//                 }
//                 walletServices.sendDisconnect(code,reason);
//
//             });
//         }
//
//         return  {provider: obj.usedProvide,web3: obj.usedWeb3 }
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