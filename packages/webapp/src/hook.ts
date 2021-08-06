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
    const {updateWalletLayer1, resetLayer1, status:walletLayer1Status,statusUnset:wallet1statusUnset} = useWalletLayer1()
    const {updateWalletLayer2, resetLayer2, status:walletLayer2Status,statusUnset:wallet2statusUnset } = useWalletLayer2();
    const {account, resetAccount, status:accountStatus} = useAccount();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    const {
        updateSystem,
        status: systemStatus,
        statusUnset: systemStatusUnset
    } = useSystem();
    const walletLayer1State = useWalletLayer1();
    useCustomDCEffect(async () => {
        // TODO getSessionAccount infor
        if (account.accAddress !== '' && account.connectName && account.connectName !== 'UnKnown') {
            try {
                await connectProvides[ account.connectName ]();
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
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
        if (ammMapState.status === "ERROR" || tokenState.status === "ERROR") {
            //TODO: solve errorx
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('ERROR');
        } else if (ammMapState.status === "DONE" && tokenState.status === "DONE") {
            ammMapState.statusUnset();
            tokenState.statusUnset();
            setState('DONE');
        }
    }, [ammMapState, tokenState, account.accountId, walletLayer1State])
    React.useEffect(() => {
        switch (account.readyState){
            case 'UN_CONNECT':
            case 'ERROR_NETWORK':
                resetLayer1();
                break;
            case 'NO_ACCOUNT':
            case 'DEPOSITING':
            case 'LOCKED':
                resetLayer2();
                updateWalletLayer1();
                break;
            case 'ACTIVATED':
                updateWalletLayer1();
                updateWalletLayer2();

        }
    }, [accountStatus]);
    React.useEffect(() => {
        switch (walletLayer1Status) {
            case "ERROR":
                wallet1statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                wallet1statusUnset();
                //setWalletMap1(walletLayer1State.walletLayer1);
                break;
            default:
                break;

        }
    }, [walletLayer1Status]);
    React.useEffect(() => {
        switch (walletLayer1Status) {
            case "ERROR":
                wallet2statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                wallet2statusUnset();
                //setWalletMap1(walletLayer1State.walletLayer1);
                break;
            default:
                break;

        }
    }, [walletLayer2Status])
    return {
        state,
    }
}


