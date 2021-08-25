import React from 'react'

import {
    ButtonComponentsMap,
    fnType,
    headerMenuData,
    headerToolBarData,
    LanguageKeys,
    ThemeKeys,
} from '@loopring-web/common-resources'

import { changeShowModel, useAccount, } from 'stores/account'

import { Theme, } from 'defs/common_defs'

import { AccountStep, setShowAccount, useOpenModals, useSettings, } from '@loopring-web/component-lib'

import { accountStaticCallBack, btnClickMap } from 'hooks/help'
import { myLog } from 'utils/log_tools'
import { deepClone } from '../../utils/obj_tools';
import store from '../../stores';

export const useHeader = () => {
    // const {setTheme, themeMode, setLanguage} = useSettings();
    const accountState = useAccount();
    const {account, setShouldShow, status: accountStatus} =  useAccount();
    const {setShowAccount} = useOpenModals();
    const _btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [
            function () {
                setShouldShow(true);
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ],
        [fnType.LOCKED]: [
            function () {
                store.dispatch(changeShowModel({ _userOnModel: true }));
                store.dispatch(setShowAccount({ isShow: true, step: AccountStep.HadAccount }))
            }
        ]
    });

    const onWalletBtnConnect = React.useCallback(async () => {
        myLog(`onWalletBtnConnect click: ${account.readyState}`);
        accountStaticCallBack(_btnClickMap, []);
    }, [account, setShouldShow,_btnClickMap])

    // const onThemeBtnClick = React.useCallback((themeMode: ThemeKeys) => {
    //     if (themeMode === Theme.dark) {
    //         setTheme(Theme.light)
    //     } else {
    //         setTheme(Theme.dark)
    //     }
    // }, [setTheme])
    //
    // const onLangBtnClick = (lang: LanguageKeys) => {
    //     setLanguage(lang);
    // }

    React.useEffect(() => {
        headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
            ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
            accountState,
            handleClick: onWalletBtnConnect,
        }
        // headerToolBarData[ ButtonComponentsMap.Theme ] = {
        //     ...headerToolBarData[ ButtonComponentsMap.Theme ],
        //     themeMode,
        //     handleClick: onThemeBtnClick
        // }
        // headerToolBarData[ ButtonComponentsMap.Language ] = {
        //     ...headerToolBarData[ ButtonComponentsMap.Language ],
        //     handleChange: onLangBtnClick
        // }
    },[]);

    // const forceUpdate = React.useReducer(() => ({}), {})[ 1 ] as () => void
    const updateWallet = React.useCallback(()=>{
        headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
            ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
            accountState,
        }
    },[headerToolBarData,accountState])
    React.useEffect(() => {
        if (accountStatus && accountStatus === 'UNSET') {
            updateWallet()
        }
        // forceUpdate()
    }, [accountStatus]);

    return {
        headerToolBarData,
        headerMenuData,
        account,
    }
}

