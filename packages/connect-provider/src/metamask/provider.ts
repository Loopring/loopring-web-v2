import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { walletServices } from '../walletServices';
// import { AbstractProvider } from 'web3-core';

export const MetaMaskProvide = async ()=>{
    const provider:any = await detectEthereumProvider();
    if(provider){
        const web3 = new Web3(provider as any);
        walletServices.sendConnect(web3,provider)
        provider.on("accountsChanged", (accounts: string[]) => {
            walletServices.sendConnect(web3,provider)
        });
        provider.on("chainChanged", (chainId: number) => {
            //walletServices.sendConnect(web3)
            //provider.disconnect()
            walletServices.sendChainChanged(chainId)
        });
        provider.on("disconnect", (code: number, reason: string) => {
            console.log(code, reason);
        });
        return  provider
    }else{
        return undefined;
    }
}
