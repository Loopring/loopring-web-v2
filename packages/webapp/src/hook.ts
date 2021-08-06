import React from 'react';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { useSystem } from './stores/system';
import { ChainId, sleep } from 'loopring-sdk';
import { useAmmMap } from './stores/Amm/AmmMap';
import { SagaStatus } from '@loopring-web/common-resources';
import { useTokenMap } from './stores/token';
import { useWalletLayer1 } from './stores/walletLayer1';
import { useAccount } from './stores/account/hook';
import { connectProvides} from '@loopring-web/web3-provider';
import { useWalletLayer2 } from './stores/walletLayer2';
import store from './stores';
import { useAccountInit } from './hookAccountInit';
import { useAmmActivityMap } from './stores/Amm/AmmActivityMap';
// import { statusUnset as accountStatusUnset } from './stores/account';

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
    const [state, setState] = React.useState<keyof typeof SagaStatus>('PENDING')
    // const {updateWalletLayer1, resetLayer1, status:walletLayer1Status,statusUnset:wallet1statusUnset} = useWalletLayer1()
    // const {updateWalletLayer2, resetLayer2, status:walletLayer2Status,statusUnset:wallet2statusUnset } = useWalletLayer2();
    const {account, updateAccount, resetAccount, status:accountStatus,statusUnset:accountStatusUnset} = useAccount();
    const {status: tokenMapStatus, statusUnset: tokenMapStatusUnset}  = useTokenMap();
    const {status: ammMapStatus, statusUnset: ammMapStatusUnset}  = useAmmMap();
    const {updateSystem, status: systemStatus, statusUnset: systemStatusUnset} = useSystem();
    const {status:ammActivityMapStatus,statusUnset:ammActivityMapStatusUnset}  = useAmmActivityMap()

    // const walletLayer1State = useWalletLayer1();

    useCustomDCEffect(async () => {
        // TODO getSessionAccount infor

        if (account.accAddress !== '' && account.connectName && account.connectName !== 'UnKnown') {
            try {
                await connectProvides[ account.connectName ]();
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    updateAccount({})
                    return
                }
            } catch (error) {
                console.log(error)
            }
        } else  {
            if(account.accAddress === '' ||  account.connectName === 'UnKnown' ){
                resetAccount() 
            }
            const chainId = account._chainId && account._chainId !=='unknown'? account._chainId  :ChainId.MAINNET
            updateSystem({chainId})
        }

    }, [])
    React.useEffect(() => {
        switch (systemStatus) {
            case "ERROR":
                systemStatusUnset();
                setState('ERROR')
                //TODO show error at button page show error  some retry dispat again
                break;
            case "DONE":
                systemStatusUnset();
                break;
            default:
                break;
        }
    }, [systemStatus, systemStatusUnset]);
    React.useEffect(() => {
        switch (tokenMapStatus) {
            case "ERROR":
                tokenMapStatusUnset();
                setState('ERROR')
                break;
            case "DONE":
                tokenMapStatusUnset();
                break;
            default:
                break;
        }
        switch (ammMapStatus) {
            case "ERROR":
                ammMapStatusUnset();
                setState('ERROR')
                break;
            case "DONE":
                ammMapStatusUnset();
                break;
            default:
                break;
        }
        if(tokenMapStatus === SagaStatus.UNSET && ammMapStatus ===  SagaStatus.UNSET ){
            setState('DONE')
        }
    }, [tokenMapStatus,ammMapStatus])

    React.useEffect(() => {
        switch (ammActivityMapStatus) {
            case "ERROR":
                ammActivityMapStatusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                ammActivityMapStatusUnset();
                break;
            default:
                break;
        }
    }, [ammActivityMapStatus])
    useAccountInit({state})
    // React.useEffect(() => {
    //     if (tokenMapStatus === SagaStatus.ERROR|| tokenState.status === "ERROR") {
    //         //TODO: solve errorx
    //         ammMapState.statusUnset();
    //
    //         setState('ERROR');
    //     } else if(){
    //         ammMapState.statusUnset();
    //         tokenState.statusUnset();
    //     }
    //     if (ammMapState.status === "DONE" && tokenState.status === "DONE") {
    //
    //         setState('DONE');
    //     }
    // }, [ammMapStatus])


    return {
        state,
    }
}


