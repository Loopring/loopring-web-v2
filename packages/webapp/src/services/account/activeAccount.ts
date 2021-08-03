import { statusUnset as statusAccountUnset, updateAccountStatus } from '../../stores/account';
import { AccountStep, setShowAccount, setShowConnect } from '@loopring-web/component-lib';
import { dumpError400, generateKeyPair, sleep, toBig, toHex } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from '../../stores/apis/api';
import { AccountInfo } from 'loopring-sdk/dist/defs/account_defs';
import store from '../../stores';
import { AccountStatus } from '@loopring-web/common-resources';
import { unlockAccount } from './unlockAccount';

export async function activeAccount({reason,shouldShow}: { reason:any,shouldShow:boolean }) {
    const account = store.getState().account;
    // const {exchangeInfo} = store.getState().system;
    if (reason?.response?.data?.resultInfo?.code === 100001) {
        // deposited, but need update account
        console.log('SignAccount')
        store.dispatch(setShowConnect({isShow: false}));
        store.dispatch(setShowAccount({isShow: true, step: AccountStep.SignAccount}));
        store.dispatch(updateAccountStatus({readyState: AccountStatus.DEPOSITING}));

    } else {
        // need to deposit.
        let activeDeposit = localStorage.getItem('activeDeposit');
        if (activeDeposit) {
            activeDeposit = JSON.stringify(activeDeposit);
        }
        if (activeDeposit && activeDeposit[ account.accAddress ]) {
            console.log('DEPOSITING')
            store.dispatch(setShowConnect({isShow: false}));
            store.dispatch(setShowAccount({isShow: shouldShow, step: AccountStep.Depositing}));
            store.dispatch(updateAccountStatus({readyState: AccountStatus.DEPOSITING}));
            // store.dispatch(statusAccountUnset(undefined))
        } else {
            console.log('NO_ACCOUNT')
            setShowConnect({isShow: false});
            setShowAccount({isShow: shouldShow, step: AccountStep.NoAccount});
            store.dispatch(updateAccountStatus({readyState: AccountStatus.NO_ACCOUNT}));
            // store.dispatch(statusAccountUnset(undefined));
        }
    }
}