import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { walletServices } from '../walletServices';
import { IpcProvider } from 'web3-core';
import { ErrorType } from '../command';
import { LoopringProvider } from '../interface';

export const MetaMaskProvide = async (): Promise<{ provider: IpcProvider, web3: Web3 } | undefined> => {
    try {
        const provider: any = await detectEthereumProvider();
        const ethereum: any = window.ethereum;
        if (provider && ethereum) {
            const web3 = new Web3(provider as any);
            await ethereum.request({ method: 'eth_requestAccounts' });
            walletServices.sendConnect(web3, provider);
            return {provider, web3}
        } else {
            return undefined
        }

    } catch (error) {
        console.log('Error happen at connect wallet with MetaMask:', error)
        walletServices.sendError(ErrorType.FailedConnect, {connectName: LoopringProvider.MetaMask, error})
    }

    // provider;
}
