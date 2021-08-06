import React, { useState } from 'react'

import {
    AmmData,
    AmmInData,
    ButtonComponentsMap,
    CoinMap,
    fnType,
    headerMenuData,
    headerToolBarData,
    IBData,
    LanguageKeys,
    ThemeKeys,
    TradeCalcData,
    WalletMap,
} from '@loopring-web/common-resources'

import { useAccount, } from 'stores/account'


import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import { Theme, } from 'defs/common_defs'

import {
    AccountBaseProps,
    AccountStep,
    AmmProps,
    CoinType,
    ResetProps,
    setShowAccount,
    SwapProps,
    SwitchData,
    TradeBtnStatus,
    useSettings,
} from '@loopring-web/component-lib'

import * as sdk from 'loopring-sdk'
import { dumpError400, GetOffchainFeeAmtRequest, LoopringMap, OffchainFeeReqType, toBig, TokenInfo } from 'loopring-sdk'

import { useModals } from 'modal/useModals'

import { accountStaticCallBack, btnClickMap, makeWalletLayer2 } from 'hooks/help'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { useTokenMap } from 'stores/token'
import { LoopringAPI } from 'stores/apis/api'
import { BIG10 } from 'defs/swap_defs'
import { useWalletLayer1 } from '../../stores/walletLayer1';
import { myLog } from 'utils/log_tools'
import { useSystem } from '../../stores/system';
import { useDeposit } from '../../modal/useDeposit';
import { useTransfer } from '../../modal/useTransfer';
import { useWithdraw } from '../../modal/useWithdraw';
import { deepClone } from '../../utils/obj_tools';

export const useHeader = () => {
    // const {i18n, t} = useTranslation(['common', 'layout'])
    // const _headerToolBarData = React.useMemo(()=>headerToolBarData,[])
    // const headerToolBarData = deepClone(_headerToolBarData);
    const {setTheme, themeMode, setLanguage} = useSettings();
    // const {ShowDeposit} = useModals()
    const accountState = useAccount();
    const {account, setShouldShow, status: accountStatus, statusUnset: accoutStatusUnset} = accountState;
    const [accountInfoProps, setAccountBaseProps] = React.useState<undefined | AccountBaseProps>(undefined)
    //const theme: any = useTheme()

    // const onNotification = React.useCallback(async () => {
    //     myLog('onNotification click')
    // }, [])
    const _btnClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [
            function () {
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ],
        [ fnType.CONNECT ]: [
            function () {
                setShowAccount({isShow: true, step: AccountStep.HadAccount})
            }
        ]

    });


    const onWalletBtnConnect = React.useCallback(async () => {
        // const acc = store.getState().account
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
        if (accountState && accountState.status === 'UNSET') {
            headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                accountState,
            }
        }
        forceUpdate()
    }, [accountStatus]);

    return {
        // connectStep,
        headerToolBarData,
        headerMenuData,
        // gatewayList,
        // isShowConnect,
        // isShowAccount,
        // setShowAccount,
        // setShowConnect,
        // etherscanUrl,
        // open,
        // setOpen,
        // openConnect,
        // setOpenConnect,
        account,
        // accountInfoProps,

    }

}

