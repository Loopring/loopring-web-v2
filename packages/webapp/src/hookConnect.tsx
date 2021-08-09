import { useAccount } from './stores/account';
import { useSystem } from './stores/system';
import { useOpenModals, WalletConnectStep } from '@loopring-web/component-lib';
import React from 'react';
import { ChainId, sleep } from 'loopring-sdk';
import { myLog } from './utils/log_tools';
import { networkUpdate } from './services/account/networkUpdate';
import { checkAccount } from './services/account/checkAccount';
import { ErrorType, useConnectHook } from '@loopring-web/web3-provider';
import { SagaStatus } from '@loopring-web/common-resources';

export  function useConnect({state}: { state: keyof typeof SagaStatus }) {
    const {account, shouldShow, resetAccount, statusUnset: statusAccountUnset, setShouldShow,status:accountStatus } = useAccount();
    const {updateSystem, chainId: _chainId, status: systemStatus, statusUnset: systemStatusUnset} = useSystem();
    const {setShowConnect} = useOpenModals();
    const [stateAccount,setStateAccount] = React.useState<SagaStatus>(SagaStatus.DONE);
    React.useEffect(()=>{
        if(stateAccount === SagaStatus.PENDING && accountStatus === SagaStatus.DONE) {
            setStateAccount(SagaStatus.DONE)
            statusAccountUnset();
        }
    },[stateAccount,accountStatus])
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
        setShouldShow(false)
        setShowConnect({isShow: shouldShow ?? false, step: WalletConnectStep.SuccessConnect});
        await sleep(1000)
        setShowConnect({isShow: false, step: WalletConnectStep.SuccessConnect});

    }, [_chainId, account, shouldShow])

    const handleAccountDisconnect = React.useCallback(async () => {
        await resetAccount({shouldUpdateProvider:true});
        setStateAccount(SagaStatus.PENDING)
    }, [state]);

    const handleError = React.useCallback(async ({type, errorObj}: { type: keyof typeof ErrorType, errorObj: any }) => {
        updateSystem({chainId: account._chainId ? account._chainId : 1})
        resetAccount();
        statusAccountUnset();
        myLog('Error')
    }, [account]);

    useConnectHook({handleAccountDisconnect, handleError, handleConnect});

}