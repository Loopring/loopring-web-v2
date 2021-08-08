import React from 'react'

import {
    ButtonComponentsMap,
    fnType,
    headerMenuData,
    headerToolBarData,
    LanguageKeys,
    ThemeKeys,
} from '@loopring-web/common-resources'

import { useAccount, } from 'stores/account'

import { Theme, } from 'defs/common_defs'

import { AccountStep, useOpenModals, useSettings, } from '@loopring-web/component-lib'

import { accountStaticCallBack, btnClickMap } from 'hooks/help'
import { myLog } from 'utils/log_tools'
import { deepClone } from '../../utils/obj_tools';

export const useHeader = () => {
    const {setTheme, themeMode, setLanguage} = useSettings();
    const accountState = useAccount();
    const {account, setShouldShow, status: accountStatus} =  useAccount();
    const {setShowAccount} = useOpenModals();
    const _btnClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [
            function () {
                setShouldShow(true);
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ],
        [ fnType.CONNECT ]: [
            function () {
                setShouldShow(true);
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ]

    });


    const onWalletBtnConnect = React.useCallback(async () => {
        myLog(`onWalletBtnConnect click: ${account.readyState}`);
        setShouldShow(true);
        accountStaticCallBack(_btnClickMap, []);
    }, [account])
    const onThemeBtnClick = React.useCallback(async (themeMode: ThemeKeys) => {
        if (themeMode === Theme.dark) {
            setTheme(Theme.light)
        } else {
            setTheme(Theme.dark)
        }
    }, [setTheme])

    const onLangBtnClick = (lang: LanguageKeys) => {
        setLanguage(lang);
    }


    React.useEffect(() => {
        headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
            ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
            accountState,
            handleClick: onWalletBtnConnect,
        }
        headerToolBarData[ ButtonComponentsMap.Theme ] = {
            ...headerToolBarData[ ButtonComponentsMap.Theme ],
            themeMode,
            handleClick: onThemeBtnClick
        }
        headerToolBarData[ ButtonComponentsMap.Language ] = {
            ...headerToolBarData[ ButtonComponentsMap.Language ],
            handleChange: onLangBtnClick
        }

    }, []);

    const forceUpdate = React.useReducer(() => ({}), {})[ 1 ] as () => void
    React.useEffect(() => {
        if (accountStatus && accountStatus === 'UNSET') {
            headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                accountState,
            }
        }
        forceUpdate()
    }, [accountStatus]);

    return {
        headerToolBarData,
        headerMenuData,
        account,
    }
}

