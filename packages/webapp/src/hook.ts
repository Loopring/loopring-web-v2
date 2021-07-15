import React  from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { useSystem } from './stores/system';
import { ChainId } from 'loopring-sdk';
import { useAmmMap } from './stores/Amm/AmmMap';
import { STATUS } from './stores/constant';
import { useTokenMap } from './stores/token';
import { useWalletLayer1 } from './stores/walletLayer1';
import { useAccount } from './stores/account/hook';


/**
 * @description call it when bootstrap the page or change the network
 */
export function useInit(){
    const [state,setState] = React.useState<keyof typeof STATUS>('PENDING')
    const systemState = useSystem();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    const accountState  = useAccount();
    const walletLayer1State  =  useWalletLayer1()
    //store.getState().account
    // const socketState =   useSocket();

    useCustomDCEffect(async() => {

        const handleChainChanged = (chainId: any) => {
    
            // const network = chainId == ChainId.GORLI ? NETWORK.Goerli : NETWORK.MAIN
             systemState.updateSystem({ chainId })
             window.location.reload();
        }

        const handleAccountChanged = (accounts: Array<string>) => {
            window.location.reload()
        }

        const provider: any = await detectEthereumProvider()
        if (provider) {
            const chainId = Number(await provider.request({ method: 'eth_chainId' }))
            const accounts = await provider.request({ method: 'eth_requestAccounts' })

            provider.on('accountsChanged', handleAccountChanged)
            provider.on('chainChanged', ()=>{handleChainChanged(chainId)} )
            // @ts-ignore
            systemState.updateSystem({ chainId  })
           //handleChainChanged(chainId)
            
        } else {
            systemState.updateSystem({chainId:ChainId.MAINNET})
        }

    }, [])

    React.useEffect(() => {
        switch (systemState.status) {
            case "ERROR":
                systemState.statusUnset();
                setState('ERROR')
                //TODO show error at button page show error  some retry dispat again
                break;
            case "DONE":
                systemState.statusUnset();
                //TODO do some static information update
                //tokenState.getTokenMap();
                break;
            default:
                break;

        }
    },[
        systemState,
        // systemState.status,
        // systemState.statusUnset,
        //tokenState.getTokenMap

    ]);
    React.useEffect(() => {
        if(ammMapState.status ==="ERROR" || tokenState.status === "ERROR"){
            //TODO: solve error
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('ERROR');
        }else if(ammMapState.status ==="DONE" && tokenState.status === "DONE"){
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('DONE');
        }
    },[ammMapState,tokenState,accountState.accountId,walletLayer1State])

    // React.useEffect(()=>{
    //
    // },[])



    return {
        state,
    }

}
