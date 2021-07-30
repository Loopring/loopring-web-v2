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
import { Commands, ConnectProvides, useConnectHook, walletServices } from '@loopring-web/web3-provider';
import { AccountState } from './stores/account';



/**
 * @description call it when bootstrap the page or change the network
 */
export function useInit(){
    const [state,setState] = React.useState<keyof typeof STATUS>('PENDING')
    const systemState = useSystem();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    const {account,status:accuntStatus}  = useAccount();
    const walletLayer1State  =  useWalletLayer1()

    const handleChainChanged = React.useCallback((chainId)=>{
        debugger
        systemState.updateSystem({ chainId })
        window.location.reload();
    },[])
    const handleConnect = React.useCallback((accounts,provider)=>{
        // debugger
        console.log('account changed and connect ',accounts,provider)
    },[])
    const handleAccountDisconnect = React.useCallback(()=>{
        debugger
        console.log('Disconnect')
    },[])
    useConnectHook({handleChainChanged,handleConnect,handleAccountDisconnect});

    useCustomDCEffect(async() => {

        // const handleChainChanged = (chainId: any) => {
        //
        //     // const network = chainId == ChainId.GORLI ? NETWORK.Goerli : NETWORK.MAIN
        //
        // }

        // const handleAccountChanged = (accounts: Array<string>) => {
        //
        // }
        //TODO getSessionAccount infor
        const account =  window.sessionStorage.getItem('account');
        if(account){
            const _account:AccountState = JSON.parse(account);
            if(_account.accAddress &&  _account.connectName && _account.connectName !== 'UnKnow') {
                 await ConnectProvides[_account.connectName];
                if(ConnectProvides.usedProvide ){
                    // @ts-ignore
                    const chainId = Number(await ConnectProvides.usedProvide.request({method: 'eth_chainId'}))
                    // // @ts-ignore
                    // const accounts = await ConnectProvides.usedProvide.request({ method: 'eth_requestAccounts' })
                    systemState.updateSystem({ chainId : (chainId? chainId as ChainId:ChainId.MAINNET)  })
                    return
                }
            }
        }

        systemState.updateSystem({chainId:ChainId.MAINNET})





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
    },[ammMapState,tokenState,account.accountId,walletLayer1State])

    // React.useEffect(()=>{
    //
    // },[])



    return {
        state,
    }

}

