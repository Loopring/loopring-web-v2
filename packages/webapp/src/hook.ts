import React from 'react';
import { useSystem } from './stores/system';
import { useAmmMap } from './stores/Amm/AmmMap';
import { STATUS } from './stores/constant';
import { useTokenMap } from './stores/token';
import { useWalletLayer1 } from './stores/walletLayer1';
// import { useAccount } from './stores/account/hook';
import { Commands, ConnectProvides, walletServices } from '@loopring-web/connect-provider';
import { useWalletLayer2 } from './stores/walletLayer2';


/**
 * @description call it when bootstrap the page or change the network
 */
export function useInit() {
    const [state, setState] = React.useState<keyof typeof STATUS>('PENDING');
    const [provider,setProvider] = React.useState<undefined>(undefined);
    const systemState = useSystem();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    // const accountState = useAccount();
    const walletLayer1State = useWalletLayer1();
    const walletLayer2State = useWalletLayer2();
    //store.getState().account
    // const socketState =   useSocket();
    const subject = React.useMemo(() => walletServices.onSocket(), []);
    // React.useEffect( ()=>{
    //     async ()=>{
    React.useMemo(async () => {
        if(window.ethereum && window.ethereum.isMetaMask){
            const _provide = await ConnectProvides.MetaMask;
        } else {
            systemState.updateSystem({chainId:1})
        }
        // const _provide = await ConnectProvides.MetaMask;
        // setProvide(_provide);
        //.then(()=>
        //}
       // );
        // debugger

    },[])
    //     }
    //
    // },[])


    const handleChainChanged = (chainId: any) => {
        // const network = chainId == ChainId.GORLI ? NETWORK.Goerli : NETWORK.MAIN
        systemState.updateSystem({chainId:Number(chainId) as any})
        window.location.reload();
    }
    const handleConnect =  (accounts: Array<string>,provider:any) => {
        //TODO update account info
        walletLayer1State.updateWalletLayer1();
        setProvider(provider);
        //walletLayer2State.resetLayer2();
        //window.location.reload()
    }
    const handleAccountDisconnect = () => {
        //TODO reset wallet 1 and wallet 2  and account info
        walletLayer1State.resetLayer1();
        walletLayer2State.resetLayer2();
        //window.location.reload()
    }
    React.useEffect(() => {
        const subscription = subject.subscribe(({data, status}: { status: keyof typeof Commands, data?: object }) => {
            switch (status) {
                case 'ChangeNetwork':
                    // @ts-ignore
                    const {chainId} = data ? data : {chainId: undefined};
                    handleChainChanged(chainId)
                    // systemState.updateSystem({ chainId })
                    // window.location.reload();
                    console.log(data)
                    break
                case 'ConnectWallet':
                    // @ts-ignore
                    const {accounts,provider} = data ? data : {accounts: undefined};
                    handleConnect(accounts,provider)
                    console.log(data)
                    break
                case 'DisConnect':
                    handleAccountDisconnect()
                    //TODO reset
                    console.log(data)

            }
        });
        return () => subscription.unsubscribe();
    }, [subject]);
    // useCustomDCEffect(async() => {
    //
    //     const handleChainChanged = (chainId: any) => {
    //
    //         // const network = chainId == ChainId.GORLI ? NETWORK.Goerli : NETWORK.MAIN
    //          systemState.updateSystem({ chainId })
    //          window.location.reload();
    //     }
    //
    //     const handleAccountChanged = (accounts: Array<string>) => {
    //         window.location.reload()
    //     }
    //
    //     const provider: any = await detectEthereumProvider()
    //     if (provider) {
    //         const chainId = Number(await provider.request({ method: 'eth_chainId' }))
    //         const accounts = await provider.request({ method: 'eth_requestAccounts' })
    //
    //         provider.on('accountsChanged', handleAccountChanged)
    //         provider.on('chainChanged', ()=>{handleChainChanged(chainId)} )
    //         // @ts-ignore
    //         systemState.updateSystem({ chainId  })
    //        //handleChainChanged(chainId)
    //
    //     } else {
    //         systemState.updateSystem({chainId:ChainId.MAINNET})
    //     }
    //
    // }, [])

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
    }, [
        systemState,
        // systemState.status,
        // systemState.statusUnset,
        //tokenState.getTokenMap

    ]);
    React.useEffect(() => {
        if (ammMapState.status === "ERROR" || tokenState.status === "ERROR") {
            //TODO: solve error
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('ERROR');
        } else if (ammMapState.status === "DONE" && tokenState.status === "DONE") {
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('DONE');
        }
    }, [ammMapState, tokenState,
        // accountState.accountId,
        walletLayer1State])

    // React.useEffect(()=>{
    //
    // },[])


    return {
        state,
    }

}
