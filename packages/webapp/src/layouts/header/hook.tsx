import React from 'react'

import {
    ButtonComponentsMap,
    fnType,
    headerMenuData,
    headerToolBarData as _initHeaderToolBarData,
} from '@loopring-web/common-resources'

import { changeShowModel, useAccount, } from 'stores/account'


import { AccountStep, HeaderToolBarInterface, useOpenModals, } from '@loopring-web/component-lib'

import { accountStaticCallBack, btnClickMap } from 'hooks/help'
import { myLog } from "@loopring-web/common-resources";

import store from '../../stores';
import _ from 'lodash'

export const useHeader = () => {
    // const {setTheme, themeMode, setLanguage} = useSettings();
    const accountTotal = useAccount();
    const {account, setShouldShow, status: accountStatus} = accountTotal;
    const {setShowAccount} = useOpenModals();
    const accountState = React.useMemo(() => {
        return {account}
    }, [account])
    const [headerToolBarData, setHeaderToolBarData] = React.useState<typeof _initHeaderToolBarData>(_initHeaderToolBarData);
    const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
        [ fnType.ACTIVATED ]: [
            function () {
                setShouldShow(true);
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ],
        [ fnType.LOCKED ]: [
            function () {
                store.dispatch(changeShowModel({_userOnModel: true}));
                store.dispatch(setShowAccount({isShow: true, step: AccountStep.HadAccount}))
            }
        ]
    });

    const onWalletBtnConnect = React.useCallback(async () => {
        myLog(`onWalletBtnConnect click: ${account.readyState}`);
        accountStaticCallBack(_btnClickMap, []);
    }, [account, setShouldShow, _btnClickMap])
    React.useEffect(() => {
        setHeaderToolBarData((headerToolBarData) => {
            return {
                ...headerToolBarData,
                [ ButtonComponentsMap.WalletConnect ]: {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    accountState,
                    handleClick: onWalletBtnConnect,
                }

            } as HeaderToolBarInterface[]
        })
    }, []);

    React.useEffect(() => {
        if (accountStatus && accountStatus === 'UNSET') {

            setHeaderToolBarData((headerToolBarData) => {
                return {
                    ...headerToolBarData,
                    [ ButtonComponentsMap.WalletConnect ]: {
                        ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                        accountState,
                    }

                } as HeaderToolBarInterface[]
            })
        }
        // forceUpdate()
    }, [accountStatus, account.readyState]);

    return {
        headerToolBarData,
        headerMenuData,
        account,
    }
}

