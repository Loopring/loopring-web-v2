import { WalletConnectProvide } from './walletConnect';
import { MetaMaskProvide } from './metamask';

export const ConnectProvides = new Proxy({
   walletConnect: WalletConnectProvide(), MetaMask:  MetaMaskProvide(),

}, {
    get: function (obj, prop) {
        // switch () {
        //
        // }
        // // 附加一个属性
        // if (prop === 'latestBrowser') {
        //     return obj.browsers[ obj.browsers.length - 1 ];
        // }
        //
        // // 默认行为是返回属性值
        // return obj[ prop ];
    },

})