import { Subject } from 'rxjs';
import Web3  from "web3";
import { Commands } from './command';

//TODO typeof account State
const subject = new Subject<{ status: keyof typeof Commands, data:any,}>();


// export type TickerMap<R> = {
//     [key in keyof R]:TradeFloat
// }
// <R extends {[key:string]:any}>
//<R>
export const walletServices = {
    sendConnect : async (web3:Web3,provider:any) => {
        const accounts = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        const networkId = await web3.eth.net.getId();
        console.log('wallet connect:',accounts,chainId,networkId);
        subject.next({status:'ConnectWallet',data:{provider,accounts,chainId,networkId}});
    },
    sendChainChanged: async (chainId:number) =>{
        console.log('wallet connect:',chainId);
        subject.next({status:'ChangeNetwork',data:{chainId}})
    },
    sendDisconnect : async (code:any, reason:any)=>{
        console.log('wallet disconnect:',reason);
        subject.next({status:'DisConnect',data: {reason:reason,code:code}})

    },

    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};