import store from '../../stores';
import { AccountStatus } from '../../state_machine/account_machine_spec';
import { setShowAccountInfo, setShowConnect, setShowDeposit } from '@loopring-web/component-lib';

export enum fnType {
    UNKNOWN,
    UNCONNNECTED,
    CONNECTED,
    NOACCOUNT,
    DEPOSITED_NO_UPDATE_ACCOUNT,
    LOCKED,
    ACTIVATED,
    DEFAULT
}

export const accountStaticCallBack = (onclickMap: { [ key: number ]: [fn: (props: any) => any, args?: any[]] }, deps?: any[]) => {
    const {status} = store.getState().account;
    let fn, args;
    switch (status) {
        case AccountStatus.UNKNOWN:
            [fn, args] = onclickMap[ fnType.UNKNOWN ] ? onclickMap[ fnType.UNKNOWN ] : [];
            break
        case AccountStatus.UNCONNECTED:
            [fn, args] = onclickMap[ fnType.UNCONNNECTED ] ? onclickMap[ fnType.UNCONNNECTED ] : [];
            break
        case AccountStatus.CONNECTED:
            [fn, args] = onclickMap[ fnType.CONNECTED ] ? onclickMap[ fnType.CONNECTED ] : [];
            break
        case AccountStatus.NOACCOUNT:
            [fn, args] = onclickMap[ fnType.NOACCOUNT ] ? onclickMap[ fnType.NOACCOUNT ] : [];
            break;
        case AccountStatus.DEPOSITED_NO_UPDATE_ACCOUNT:
            [fn, args] = onclickMap[ fnType.DEPOSITED_NO_UPDATE_ACCOUNT ] ? onclickMap[ fnType.DEPOSITED_NO_UPDATE_ACCOUNT ] : [];
            break;
        case AccountStatus.DEPOSITED_NO_UPDATE_ACCOUNT:
            [fn, args] = onclickMap[ fnType.DEPOSITED_NO_UPDATE_ACCOUNT ] ? onclickMap[ fnType.DEPOSITED_NO_UPDATE_ACCOUNT ] : [];
            break;
        case AccountStatus.LOCKED:
            [fn, args] = onclickMap[ fnType.LOCKED ] ? onclickMap[ fnType.LOCKED ] : [];
            break;
        case AccountStatus.ACTIVATED:
            [fn, args] = onclickMap[ fnType.ACTIVATED ] ? onclickMap[ fnType.ACTIVATED ] : [];
            break;
        default:
            //[fn, args] = onclickMap[ fnType.DEFAULT ] ? onclickMap[ fnType.DEFAULT ] : [];
            break;
    }


    if (fn === undefined) {
        [fn, args] = onclickMap[ fnType.DEFAULT ] ? onclickMap[ fnType.DEFAULT ] : [];
    }
    if (typeof fn === 'function') {
        args = [...(args ?? []), ...(deps ?? [])] as [props: any]
        return fn.apply(this, args);
    }

    // break;
    // [fn, args] = props[ fnType.DEFAULT ]?props[ fnType.DEFAULT ]:[];
    // if (typeof fn === 'function') {
    //     return fn.call(this, args);
    // }
}


export const bntLabel: typeof btnClickMap = {
    [ fnType.UNCONNNECTED ]: [
        function () {
            return `labelConnectWallet`
        }
    ]
    , [ fnType.DEFAULT ]: [
        function () {
            return `depositTitleAndActive`
        }
    ]
    , [ fnType.ACTIVATED ]: [
        function () {
            return undefined
        }
    ]
    , [ fnType.LOCKED ]: [
        function () {
            return `labelUnLockLayer2`
        }
    ]
};


export const btnClickMap: { [ key: number ]: [fn: (props: any) => any, args?: any[]] } = {
    [ fnType.UNCONNNECTED ]: [
        function () {
            // setShowConnect({isShow: true})
            store.dispatch(setShowConnect({isShow: true}))
        }
    ]
    , [ fnType.DEFAULT ]: [
        function () {
            store.dispatch(setShowDeposit({isShow: true}))
            // ShowDeposit(true)
        }
    ]

    , [ fnType.LOCKED ]: [
        function () {
            store.dispatch(setShowAccountInfo({isShow: true}))
        }
    ]
};


