import React from 'react'

import {
    ButtonComponentsMap,
    fnType,
    headerMenuData,
    headerToolBarData as _initHeaderToolBarData,
    LanguageKeys,
    ThemeKeys,
} from '@loopring-web/common-resources'

import { changeShowModel, useAccount, } from 'stores/account'

import { Theme, } from 'defs/common_defs'

import {
    AccountStepNew as AccountStep,
    HeaderToolBarInterface,
    setShowAccount,
    useOpenModals,
    useSettings,
} from '@loopring-web/component-lib'

import { accountStaticCallBack, btnClickMap } from 'hooks/help'
import { myLog } from 'utils/log_tools'
import { deepClone } from '../../utils/obj_tools';
import store from '../../stores';

export const useHeader = () => {
    // const {setTheme, themeMode, setLanguage} = useSettings();
    const accountTotal = useAccount();
    const {account, setShouldShow, status: accountStatus} = accountTotal;
    const {setShowAccount} = useOpenModals();
    const accountState = React.useMemo(()=>{
       return {account}
    },[account])
    const [headerToolBarData,setHeaderToolBarData] = React.useState<typeof _initHeaderToolBarData>(_initHeaderToolBarData);
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
        // headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
        //     ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
        //     accountState,
        //     handleClick: onWalletBtnConnect,
        // }
        setHeaderToolBarData((headerToolBarData)=>{
            return {
                ...headerToolBarData,
                [ ButtonComponentsMap.WalletConnect ]:{
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    accountState,
                    handleClick: onWalletBtnConnect,
                }

            } as HeaderToolBarInterface[]
        })
    },[]);

    React.useEffect(() => {
        if (accountStatus && accountStatus === 'UNSET') {
            //updateWallet()
            setHeaderToolBarData((headerToolBarData)=>{
                headerToolBarData[ ButtonComponentsMap.WalletConnect ].accountState = accountState;
                return  headerToolBarData;
            })
        }
        // forceUpdate()
    }, [accountStatus]);

    return {
        headerToolBarData,
        headerMenuData,
        account,
    }
}

