import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from "web3";
import { walletServices } from '../walletServices';
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ErrorType } from '../command';
import { LoopringProvider } from '../interface';

export const WalletConnectProvide = async () :Promise<{provider:WalletConnectProvider,web3:Web3}| undefined> =>{
    try{
        const provider:WalletConnectProvider = new WalletConnectProvider({
            rpc: {
                1: "https://mainnet.eth.loopring.network",
                5: "https://goerli.infura.io/v3/84842078b09946638c03157f83405213",
            },
            qrcode: false,
        }) ;
        const {connector} = provider;
        let web3:Web3;
        if (!connector.connected) {
            await connector.createSession();
            // get uri for QR Code modal
            const uri = connector.uri;
            QRCodeModal.open(uri, () => {
                console.log("QR Code Modal closed");
            });
            await provider.enable();
        }
        web3 = new Web3(provider as any);
        walletServices.sendConnect(web3,provider)
        return {provider,web3}
    } catch (error){
        console.log('error happen at connect wallet with WalletConnect:', error)
        walletServices.sendError(ErrorType.FailedConnect, {connectName:LoopringProvider.WalletConnect,error})
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