import { useAccount } from '../stores/account';
import { AccountStep, setShowAccount } from '@loopring-web/component-lib';
import React from 'react';
import { sleep } from 'loopring-sdk';
import { useAccountHook } from '../services/account/useAccountHook';

export  function useAccountModal() {
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