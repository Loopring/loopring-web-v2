import store from '../../stores';
import { setShowAccount, setShowConnect, setShowDeposit } from '@loopring-web/component-lib';

export enum fnType {
    RESET,
    UN_CONNECT,
    NO_ACCOUNT,
    LOCKED,
    ACTIVATED,
    DEPOSITING,
    DEFAULT,
}

export const accountStaticCallBack = (onclickMap: { [ key: number ]: [fn: (props: any) => any, args?: any[]] }, deps?: any[]) => {
    const {readyState} = store.getState().account;
    let fn, args;
    [fn, args] = onclickMap[ readyState ] ? onclickMap[ readyState ] : [];
    if (typeof fn === 'function') {
        args = [...(args ?? []), ...(deps ?? [])] as [props: any]
        return fn.apply(this, args);
    }

}


export const bntLabel: typeof btnClickMap = {
    [ fnType.RESET ]: [
        function () {
            return `labelConnectWallet`
        }
    ],
    [ fnType.UN_CONNECT ]: [
        function () {
            return `labelConnectWallet`
        }
    ] ,
    [ fnType.DEFAULT ]: [
        function () {
            return `depositTitleAndActive`
        }
    ], [ fnType.ACTIVATED ]: [
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
    [ fnType.RESET ]: [
        function () {
            store.dispatch(setShowConnect({isShow: true}))
        }
    ],
    [ fnType.UN_CONNECT ]: [
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
            store.dispatch(setShowAccount({isShow: true}))
        }
    ]
};


