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
import { cleanLayer2, goErrorNetWork } from './services/account/lockAccount';
import { useAccountHook } from './services/account/useAccountHook';
import { checkAccount } from './services/account/checkAccount';

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
    // const systemState = useSystem();
    const tokenState = useTokenMap();
    const ammMapState = useAmmMap();
    const {
        updateSystem,

        status: systemStatus,
        statusUnset: systemStatusUnset
    } = useSystem();
    const {account,resetAccount} = useAccount();
    const walletLayer1State = useWalletLayer1();
    useConnectHandle();
    useAccountHandle();
    useCustomDCEffect(async () => {
        // TODO getSessionAccount infor
        if (account.accAddress && account.connectName && account.connectName !== 'UnKnown' && account.accAddress) {
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
        } else if (account.chainId && account.chainId!=='unknown') {
            updateSystem({chainId: account.chainId})
        } else {
                resetAccount();
            updateSystem({chainId: ChainId.MAINNET})
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

    return {
        state,
    }
}

function useConnectHandle() {
    const {account, updateAccount, shouldShow, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const {
        updateSystem,
        chainId: _chainId,
    } = useSystem();
    const {setShowConnect, setShowAccount} = useOpenModals();

    const handleConnect = React.useCallback(async ({
                                                       accounts,
                                                       chainId,
                                                       provider
                                                   }: { accounts: string, provider: any, chainId: ChainId | 'unknown' }) => {
        const accAddress = accounts[ 0 ];

        if (chainId !== _chainId && _chainId !== 'unknown' && chainId !== 'unknown') {
            chainId === 5 ? updateAccount({chainId}) : updateAccount({chainId: 1})
            updateSystem({chainId});
            window.location.reload();
        } else if (chainId == 'unknown') {
            updateAccount({wrongChain: true})
            goErrorNetWork();
        }else{
            updateAccount({wrongChain: false,chainId})
        }
        if(account.accAddress === accAddress){
            myLog('After connect >>,same account: step1 check account')
            checkAccount(accAddress);
        } else {
            myLog('After connect >>,diff account clean layer2: step1 check account')
            cleanLayer2();
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
        updateSystem({chainId: account.chainId ? account.chainId : 1})
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
    const handleAccountActived  = React.useCallback(async ()=>{

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
        handleAccountActived,
    })
}

