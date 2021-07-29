import { WalletConnectProvide } from './walletConnect';
import { MetaMaskProvide } from './metamask';
import { IpcProvider, provider } from 'web3-core';
import { LoopringProvider } from './interface';
import { walletServices } from './walletServices';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';


export const ConnectProvides = new Proxy<{
    WalletConnect:undefined|provider,
    MetaMask:undefined|provider,
    usedProvide: undefined|IpcProvider|WalletConnectProvider,
    usedWeb3:undefined|Web3,
    clear: undefined,
}>({
    WalletConnect:undefined,
    MetaMask:undefined,
    usedWeb3:undefined,
    usedProvide: undefined,
    clear:undefined
}, {
    get: async function (obj, prop) {
        switch (prop){
            case 'usedProvide':
                return obj.usedProvide;
            case 'usedWeb3':
                return obj.usedWeb3;
        }

        if(obj.usedProvide && typeof obj.usedProvide.removeAllListeners === 'function'){
            obj.usedProvide.removeAllListeners('accountsChanged');
            obj.usedProvide.removeAllListeners('chainChanged');
            obj.usedProvide.removeAllListeners('disconnect');
            delete  obj.usedProvide
        }
        let provderObj;
        // let provider,web3;
        switch (prop) {
            case LoopringProvider.MetaMask:
                // if(obj.usedProvide === LoopringProvider.MetaMask){
                //     return  obj.MetaMask
                // }else{
                //     obj.usedProvide = LoopringProvider.MetaMask;
                provderObj  = await MetaMaskProvide();
                if(provderObj) {
                    obj.usedProvide =  provderObj.provider
                    obj.usedWeb3 =    provderObj.web3
                }

                break;

                // }
            case LoopringProvider.WalletConnect:
                // if(obj.usedProvide === LoopringProvider.WalletConnect){
                //     delete  obj.WalletConnect
                // }
                // obj.usedProvide = LoopringProvider.WalletConnect;
                provderObj = await WalletConnectProvide();
                if(provderObj) {
                    obj.usedProvide =  provderObj.provider
                    obj.usedWeb3 =    provderObj.web3
                }
                break;
            case 'clear':
            default:
                obj.usedProvide

        }
        if( obj.usedProvide) {
            // @ts-ignore
            obj.usedProvide.on("accountsChanged", (accounts: Array<string>) => {
                // const _accounts = await web3.eth.getAccounts();
                console.log('accounts:',accounts)
                // walletServices.sendConnect(web3,provider)
            });
            // @ts-ignore
            obj.usedProvide.on("chainChanged", (chainId: number) => {
                walletServices.sendChainChanged(chainId);
            });
            // @ts-ignore
            obj.usedProvide.on("disconnect", (code: number, reason: string) => {
                if(obj.usedProvide instanceof WalletConnectProvider) {
                    const {connector} = obj.usedProvide as WalletConnectProvider;
                    connector.killSession();
                }
                walletServices.sendDisconnect(code,reason);

            });
        }

        return  {provider: obj.usedProvide,web3: obj.usedWeb3 }
        // // 附加一个属性
        // if (prop === 'latestBrowser') {
        //     return obj.browsers[ obj.browsers.length - 1 ];
        // }
        //
        // // 默认行为是返回属性值
        // return obj[ prop ];
    },

})