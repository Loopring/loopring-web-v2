import store from '../stores';
import { AccountStep, setShowAccount, setShowConnect, WalletConnectStep } from '@loopring-web/component-lib';
import { fnType } from '@loopring-web/common-resources';
import { changeShowModel } from 'stores/account';
import { accountServices } from 'services/account/accountServices'
import { myLog } from "@loopring-web/common-resources";
import { unlockAccount } from '../services/account/unlockAccount';

export const accountStaticCallBack = (onclickMap: { [ key: number ]: [fn: (props: any) => any, args?: any[]] }, deps?: any[]) => {
    const {readyState} = store.getState().account;

    let fn, args;
    [fn, args] = onclickMap[ readyState ] ? onclickMap[ readyState ] : [];
    if (typeof fn === 'function') {
        args = [...(args ?? []), ...(deps ?? [])] as [props: any]
        return fn.apply(this, args);
    }

}

export const btnLabel = {
    [ fnType.UN_CONNECT ]: [
        function () {
            return `labelConnectWallet`
        }
    ],
    [ fnType.ERROR_NETWORK ]: [
        function () {
            return `labelWrongNetwork`
        }
    ],
    [ fnType.NO_ACCOUNT ]: [
        function () {
            return `depositTitleAndActive`
        }
    ],
    [ fnType.DEFAULT ]: [
        function () {
            return `depositTitleAndActive`
        }
    ],
    [ fnType.NOT_ACTIVE ]: [
        function () {
            return `depositTitleActive`
        }
    ],
    [ fnType.ACTIVATED ]: [
        function () {
            return undefined
        }
    ],
    [ fnType.LOCKED ]: [
        function () {
            return `labelUnLockLayer2`
        }
    ]
};


export const btnClickMap: { [ key: string ]: [fn: (props: any) => any, args?: any[]] } = {
    [ fnType.ERROR_NETWORK ]: [
        function () {
            //TODO toast
            myLog('get error network!')
        }
    ],
    [ fnType.UN_CONNECT ]: [
        function () {
            myLog('UN_CONNECT!',);
            store.dispatch(changeShowModel({_userOnModel: true}));
            store.dispatch(setShowConnect({isShow: true, step: WalletConnectStep.Provider}))
        }
    ]
    , [ fnType.NO_ACCOUNT ]: [
        function () {
            myLog('NO_ACCOUNT! sendCheckAcc',);
            store.dispatch(changeShowModel({_userOnModel: true}));
            accountServices.sendCheckAcc()
        }
    ]
    , [ fnType.DEPOSITING ]: [
        function () {
            myLog('DEPOSITING! sendCheckAcc',);
            store.dispatch(changeShowModel({_userOnModel: true}));
            accountServices.sendCheckAcc()
        }
    ]
    , [ fnType.NOT_ACTIVE ]: [
        function () {
            myLog('NOT_ACTIVE! sendCheckAcc',);
            store.dispatch(changeShowModel({_userOnModel: true}));
            accountServices.sendCheckAcc()
        }
    ]
    , [ fnType.LOCKED ]: [
        function () {
            unlockAccount();
            store.dispatch(changeShowModel({_userOnModel: true}));
            store.dispatch(setShowAccount({isShow: true, step: AccountStep.UnlockAccount_WaitForAuth}))
        }
    ]
};

