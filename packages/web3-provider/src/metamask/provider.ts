import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { walletServices } from '../walletServices';
import { IpcProvider } from 'web3-core';
// import { AbstractProvider } from 'web3-core';

export const MetaMaskProvide = async ():Promise<{provider:IpcProvider,web3:Web3}| undefined>=>{
    const provider:any = await detectEthereumProvider();
    const ethereum:any = window.ethereum;
    if(provider && ethereum){
        const web3 = new Web3(provider as any);
        walletServices.sendConnect(web3,provider)

        // let accounts = web3.eth.accounts;
        // accounts = await web3.eth.getAccounts();
        //accounts = await ethereum.request({ method: 'eth_accounts' });
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
        // console.log('provider:',provider)
        //
        // const accounts = await provider.request({ method: 'eth_requestAccounts' })
        //
        return {provider,web3}
    }else{
        return undefined
    }

    // provider;
}
