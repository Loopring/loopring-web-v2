import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from "web3";
// import {provider as Provider} from 'web3-core';
import { walletServices } from '../walletServices';


export const WalletConnectProvide = async ()=>{
    const provider:WalletConnectProvider = new WalletConnectProvider({
        rpc: {
            1: "https://mainnet.eth.loopring.network",
            5: "https://goerli.infura.io/v3/84842078b09946638c03157f83405213",
        },
    }) ;
    await provider.enable();
    const web3 = new Web3(provider as any);
    walletServices.sendConnect(web3,provider)
    provider.on("accountsChanged", (accounts: string[]) => {
        walletServices.sendConnect(web3,provider)
    });
    provider.on("chainChanged", (chainId: number) => {
        //walletServices.sendConnect(web3)
        walletServices.sendChainChanged(chainId)
    });
    provider.on("disconnect", (code: number, reason: string) => {
        console.log(code, reason);
    });


    // const txHash = await web3.eth.sendTransaction(tx);

    // Sign Transaction
    //const signedTx = await web3.eth.signTransaction(tx);

    // Sign Message
    //const signedMessage = await web3.eth.sign(msg);

    // Sign Typed Data
    //const signedTypedData = await web3.eth.signTypedData(msg);
    return provider
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