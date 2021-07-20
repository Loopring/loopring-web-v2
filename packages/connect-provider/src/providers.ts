import { WalletConnectProvide } from './walletConnect';
import { MetaMaskProvide } from './metamask';
import {provider} from 'web3-core';
export const ConnectProvides = new Proxy<{
    WalletConnect:undefined|provider, MetaMask:undefined|provider,  onProvide: null|string,
}>({
    WalletConnect:undefined, MetaMask:undefined,  onProvide: null,

}, {
    get: async function (obj, prop) {
        switch (prop) {
            case 'MetaMask':
                if(obj.onProvide === 'MetaMask'){
                    return  obj.MetaMask
                }else{
                    obj.onProvide = 'MetaMask';
                    obj.MetaMask = await MetaMaskProvide();
                    return  obj.MetaMask
                }
            case 'WalletConnect':
                if(obj.onProvide === 'WalletConnect'){
                    delete  obj.WalletConnect
                }
                obj.onProvide = 'WalletConnect';
                obj.WalletConnect = await WalletConnectProvide() as any;
                return  obj.WalletConnect

        }
        // // 附加一个属性
        // if (prop === 'latestBrowser') {
        //     return obj.browsers[ obj.browsers.length - 1 ];
        // }
        //
        // // 默认行为是返回属性值
        // return obj[ prop ];
    },

})