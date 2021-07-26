import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
    ButtonComponentsMap,
    CoinMap,
    GatewayItem,
    gatewayList as DefaultGatewayList,
    headerMenuData,
    HeaderMenuTabStatus,
    headerToolBarData,
    HeadMenuTabKey,
    LanguageKeys,
    LockIcon,
    ThemeKeys,
    UnLockIcon,
    WalletStatus,
    WithdrawType,
    WithdrawTypes,
} from '@loopring-web/common-resources'

import { useAccount, useConnect, useUnlock, useWeb3Account, } from 'stores/account/hook'

import { getShortAddr } from 'utils/web3_tools'

import { AccountStatus } from 'state_machine/account_machine_spec'

import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import { Theme, } from 'defs/common_defs'

import {
    AmmProps,
    Button,
    DepositProps,
    ResetProps,
    SwapProps,
    SwitchData,
    TradeBtnStatus,
    TransferProps,
    useOpenModals,
    useSettings,
    WithdrawProps
} from '@loopring-web/component-lib'

import store from 'stores'

import * as sdk from 'loopring-sdk'
import {
    ConnectorNames,
    dumpError400,
    GetNextStorageIdRequest,
    GetOffchainFeeAmtRequest,
    LoopringMap,
    OffchainFeeReqType,
    OffChainWithdrawalRequestV3,
    OriginTransferRequestV3,
    toBig,
    TokenInfo,
    VALID_UNTIL
} from 'loopring-sdk'
import { Typography } from '@material-ui/core';
import { AccountInfoProps, CoinType, } from '@loopring-web/component-lib';
import { useEtherscan } from 'hooks/web3/useWeb3'

import { useModals } from 'hooks/modal/useModals'
import Web3 from 'web3'

import { AmmData, AmmInData, IBData, TradeCalcData, WalletMap } from '@loopring-web/common-resources'

import { makeWalletLayer2 } from 'hooks/help'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { useTokenMap } from 'stores/token'
import { LoopringAPI } from 'stores/apis/api'
import { BIG10 } from 'defs/swap_defs'
import { useWalletLayer1 } from '../../stores/walletLayer1';
import { myLog } from 'utils/log_tools'

export const useHeader = () => {
    const {i18n, t} = useTranslation(['common', 'layout'])
    const {setTheme, themeMode, language, setLanguage} = useSettings();
    const {ShowDeposit} = useModals()
    const {modals: {isShowAccountInfo, isShowConnect}, setShowConnect, setShowAccountInfo} = useOpenModals()

    const forceUpdate = React.useReducer((bool) => !bool, false)[ 1 ]
    const {account} = useAccount()

    const {lock, unlock} = useUnlock()

    const {connect} = useConnect()

    const {etherscanUrl} = useEtherscan()

    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: () => {
                myLog('try to connect to ', ConnectorNames.Injected)
                connect(ConnectorNames.Injected, true)
                setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 1 ],
            handleSelect: () => {
                connect(ConnectorNames.WalletConnect, true)
                setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 2 ],
            handleSelect: () => {
                connect(ConnectorNames.Ledger, true)
                setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 3 ],
            handleSelect: () => {
                connect(ConnectorNames.Trezor, true)
                setShowConnect({isShow: false})
            }
        },
    ]
    // const [showAccountInfo, setShowAccountInfo] = React.useState(account?.accAddr ? true : false)
    const [accountInfoProps, setAccountInfoProps] = React.useState<undefined | AccountInfoProps>(undefined)
    //const theme: any = useTheme()

    const onNotification = React.useCallback(async () => {
        myLog('onNotification click')
    }, [])

    const onWalletBtnConnect = React.useCallback(async () => {
        const acc = store.getState().account
        myLog(`onWalletBtnConnect click: ${acc.status}`)

        switch (acc.status) {
            case AccountStatus.UNCONNNECTED:
                setShowConnect({isShow: true})
                break
            case AccountStatus.NOACCOUNT:
            case AccountStatus.CONNECTED:
            case AccountStatus.LOCKED:
            case AccountStatus.ACTIVATED:
                setShowAccountInfo({isShow: true})
                break
            default:
                break
        }
    }, [setShowConnect, setShowAccountInfo])

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


    useCustomDCEffect(() => {


        headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
            ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
            handleClick: onWalletBtnConnect,
        }

        // headerToolBarData[ButtonComponentsMap.Notification] = { ...headerToolBarData[ButtonComponentsMap.Theme], themeMode: theme.mode, handleClick: onNotification }
        // headerToolBarData.update(ButtonComponentsMap.WalletConnect,value=>{
        //   return {...value, handleClick:onWalletBtnConnect}});
        headerToolBarData[ ButtonComponentsMap.Theme ] = {
            ...headerToolBarData[ ButtonComponentsMap.Theme ],
            themeMode,
            handleClick: onThemeBtnClick
        }
        // headerToolBarData.update(ButtonComponentsMap.Theme,value=>{
        //   return {...value, themeMode:theme.mode, handleClick:onThemeBtnClick}});

        headerToolBarData[ ButtonComponentsMap.Language ] = {
            ...headerToolBarData[ ButtonComponentsMap.Language ],
            handleChange: onLangBtnClick
        }
        // headerToolBarData.update(ButtonComponentsMap.Language,value=>{
        //  return  {...value, language:i18n.language, handleClick:onThemeBtnClick}});
    }, [themeMode, language, i18n, onWalletBtnConnect, onThemeBtnClick, onLangBtnClick, onNotification, t]);

    const UnlockBtn = ({onClick}: { onClick: ({...props}: any) => void }) => {
        return <Button className={'unlock'} startIcon={<UnLockIcon fontSize={'large'}/>}
                       onClick={(event) => {
                           onClick(event)
                       }} variant={'outlined'}>
            <Typography variant={'body2'} marginTop={1 / 2}>   {t('labelUnLockLayer2')} </Typography>
        </Button>
    }

    const lockCallback = React.useCallback((event) => {
        lock(account)
    }, [account,lock])
    const unLockCallback = React.useCallback((event) => {
        unlock(account)
    }, [account,unlock])

    const LockBtn = ({onClick}: { onClick: ({...props}: any) => void }) => {
        return <Button className={'lock'} startIcon={<LockIcon fontSize={'large'}/>}
                       onClick={(event) => {
                           onClick(event)
                       }} variant={'outlined'}>
            <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelLockLayer2')} </Typography>
        </Button>
    }

    useCustomDCEffect(() => {

        if (!account) {
            myLog('account' + account + '* exit')
            setAccountInfoProps(undefined)
            return
        }

        const {status} = account

        const addr = getShortAddr(account?.accAddr)

        const updateHeaderMenuWhenHasAccountInfo = ({status}: { status: keyof typeof AccountStatus }) => {
            headerMenuData[ HeadMenuTabKey.Layer2 ] = {
                ...headerMenuData[ HeadMenuTabKey.Layer2 ],
                status: HeaderMenuTabStatus.default
            }
            let props: AccountInfoProps | undefined = undefined;
            if (status === AccountStatus.ACTIVATED) {
                props = {
                    addressShort: addr ? addr : '',
                    address: account?.accAddr,
                    level: 'VIP 1',
                    etherscanLink: etherscanUrl + account?.accAddr,
                    //TODO: changed by account status
                    mainBtn: <LockBtn onClick={(_event) => {
                        lockCallback(_event)
                    }}/>,
                    connectBy: ''
                }
                setShowAccountInfo({isShow: false})
            } else if (status === AccountStatus.LOCKED) {
                props = {
                    addressShort: addr ? addr : '',
                    address: account?.accAddr,
                    level: 'VIP 1',
                    etherscanLink: etherscanUrl + account?.accAddr,
                    //TODO: changed by account status
                    mainBtn: <UnlockBtn onClick={(_event) => {
                        unLockCallback(_event)
                    }}/>,
                    connectBy: ''
                }
                setShowAccountInfo({isShow: true})
            } else if (status === AccountStatus.UNACTIVATED
                || status === AccountStatus.NOACCOUNT
                || status === AccountStatus.DEPOSITING
                || status === AccountStatus.DEPOSIT_TO_CONFIREM
                || status === AccountStatus.ARPROVING
                || status === AccountStatus.APPROV_TO_CONFIRM
            ) {
                props = {
                    addressShort: addr ? addr : '',
                    address: account?.accAddr,
                    //TODO: level
                    level: 'VIP 1',
                    etherscanLink: etherscanUrl + account?.accAddr,
                    //TODO: changed by account status
                    connectBy: ''
                }
                setShowAccountInfo({isShow: false});

            } else {
                setShowAccountInfo({isShow: false})
            }

            if (props) {
                props.connectBy = account.connectName
            }

            if (status === AccountStatus.NOACCOUNT && props) {
                props.onLock = () => {
                    setShowAccountInfo({isShow: false})
                    ShowDeposit(true)
                }
            }

            setAccountInfoProps(props)
        }
        switch (status) {
            case AccountStatus.UNCONNNECTED:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: t('labelConnectWallet'),
                    status: WalletStatus.default
                }
                headerMenuData[ HeadMenuTabKey.Layer2 ] = {
                    //TODO:  HeaderMenuTabStatus.hidden
                    ...headerMenuData[ HeadMenuTabKey.Layer2 ], status: HeaderMenuTabStatus.hidden
                }
                setShowAccountInfo({isShow: false})
                break
            case AccountStatus.LOCKED:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addr,
                    status: WalletStatus.connect
                };

                updateHeaderMenuWhenHasAccountInfo({status});
                break
            case AccountStatus.ACTIVATED:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addr,
                    status: WalletStatus.unlock
                }

                updateHeaderMenuWhenHasAccountInfo({status});
                break
            case AccountStatus.UNACTIVATED:
            case AccountStatus.NOACCOUNT:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    // TODO got cache address if no show Connect Wallet
                    label: addr,
                    status: WalletStatus.noAccount
                }

                updateHeaderMenuWhenHasAccountInfo({status});
                break
            case AccountStatus.DEPOSITING:
            case AccountStatus.DEPOSIT_TO_CONFIREM:
            case AccountStatus.ARPROVING:
            case AccountStatus.APPROV_TO_CONFIRM:
                headerToolBarData[ ButtonComponentsMap.WalletConnect ] = {
                    ...headerToolBarData[ ButtonComponentsMap.WalletConnect ],
                    label: addr,
                    status: WalletStatus.accountPending
                }
                updateHeaderMenuWhenHasAccountInfo({status});

                break
        }
        forceUpdate()
    }, [account, etherscanUrl, setAccountInfoProps])

    return {
        headerToolBarData,
        headerMenuData,
        gatewayList,
        isShowConnect,
        isShowAccountInfo,
        setShowAccountInfo,
        setShowConnect,
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

    const {accountId, apiKey,} = useAccount()

    const [chargeFeeList, setChargeFeeList] = useState<any[]>([])

    useCustomDCEffect(async () => {

        if (!accountId || !tokenSymbol || !tokenMap || !LoopringAPI.userAPI) {
            return
        }

        let chargeFeeList: any[] = []

        try {
            const tokenInfo = tokenMap[ tokenSymbol ]

            const request: GetOffchainFeeAmtRequest = {
                accountId,
                tokenSymbol,
                requestType,
                amount: amount ? toBig(amount).times('1e' + tokenInfo.decimals).toFixed(0, 0) : undefined
            }

            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(request, apiKey)

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

    }, [accountId, apiKey, LoopringAPI.userAPI, requestType, tokenSymbol, tokenMap])

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

    const {chainId, isConnected, connector,} = useWeb3Account()

    const {account, apiKey, accountId, eddsaKey,} = useAccount()

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

    // deposit
    const [depositValue, setDepositValue] = useState<IBData<any>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)

    const deposit = useCallback(async (token: string, amt: any) => {

        const exchangeInfo = store.getState().system.exchangeInfo

        if (!LoopringAPI.exchangeAPI || !tokenMap || !isConnected || !connector || !exchangeInfo?.exchangeAddress || !exchangeInfo?.depositAddress) {
            return
        }

        try {
            const tokenInfo: TokenInfo = tokenMap[ token ]

            const provider = await connector.getProvider()
            const web3 = new Web3(provider as any)

            let sendByMetaMask = account.connectName === ConnectorNames.Injected

            const gasPrice = store.getState().system.gasPrice ?? 20
            const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)

            const nonce = await sdk.getNonce(web3, account.accAddr)

            const response = await sdk.approveMax(web3, account.accAddr, tokenInfo.address,
                exchangeInfo?.depositAddress, gasPrice, gasLimit, chainId, nonce, sendByMetaMask)

            const fee = 0

            const response2 = await sdk.deposit(web3, account.accAddr,
                exchangeInfo?.exchangeAddress, tokenInfo, amt, fee,
                gasPrice, gasLimit, chainId, nonce + 1, sendByMetaMask)

            myLog('!!!!deposit r:', response2)

        } catch (reason) {
            dumpError400(reason)
        }

    }, [chainId, isConnected, connector, account, tokenMap])

    let depositProps: DepositProps<any, any> = {
        tradeData: {belong: undefined},
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap1 as WalletMap<any>,
        depositBtnStatus: TradeBtnStatus.AVAILABLE,
        onDepositClick: (tradeData: any) => {
            if (depositValue && depositValue.belong) {
                deposit(depositValue.belong.toString(), depositValue.tradeValue)
            }
            ShowDeposit(false)
        },
        handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res) => {
                if (data?.tradeData?.belong) {
                    if (depositValue !== data.tradeData) {
                        setDepositValue(data.tradeData)
                    }
                    setTokenSymbol(data.tradeData.belong)
                } else {
                    setDepositValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }
                res();
            })
        },
    }

    // transfer
    const [transferValue, setTransferValue] = useState<IBData<any>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)

    const [transferTokenSymbol, setTransferTokenSymbol] = useState<string>('')

    const {chargeFeeList: transferFeeList} = useChargeFeeList(transferTokenSymbol, OffchainFeeReqType.TRANSFER, tokenMap)

    const [feeInfo, setFeeInfo] = useState<any>()

    const [payeeAddr, setPayeeAddr] = useState<string>()

    useCustomDCEffect(() => {

        if (transferFeeList.length > 0) {
            setFeeInfo(transferFeeList[ 0 ])
        }

    }, [transferFeeList])

    const transfer = useCallback(async (transferValue: any) => {

        const exchangeInfo = store.getState().system.exchangeInfo

        if (!LoopringAPI.userAPI || !LoopringAPI.exchangeAPI || !exchangeInfo
            || !connector || !apiKey || !chainId || !accountId || !account?.accAddr) {
            return
        }

        if (!tokenMap || !feeInfo || !payeeAddr) {
            console.error(feeInfo)
            return
        }

        try {

            const sellToken = tokenMap[ transferValue.belong ]

            const feeToken = tokenMap[ feeInfo.belong ]

            const transferVol = toBig(transferValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)

            const request: GetNextStorageIdRequest = {
                accountId,
                sellTokenId: sellToken.tokenId
            }
            const storageId = await LoopringAPI.userAPI.getNextStorageId(request, apiKey)

            const provider = await connector.getProvider()
            const web3 = new Web3(provider as any)

            let walletType = account.connectName

            const request2: OriginTransferRequestV3 = {
                exchange: exchangeInfo.exchangeAddress,
                payerAddr: account.accAddr,
                payerId: accountId,
                payeeAddr,
                payeeId: 0,
                storageId: storageId.offchainId,
                token: {
                    tokenId: sellToken.tokenId,
                    volume: transferVol,
                },
                maxFee: {
                    tokenId: feeToken.tokenId,
                    volume: feeInfo.__raw__,
                },
                validUntil: VALID_UNTIL,
            }

            const response = await LoopringAPI.userAPI.submitInternalTransfer(request2, web3, chainId, walletType,
                eddsaKey, apiKey, false)

            myLog('transfer r:', response)

        } catch (reason) {
            dumpError400(reason)
        }

    }, [apiKey, tokenMap, payeeAddr, accountId, account, connector, chainId, eddsaKey, feeInfo])

    let transferProps: TransferProps<any, any> = {
        tradeData: {belong: undefined},
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap2 as WalletMap<any>,
        transferBtnStatus: TradeBtnStatus.AVAILABLE,
        onTransferClick: (tradeData: any) => {
            if (transferValue && transferValue.belong) {
                transfer(transferValue)
            }

            ShowTransfer(false)
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            setFeeInfo(value)
        },
        handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    if (transferValue !== data.tradeData) {
                        setTransferValue(data.tradeData)
                    }
                    setTransferTokenSymbol(data.tradeData.belong)
                } else {
                    setTransferValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }
                // else{
                //     setTransferValue({ belong: undefined, amt: 0 })
                // }

                res();
            })
        },

        chargeFeeToken: 'ETH',
        chargeFeeTokenList: transferFeeList,
        handleOnAddressChange: (value: any) => {
            myLog('transfer handleOnAddressChange', value);
            setPayeeAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    }

    // withdraw
    const [withdrawValue, setWithdrawValue] = useState<IBData<any>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>);

    const [tokenSymbol, setTokenSymbol] = useState<string>('')
    const [withdrawType, setWithdrawType] = useState<OffchainFeeReqType>(OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
    const {chargeFeeList: withdrawalFeeList} = useChargeFeeList(tokenSymbol, withdrawType, tokenMap, withdrawValue.tradeValue)

    const withdrawType2 = withdrawType === OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'
    const [withdrawFeeInfo, setWithdrawFeeInfo] = useState<any>()

    const [withdrawAddr, setWithdrawAddr] = useState<string>()

    useCustomDCEffect(() => {

        if (withdrawalFeeList.length > 0) {
            setWithdrawFeeInfo(withdrawalFeeList[ 0 ])
        }

    }, [withdrawalFeeList])

    const withdraw = useCallback(async (withdrawValue: any) => {

        const exchangeInfo = store.getState().system.exchangeInfo

        if (!LoopringAPI.userAPI || !account || !account.accountId || !account.accAddr
            || !connector || !chainId || !apiKey || !exchangeInfo
            || !exchangeInfo.exchangeAddress || !withdrawFeeInfo
            || !withdrawValue || !tokenMap || !withdrawAddr) {
            console.error('withdraw return directly!', account, connector, chainId, apiKey, exchangeInfo)
            console.error('withdraw return directly!', withdrawValue, withdrawFeeInfo, tokenMap)
            return
        }

        const symbol = withdrawValue.belong as string

        const withdrawToken = tokenMap[ symbol ]

        const feeToken = tokenMap[ withdrawFeeInfo.belong ]

        const amt = toBig(withdrawValue.tradeValue).times('1e' + withdrawToken.decimals).toFixed(0, 0)

        try {

            const request: GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: withdrawToken.tokenId
            }

            const storageId = await LoopringAPI.userAPI.getNextStorageId(request, apiKey)

            const request2: OffChainWithdrawalRequestV3 = {
                exchange: exchangeInfo.exchangeAddress,
                owner: account.accAddr,
                to: withdrawAddr,
                accountId: account.accountId,
                storageId: storageId.offchainId,
                token: {
                    tokenId: withdrawToken.tokenId,
                    volume: amt,
                },
                maxFee: {
                    tokenId: feeToken.tokenId,
                    volume: withdrawFeeInfo.__raw__,
                },
                extraData: '',
                minGas: 0,
                validUntil: VALID_UNTIL,
            }

            const provider = await connector.getProvider()
            const web3 = new Web3(provider as any)

            const response = await LoopringAPI.userAPI.submitOffchainWithdraw(request2, web3, chainId, ConnectorNames.Injected,
                account.eddsaKey, apiKey, false)

            myLog(response)

        } catch (reason) {
            dumpError400(reason)
        }

    }, [apiKey, account, connector, chainId, withdrawFeeInfo, tokenMap, withdrawAddr])

    let withdrawProps: WithdrawProps<any, any> = {
        tradeData: {belong: undefined},
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap2 as WalletMap<any>,
        withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
        onWithdrawClick: (tradeData: any) => {
            if (withdrawValue && withdrawValue.belong) {
                withdraw(withdrawValue)
            }
            ShowWithdraw(false)
        },

        handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    if (withdrawValue !== data.tradeData) {
                        setWithdrawValue(data.tradeData)
                    }
                    setTokenSymbol(data.tradeData.belong)
                } else {
                    setWithdrawValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>);
                }
                res();
            })
        },
        withdrawType: withdrawType2,
        withdrawTypes: WithdrawTypes,
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: withdrawalFeeList,
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            myLog('handleWithdrawFee', value);
            setWithdrawFeeInfo(value)
        },
        handleWithdrawTypeChange: (value: any) => {
            myLog('handleWithdrawTypeChange', value)
            const offchainType = value === WithdrawType.Fast ? OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
            setWithdrawType(offchainType)
        },
        handleOnAddressChange: (value: any) => {
            myLog('handleOnAddressChange', value);
            setWithdrawAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    }


    // reset
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

    return {
        depositProps, withdrawProps, transferProps, resetProps, ammProps, swapProps,
    }
}
