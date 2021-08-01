import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
    AccountStatus,
    AmmData,
    AmmInData,
    ButtonComponentsMap,
    CoinMap,
    fnType,
    headerMenuData,
    HeaderMenuTabStatus,
    headerToolBarData,
    HeadMenuTabKey,
    IBData,
    LanguageKeys,
    ThemeKeys,
    TradeCalcData,
    WalletMap,
    WalletStatus,
} from '@loopring-web/common-resources'

import { useAccount, } from 'stores/account'

import { getShortAddr } from 'utils/web3_tools'

// import {  } from 'state_machine/account_machine_spec'
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import { Theme, } from 'defs/common_defs'

import {
    AccountBaseProps,
    AccountStep,
    AmmProps,
    CoinType,
    ResetProps,
    SwapProps,
    SwitchData,
    TradeBtnStatus,
    useOpenModals,
    useSettings,
} from '@loopring-web/component-lib'

import * as sdk from 'loopring-sdk'
import { dumpError400, GetOffchainFeeAmtRequest, LoopringMap, OffchainFeeReqType, toBig, TokenInfo } from 'loopring-sdk'

import { useModals } from 'hooks/modal/useModals'

import { accountStaticCallBack, btnClickMap, makeWalletLayer2 } from 'hooks/help'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { useTokenMap } from 'stores/token'
import { LoopringAPI } from 'stores/apis/api'
import { BIG10 } from 'defs/swap_defs'
import { useWalletLayer1 } from '../../stores/walletLayer1';
import { myLog } from 'utils/log_tools'
import { useSystem } from '../../stores/system';
import { useDeposit } from '../../hooks/useDeposit';
import { useTransfer } from '../../hooks/useTransfer';
import { useWithdraw } from '../../hooks/useWithdraw';
import { useDispatch } from 'react-redux';
import store from '../../stores';
import { deepClone } from '../../utils/obj_tools';

export const useHeader = () => {
    const {i18n, t} = useTranslation(['common', 'layout'])
    const {setTheme, themeMode, language, setLanguage} = useSettings();
    const {ShowDeposit} = useModals()
    const {modals: {isShowAccount, isShowConnect}, setShowConnect, setShowAccount} = useOpenModals()
    const {etherscanUrl} = useSystem();
    // const forceUpdate = React.useReducer((bool) => !bool, false)[ 1 ]
    const {account, updateAccount, status: accountStatus, errorMessage} = useAccount();
    const dispatch = useDispatch();
    // const [showAccountInfo, setShowAccount] = React.useState(account?.accAddr ? true : false)
    const [accountInfoProps, setAccountBaseProps] = React.useState<undefined | AccountBaseProps>(undefined)
    //const theme: any = useTheme()

    const onNotification = React.useCallback(async () => {
        myLog('onNotification click')
    }, [])

    const _btnClickMap: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [
            function () {
                store.dispatch(setShowAccount({isShow: true, step: AccountStep.HadAccount}))
            }
        ],
        [ fnType.CONNECT ]: [
            function () {
                // setShowConnect({isShow: true})
                store.dispatch(setShowAccount({isShow: true, step: AccountStep.HadAccount}))
            }
        ]

    });

    const onWalletBtnConnect = React.useCallback(async () => {
        // const acc = store.getState().account
        myLog(`onWalletBtnConnect click: ${account.readyState}`)
        accountStaticCallBack(_btnClickMap, [])
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

    React.useEffect(() => {
        const {readyState} = account
        const addressShort = getShortAddr(account.accAddress);
        switch (readyState) {
            case AccountStatus.UN_CONNECT:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: t('labelConnectWallet'),
                    status: WalletStatus.default
                }
                headerMenuData[ HeadMenuTabKey.Layer2 ] = {
                    //TODO:  HeaderMenuTabStatus.hidden
                    ...headerMenuData[ HeadMenuTabKey.Layer2 ], status: HeaderMenuTabStatus.hidden
                }
                // setShowAccount({isShow: false})
                break
            case AccountStatus.CONNECT:
            case AccountStatus.LOCKED:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addressShort,
                    status: WalletStatus.connect
                };
                break
            case AccountStatus.ACTIVATED:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addressShort,
                    status: WalletStatus.unlock
                }
                break
            case AccountStatus.NO_ACCOUNT:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    // TODO got cache address if no show Connect Wallet
                    label: addressShort,
                    status: WalletStatus.noAccount
                }

                // updateHeaderMenuWhenHasAccountInfo({readyState});
                break
            case AccountStatus.DEPOSITING:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addressShort,
                    status: WalletStatus.accountPending
                }
                // updateHeaderMenuWhenHasAccountInfo({readyState});

                break
        }
    }, [account.readyState, language])


    return {
        // connectStep,
        headerToolBarData,
        headerMenuData,
        // gatewayList,
        isShowConnect,
        isShowAccount,
        setShowAccount,
        setShowConnect,
        etherscanUrl,
        // open,
        // setOpen,
        // openConnect,
        // setOpenConnect,
        account,
        accountInfoProps,

    }

}

export function useChargeFeeList(tokenSymbol: string | undefined, requestType: OffchainFeeReqType,
                                 tokenMap: LoopringMap<TokenInfo> | undefined, amount?: number) {

    const {account} = useAccount()

    const [chargeFeeList, setChargeFeeList] = useState<any[]>([])

    useCustomDCEffect(async () => {

        if (account.accountId === -1 || !tokenSymbol || !tokenMap || !LoopringAPI.userAPI) {
            return
        }

        let chargeFeeList: any[] = []

        try {
            const tokenInfo = tokenMap[ tokenSymbol ]

            const request: GetOffchainFeeAmtRequest = {
                accountId: account.accountId,
                tokenSymbol,
                requestType,
                amount: amount ? toBig(amount).times('1e' + tokenInfo.decimals).toFixed(0, 0) : undefined
            }

            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(request, account.apiKey)

            if (response) {
                response.raw_data.fees.forEach((item: any, index: number) => {
                    const feeRaw = item.fee
                    const tokenInfo = tokenMap[ item.token ]
                    const fee = sdk.toBig(item.fee).div(BIG10.pow(sdk.toBig(tokenInfo.decimals))).toNumber()
                    chargeFeeList.push({belong: item.token, fee, __raw__: feeRaw})
                })

                setChargeFeeList(chargeFeeList)
            }
            myLog('response:', response)

        } catch (reason) {
            dumpError400(reason)
        }


        setChargeFeeList(chargeFeeList)

    }, [account.accountId, account.apiKey, LoopringAPI.userAPI, requestType, tokenSymbol, tokenMap])

    return {
        chargeFeeList,
    }

}

export function useModalProps() {

    const {
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    } = useModals()

    // const {chainId, isConnected, connector,} = useWeb3Account()
    const {chainId, exchangeInfo} = useSystem()
    const {account} = useAccount()

    const {totalCoinMap: coinMap, tokenMap, marketArray, marketCoins, marketMap,} = useTokenMap()

    const walletLayer2State = useWalletLayer2();
    const walletLayer1State = useWalletLayer1();
    const [walletMap1, setWalletMap1] = useState<WalletMap<any> | undefined>(undefined);
    const [walletMap2, setWalletMap2] = useState<WalletMap<any> | undefined>(undefined);

    //HIGH: effect by wallet state update
    useCustomDCEffect(() => {
        if (walletLayer2State.walletLayer2) {
            let {walletMap} = makeWalletLayer2();
            setWalletMap2(walletMap)
        }
        if (walletLayer1State.walletLayer1) {
            // let {walletMap} =  makeWalletLayer1();
            setWalletMap1(walletLayer1State.walletLayer1)
        }
    }, [walletLayer1State.walletLayer1, walletLayer2State.walletLayer2])

    useCustomDCEffect(() => {
        switch (walletLayer2State.status) {
            case "ERROR":
                walletLayer2State.statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                walletLayer2State.statusUnset();
                let {walletMap} = makeWalletLayer2();
                setWalletMap2(walletMap)
                break;
            default:
                break;

        }
    }, [walletLayer2State])

    useCustomDCEffect(() => {
        switch (walletLayer1State.status) {
            case "ERROR":
                walletLayer1State.statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                walletLayer1State.statusUnset();
                setWalletMap1(walletLayer1State.walletLayer1);
                break;
            default:
                break;

        }
    }, [walletLayer1State])


    const [resetValue, setResetValue] = useState<IBData<any>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)


    let resetProps: ResetProps<any, any> = {
        tradeData: {belong: undefined},
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap2 as WalletMap<any>,
        resetBtnStatus: TradeBtnStatus.AVAILABLE,
        onResetClick: (tradeData: any) => {
            if (resetValue && resetValue.belong) {
            }

            ShowResetAccount(false)
        },
        handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res) => {
                if (data?.tradeData?.belong) {
                    if (resetValue !== data.tradeData) {
                        setResetValue(data.tradeData)
                    }
                } else {
                    setResetValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }

                res();
            })
        },
        fee: {count: 234, price: 123}
    }

    const tradeCalcData: TradeCalcData<CoinType> = {
        coinSell: 'ETH', //name
        coinBuy: 'LRC',
        BtoS: 0,
        StoB: 0,
        sellCoinInfoMap: coinMap,
        buyCoinInfoMap: coinMap,
        walletMap: {},
        slippage: 0.5,
        // slippageTolerance: [0.1, 0.5, 1, 'slippage:N'],
        priceImpact: '12',
        minimumReceived: '1%',
        fee: '1%'
    }
    const ammCalcData: AmmInData<{ [ key: string ]: any }> = {
        myCoinA: {belong: 'ETH', balance: 0, tradeValue: 0},
        myCoinB: {belong: 'LRC', balance: 0, tradeValue: 0},
        lpCoinA: {belong: 'ETH', balance: 0, tradeValue: 0},
        lpCoinB: {belong: 'LRC', balance: 0, tradeValue: 0},
        lpCoin: {belong: 'LP-ETH-LRC', balance: 0, tradeValue: 0},
        AtoB: 50,
        coinInfoMap: coinMap as any,
        slippage: 0.5,
        // slippageTolerance: [0.1, 0.5, 1, 'slippage:N'],
        feeJoin: '1',
        feeExit: '1',
    }


    let swapProps: SwapProps<IBData<string>, string, any> = {
        tradeData: undefined,
        tradeCalcData,
        onSwapClick: (tradeData) => {
            myLog('Swap button click', tradeData);
        },
        handleSwapPanelEvent: async (data: any, switchType: any) => {
            myLog(data, switchType)
        },
    };
    let ammProps: AmmProps<AmmData<IBData<any>>, any, AmmInData<any>> = {
        ammDepositData: {
            coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
            coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
            slippage: '',
        },
        ammWithdrawData: {
            coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
            coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
            slippage: '',
        },
        // tradeCalcData,
        ammCalcData: ammCalcData,
        handleAmmAddChangeEvent: (data, type) => {
            myLog('handleAmmAddChangeEvent', data, type);
        },
        handleAmmRemoveChangeEvent: (data, type) => {
            myLog('handleAmmRemoveChangeEvent', data, type);
        },
        onAmmRemoveClick: (data) => {
            myLog('onAmmRemoveClick', data);
        },
        onAmmAddClick: (data) => {
            myLog('onAmmAddClick', data);
        }
    }
    const {transferProps} = useTransfer(walletMap2, ShowTransfer)
    const {depositProps} = useDeposit(walletMap1, ShowDeposit)
    const {withdrawProps} = useWithdraw(walletMap2, ShowDeposit)

    return {
        depositProps, withdrawProps, transferProps, resetProps, ammProps, swapProps,
    }
}
