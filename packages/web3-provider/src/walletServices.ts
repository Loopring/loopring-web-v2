import { Subject } from 'rxjs';
import Web3 from "web3";
import { Commands, ErrorType, ProcessingType } from './command';

//TODO typeof account State
const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

const AvaiableNetwork = [1, 5];
export const walletServices = {
    subject,
    sendProcess: async (type: keyof typeof ProcessingType, props?: any) => {
        subject.next({
            status: Commands.Processing,
            data: {type: type, opts: props}
        });
    },
    sendError: async (errorType: keyof typeof ErrorType, errorObj: any) => {
        subject.next({
            status: Commands.Error,
            data: {type: errorType, opts: errorObj}
        });
    },
    sendConnect: async (web3: Web3, provider: any) => {
        try {
            let accounts, chainId: number;
            // if(provider.isWalletLink){
            //     accounts = provider._eth_accounts();
            //     chainId = provider.getChainId()
            // }else{
            accounts = provider.accounts ?? await web3.eth.getAccounts();
            chainId = provider.chainId ?? await web3.eth.getChainId();
            // }

            // console.log('wallet connect:', accounts, chainId);

            subject.next({
                status: 'ConnectWallet', data: {
                    provider, accounts,
                    chainId: AvaiableNetwork.findIndex((i) => i == Number(chainId)) !== -1 ? Number(chainId) : 'unknown'
                }
            });
        } catch (error) {
            subject.next({status: 'Error', data: {error}});
        }
    },
    // sendChainChanged: async (chainId: number) => {
    //     console.log('wallet connect:', chainId);
    //     subject.next({status: 'ChangeNetwork', data: {chainId: Number(chainId)}})
    // },
    sendDisconnect: async (code: any, reason: any) => {
        subject.next({status: 'DisConnect', data: {reason: reason, code: code}})
    },

    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};