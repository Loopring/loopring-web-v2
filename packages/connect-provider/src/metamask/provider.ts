import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { walletServices } from '../walletServices';
// import { AbstractProvider } from 'web3-core';

export const MetaMaskProvide = async ()=>{
    const provider:any = await detectEthereumProvider();
    const ethereum:any = window.ethereum;
    if(provider && ethereum){
        const web3 = new Web3(provider as any);
        // let accounts = web3.eth.accounts;
        // accounts = await web3.eth.getAccounts();
        //accounts = await ethereum.request({ method: 'eth_accounts' });
        walletServices.sendConnect(web3,provider)
        //
        // ethereum
        //     .request({ method: 'eth_accounts' })
        //     .then((accounts)=>{
        //
        //     })
        //     .catch((err) => {
        //         // Some unexpected error.
        //         // For backwards compatibility reasons, if no accounts are available,
        //         // eth_accounts will return an empty array.
        //         console.error(err);
        //     });

        console.log('provider:',provider)
        provider.on("accountsChanged", (accounts: Array<string>) => {
           // const _accounts = await web3.eth.getAccounts();
            console.log('accounts:',accounts)
           // walletServices.sendConnect(web3,provider)
        });
        provider.on("chainChanged", (chainId: number) => {
            walletServices.sendChainChanged(chainId);
        });
        provider.on("disconnect", (code: number, reason: string) => {
            walletServices.sendDisconnect(code,reason);
        });
       
    }
    return  provider;
    // provider;
}
