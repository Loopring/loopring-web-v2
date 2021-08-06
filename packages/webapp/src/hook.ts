import React from 'react';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { useSystem } from './stores/system';
import { ChainId, sleep } from 'loopring-sdk';
import { useAmmMap } from './stores/Amm/AmmMap';
import { SagaStatus } from '@loopring-web/common-resources';
import { useTokenMap } from './stores/token';
import { useWalletLayer1 } from './stores/walletLayer1';
import { useAccount } from './stores/account/hook';
import { connectProvides, ErrorType, useConnectHook } from '@loopring-web/web3-provider';
import { AccountStep, setShowAccount, useOpenModals, WalletConnectStep } from '@loopring-web/component-lib';
import { myLog } from './utils/log_tools';
import { useAccountHook } from './services/account/useAccountHook';
import { checkAccount } from './services/account/checkAccount';
import { networkUpdate } from './services/account/networkUpdate';
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
    useConnectHandle();
    useAccountHandle();
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

function useConnectHandle() {
    const {account, shouldShow, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const {
        updateSystem,
        chainId: _chainId,
    } = useSystem();
    const {setShowConnect} = useOpenModals();

    const handleConnect = React.useCallback(async ({
                                                       accounts,
                                                       chainId,
                                                   }: { accounts: string, provider: any, chainId: ChainId | 'unknown' }) => {
        const accAddress = accounts[ 0 ];
        myLog('After connect >>,network part start: step1 networkUpdate')
        const networkFlag = networkUpdate({chainId})
        myLog('After connect >>,network part done: step2 check account')
        if(networkFlag){
            checkAccount(accAddress);
        }
        setShowConnect({isShow: shouldShow ?? false, step: WalletConnectStep.SuccessConnect});
        await sleep(1000)
        setShowConnect({isShow: false, step: WalletConnectStep.SuccessConnect});

    }, [_chainId, account, shouldShow])

    const handleAccountDisconnect = React.useCallback(async () => {
        if (account && account.accAddress) {
            resetAccount();
            statusAccountUnset();
            myLog('Disconnect and clear')
        } else {
            myLog('Disconnect with no account')
        }

    }, [account]);

    const handleError = React.useCallback(async ({type, errorObj}: { type: keyof typeof ErrorType, errorObj: any }) => {
        updateSystem({chainId: account._chainId ? account._chainId : 1})
        resetAccount();
        await sleep(10);
        statusAccountUnset();
        myLog('Error')
    }, [account]);

    useConnectHook({handleAccountDisconnect, handleError, handleConnect});

}

function useAccountHandle() {
    const {account, updateAccount, shouldShow, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const handleLockAccount = React.useCallback(()=>{
        // updateAccount({readyState:'NO_ACCOUNT'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.NoAccount});
    },[])
    const handleNoAccount = React.useCallback((data: any)=>{
        // updateAccount({readyState:'NO_ACCOUNT'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.NoAccount});
    },[])
    const handleDepositingAccount = React.useCallback(()=>{
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.Depositing});
    },[])
    const handleErrorApproveToken = React.useCallback(()=>{
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.Depositing});
    },[])
    const handleErrorDepositSign = React.useCallback(()=>{
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.Depositing});
    },[])
    const handleProcessDeposit = React.useCallback(()=>{
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.Depositing});
    },[])
    const handleSignAccount = React.useCallback(()=>{
        // updateAccount({readyState:'DEPOSITING'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.SignAccount});
    },[])
    const handleSignError = React.useCallback(()=>{
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.FailedUnlock});
    },[])
    const handleProcessSign = React.useCallback(()=>{
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.ProcessUnlock});
    },[])
    const handleAccountActive  = React.useCallback(async ()=>{

        //updateAccount({readyState:'ACTIVATED'});
        setShowAccount({isShow: shouldShow ?? false,step:AccountStep.SuccessUnlock});
        await sleep(100)
        setShowAccount({isShow: false});
        statusAccountUnset();
    },[])
    useAccountHook({
        handleLockAccount,// clear private data
        handleNoAccount,//
        // TODO
        //  step1 Approve account;  click allow from provider
        //  step2 send to ETH;  click allow from provider
        handleDepositingAccount,
        handleErrorApproveToken,
        handleErrorDepositSign,
        handleProcessDeposit,// two or one step
        handleSignAccount, //unlock or update account  sgin
        handleProcessSign,
        handleSignError,
        // handleProcessAccountCheck,
        handleAccountActive: handleAccountActive,
    })
}

