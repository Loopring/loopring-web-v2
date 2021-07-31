import React from 'react';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { useSystem } from './stores/system';
import { ChainId } from 'loopring-sdk';
import { useAmmMap } from './stores/Amm/AmmMap';
import { STATUS } from './stores/constant';
import { useTokenMap } from './stores/token';
import { useWalletLayer1 } from './stores/walletLayer1';
import { useAccount } from './stores/account/hook';
import { connectProvides, useConnectHook } from '@loopring-web/web3-provider';
import { AccountState } from './stores/account';


/**
 * @description
 * @step1 subscribe Connect hook
 * @step2 check the session storage ? choose the provider : none provider
 * @step3 decide china Id by step2
 * @step4 prepare the static date (tokenMap, ammMap, faitPrice, gasPrice, forex, Activities ...)
 * @step5 launch the page
 * @todo each step has error show the ErrorPage , next version for service maintain page.
 */
export function useInit() {
    const [state, setState] = React.useState<keyof typeof STATUS>('PENDING')
    const systemState = useSystem();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    const {account,updateAccount, status: accountStatus} = useAccount();
    const walletLayer1State = useWalletLayer1()
    const handleChainChanged = React.useCallback(async (chainId) => {
        // const accAddress= await connectProvides.usedWeb3?.eth.accounts[0];
        // if(accAddress && account.accAddress !== accAddress) {
        //     updateAccount({accAddress})
        // }
        if(chainId !== systemState.chainId) {
            systemState.updateSystem({chainId});
            window.location.reload();
        }
    }, [systemState])
    useConnectHook({handleChainChanged});
    useCustomDCEffect(async () => {
        // TODO getSessionAccount infor
        if (account && account.connectName && account.accAddress) {
            if (account.accAddress && account.connectName && account.connectName !== 'UnKnow') {
                await connectProvides[ account.connectName ]();
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    systemState.updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    return
                }
            }
        }


        //TEST:
        // await connectProvides.MetaMask();
        // if (connectProvides.usedProvide) {
        //     // @ts-ignore
        //     const chainId = Number(await connectProvides.usedProvide.request({method: 'eth_chainId'}))
        //     // // @ts-ignore
        //     //const accounts = await connectProvides.usedProvide.request({ method: 'eth_requestAccounts' })
        //     systemState.updateSystem({chainId: (chainId ? chainId as ChainId : ChainId.MAINNET)})
        //     return
        // }

        systemState.updateSystem({chainId: ChainId.MAINNET})


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
                break;
            default:
                break;
        }
    }, [
        systemState]);
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
    }, [ammMapState, tokenState, account.accountId, walletLayer1State])

    return {
        state,
    }

}

