import { Subject } from 'rxjs';
import Web3 from "web3";
import { Commands, ErrorType,ProcessingType } from './command';

//TODO typeof account State
const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

export const walletServices = {
    sendProcess: async (type: keyof typeof ProcessingType, props?: any) => {
        subject.next({
            status: Commands.Processing,
            data: {type:type, opts: props}
        });
    },
    sendError: async (errorType: keyof typeof ErrorType, errorObj: any) => {
        subject.next({
            status: Commands.Error,
            data: {type: errorType, opts: errorObj}
        });
    },
    sendConnect: async (web3: Web3, provider: any) => {
        const accounts = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        // const networkId = await web3.eth.net.getId();
        // networkId
        console.log('wallet connect:', accounts, chainId);
        subject.next({status: 'ConnectWallet', data: {provider, accounts, chainId}});
    },
    sendChainChanged: async (chainId: number) => {
        console.log('wallet connect:', chainId);
        subject.next({status: 'ChangeNetwork', data: {chainId}})
    },
    sendDisconnect: async (code: any, reason: any) => {
        console.log('wallet disconnect:', reason);
        subject.next({status: 'DisConnect', data: {reason: reason, code: code}})

    },

    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};