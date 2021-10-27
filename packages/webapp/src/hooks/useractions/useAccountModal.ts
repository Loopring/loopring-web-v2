import { useAccount } from '../../stores/account';
import { AccountStep, useOpenModals } from '@loopring-web/component-lib';
import React from 'react';
import { sleep } from '@loopring-web/loopring-sdk';
import { useAccountHook } from '../../services/account/useAccountHook';

export function useAccountModal() {
    const {shouldShow, setShouldShow, statusUnset: statusAccountUnset} = useAccount();
    const {setShowAccount} = useOpenModals();
    const handleErrorAccount = React.useCallback(() => {
        // updateAccount({readyState:'NO_ACCOUNT'});
        statusAccountUnset();
    }, [shouldShow])
    const handleLockAccount = React.useCallback(() => {
        // updateAccount({readyState:'NO_ACCOUNT'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.HadAccount});
    }, [shouldShow])
    const handleNoAccount = React.useCallback((data: any) => {
        // updateAccount({readyState:'NO_ACCOUNT'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.NoAccount});
    }, [shouldShow])
    const handleDepositingAccount = React.useCallback(async () => {
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.Deposit_Submit});
        await sleep(3000)
        setShouldShow(false)
        setShowAccount({isShow: false});
        statusAccountUnset();
    }, [shouldShow])
    const handleErrorApproveToken = React.useCallback(() => {
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.Deposit_WaitForAuth});
    }, [shouldShow])
    const handleErrorDepositSign = React.useCallback(() => {
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.Deposit_Failed});
    }, [shouldShow])
    const handleProcessDeposit = React.useCallback(() => {
        // updateAccount({readyState:'DEPOSITING'});
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.Deposit_Approve_WaitForAuth});
    }, [shouldShow])
    const handleSignAccount = React.useCallback(() => {
        // updateAccount({readyState:'DEPOSITING'});
        statusAccountUnset();
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.UpdateAccount});
    }, [shouldShow])
    const handleSignDeniedByUser = React.useCallback(() => {
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.UnlockAccount_User_Denied});
    }, [shouldShow])
    const handleSignError = React.useCallback(() => {
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.UnlockAccount_Failed});
    }, [shouldShow])
    const handleProcessSign = React.useCallback(() => {
        setShowAccount({isShow: shouldShow ?? false, step: AccountStep.UnlockAccount_WaitForAuth});
    }, [shouldShow])
    const handleAccountActive = React.useCallback(async () => {

        //updateAccount({readyState:'ACTIVATED'});
        // setShowAccount({isShow: shouldShow ?? false, step: AccountStep.UnlockAccount_Success});
        await sleep(1000)
        setShouldShow(false)
        setShowAccount({isShow: false});
        statusAccountUnset();
    }, [shouldShow])
    useAccountHook({
        handleErrorAccount,
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
        handleSignDeniedByUser,
        // handleProcessAccountCheck,
        handleAccountActive: handleAccountActive,
    })
}