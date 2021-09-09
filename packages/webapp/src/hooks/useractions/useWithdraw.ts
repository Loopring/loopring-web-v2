import React from 'react';

import { useTranslation } from 'react-i18next';

import { connectProvides } from '@loopring-web/web3-provider';
import { AccountStep, SwitchData, useOpenModals, WithdrawProps } from '@loopring-web/component-lib';
import {
    AccountStatus,
    CoinMap,
    IBData,
    SagaStatus,
    WalletMap,
    WithdrawType,
    WithdrawTypes
} from '@loopring-web/common-resources';

import * as sdk from 'loopring-sdk'
import { ConnectorError, dumpError400, GetWithdrawalAgentsRequest } from 'loopring-sdk'

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from '../common/useChargeFees';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { myLog } from "@loopring-web/common-resources";
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletLayer2Socket, walletLayer2Service } from '../../services/socket';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS, TOAST_TIME } from 'defs/common_defs';
import { AddressError, useAddressCheck } from 'hooks/common/useAddrCheck';
import { useWalletInfo } from 'stores/localStore/walletInfo';
import { checkErrorInfo } from './utils';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useModalData } from 'stores/router';
import { isAccActivated } from './checkAccStatus';
import { getFloatValue } from 'utils/formatter_tool';

export const useWithdraw = <R extends IBData<T>, T>(): {
    withdrawAlertText: string | undefined,
    withdrawToastOpen: boolean,
    setWithdrawToastOpen: any,
    withdrawProps: WithdrawProps<R, T>
    processRequest: any,
    lastRequest: any,
} => {

    const { t } = useTranslation('common')
    const { modals: { isShowWithdraw: { symbol, isShow } }, setShowAccount, setShowWithdraw, } = useOpenModals()

    const [withdrawToastOpen, setWithdrawToastOpen] = React.useState<boolean>(false)

    const [withdrawAlertText, setWithdrawAlertText] = React.useState<string>()

    const { tokenMap, totalCoinMap, } = useTokenMap();
    const { account, status: accountStatus } = useAccount()
    const { exchangeInfo, chainId } = useSystem();

    const { withdrawValue, updateWithdrawData, resetWithdrawData, } = useModalData()

    const [walletMap2, setWalletMap2] = React.useState(makeWalletLayer2().walletMap ?? {} as WalletMap<R>);

    const [withdrawFeeInfo, setWithdrawFeeInfo] = React.useState<any>()

    const [withdrawType, setWithdrawType] = React.useState<sdk.OffchainFeeReqType>(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)

    const withdrawType2 = withdrawType === sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'
    const { chargeFeeList } = useChargeFees(withdrawValue.belong, withdrawType, tokenMap, withdrawValue.tradeValue)

    const [withdrawTypes, setWithdrawTypes] = React.useState<any>(WithdrawTypes)
    const [isExceedMax, setIsExceedMax] = React.useState(false)
    const { checkHWAddr, updateDepositHashWrapper, } = useWalletInfo()

    const [lastRequest, setLastRequest] = React.useState<any>({})

    const {
        address,
        realAddr,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const { btnStatus, enableBtn, disableBtn, } = useBtnStatus()

    React.useEffect(() => {

        const tradeValue = getFloatValue(withdrawValue?.tradeValue)

        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && tradeValue
            && addrStatus === AddressError.NoError && !isExceedMax) {
            enableBtn()
        } else {
            disableBtn()
        }

    }, [enableBtn, disableBtn, chargeFeeList, address, addrStatus, withdrawValue?.tradeValue])

    const updateWithdrawTypes = React.useCallback(async () => {

        if (withdrawValue.belong && LoopringAPI.exchangeAPI && tokenMap) {

            const tokenInfo = tokenMap[withdrawValue.belong]

            const req: GetWithdrawalAgentsRequest = {
                tokenId: tokenInfo.tokenId,
                amount: sdk.toBig('1e' + tokenInfo.decimals).toString(),
            }

            const agent = await LoopringAPI.exchangeAPI.getWithdrawalAgents(req)

            if (agent.supportTokenMap[withdrawValue.belong]) {
                myLog('------- have agent!')
                setWithdrawTypes(WithdrawTypes)
            } else {
                myLog('------- have NO agent!')
                setWithdrawTypes({ 'Standard': '' })
            }
        }

    }, [withdrawValue, tokenMap,])

    const updateWithdrawType = React.useCallback(() => {
        // myLog('withdrawTypes:', withdrawTypes, ' withdrawType2:', withdrawType2)
        if (!withdrawTypes['Fast']) {
            // myLog('try to reset setWithdrawType!')
            setWithdrawType(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
        }
    }, [withdrawTypes, setWithdrawType])

    React.useEffect(() => {
        updateWithdrawType()
    }, [withdrawTypes, updateWithdrawType])

    React.useEffect(() => {

        updateWithdrawTypes()

    }, [withdrawValue.belong, tokenMap,])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
        setWalletMap2(walletMap)
    }, [setWalletMap2])

    const resetDefault = React.useCallback(() => {
        if (symbol) {
            if (walletMap2) {
                updateWithdrawData({
                    belong: symbol as any,
                    balance: walletMap2[symbol]?.count,
                    tradeValue: undefined,
                    address: '*',
                })
            }

        } else {
            if (!withdrawValue.belong && walletMap2) {
                const keys = Reflect.ownKeys(walletMap2)
                for (var key in keys) {
                    const keyVal = keys[key]
                    const walletInfo = walletMap2[keyVal]
                    if (sdk.toBig(walletInfo.count).gt(0)) {
                        updateWithdrawData({
                            belong: keyVal as any,
                            tradeValue: 0,
                            balance: walletInfo.count,
                            address: '*',
                        })
                        break
                    }
                }


            }
        }
    }, [symbol, walletMap2, updateWithdrawData, withdrawValue])

    React.useEffect(() => {
        if (isShow) {
            resetDefault();
        }
    }, [isShow])

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
        } else {
            setShowWithdraw({ isShow: false })
        }
    }, [accountStatus, account.readyState])

    React.useEffect(() => {

        if (isShow && accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
            if (withdrawValue.address) {
                setAddress(withdrawValue.address)
            } else {
                setAddress(account.accAddress)
                updateWithdrawData({
                    address: account.accAddress,
                    balance: -1,
                    tradeValue: -1,
                })
            }
        }

    }, [setAddress, isShow, withdrawValue.address, accountStatus, account.readyState])

    useWalletLayer2Socket({ walletLayer2Callback })

    useCustomDCEffect(() => {
        if (chargeFeeList.length > 0) {
            setWithdrawFeeInfo(chargeFeeList[0])
        }
    }, [chargeFeeList, setWithdrawFeeInfo])

    const processRequest = React.useCallback(async (request: sdk.OffChainWithdrawalRequestV3, isFirstTime: boolean) => {

        const { apiKey, connectName, eddsaKey } = account

        try {
            if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {

                let isHWAddr = checkHWAddr(account.accAddress)

                isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

                const response = await LoopringAPI.userAPI.submitOffchainWithdraw({
                    request,
                    web3: connectProvides.usedWeb3,
                    chainId: chainId === 'unknown' ? 1 : chainId,
                    walletType: connectName as sdk.ConnectorNames,
                    eddsaKey: eddsaKey.sk,
                    apiKey,
                    isHWAddr,
                })

                myLog('submitOffchainWithdraw:', response)

                if (isAccActivated()) {
                    if (response?.errorInfo) {
                        // Withdraw failed
                        const code = checkErrorInfo(response.errorInfo, isFirstTime)
                        if (code === ConnectorError.USER_DENIED) {
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_User_Denied })
                        } else if (code === ConnectorError.NOT_SUPPORT_ERROR) {
                            setLastRequest({ request })
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_First_Method_Denied })
                        } else {
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                        }
                    } else if (response?.resultInfo) {
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                    } else {
                        // Withdraw success
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_In_Progress })
                        await sdk.sleep(TOAST_TIME)
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_Success })
                        if (isHWAddr) {
                            myLog('......try to set isHWAddr', isHWAddr)
                            updateDepositHashWrapper({ wallet: account.accAddress, isHWAddr })
                        }

                        resetWithdrawData()
                    }

                    walletLayer2Service.sendUserUpdate()
                } else {

                    resetWithdrawData()
                }

            }

        } catch (reason) {
            dumpError400(reason)
            const code = checkErrorInfo(reason, isFirstTime)
            myLog('code:', code)

            if (isAccActivated()) {
                if (code === ConnectorError.USER_DENIED) {
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_User_Denied })
                } else if (code === ConnectorError.NOT_SUPPORT_ERROR) {
                    setLastRequest({ request })
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_First_Method_Denied })
                } else {
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                }
            }
        }

    }, [setLastRequest, setShowAccount, updateDepositHashWrapper, account])

    const handleWithdraw = React.useCallback(async (inputValue: any, address, isFirstTime: boolean = true) => {

        const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

        if (readyState === AccountStatus.ACTIVATED && tokenMap
            && exchangeInfo && connectProvides.usedWeb3
            && address && withdrawFeeInfo?.belong && eddsaKey?.sk) {
            try {

                setShowWithdraw({ isShow: false, })
                setShowAccount({ isShow: true, step: AccountStep.Withdraw_WaitForAuth, })

                const withdrawToken = tokenMap[inputValue.belong as string]
                const feeToken = tokenMap[withdrawFeeInfo.belong]
                const isExceedBalance = feeToken.tokenId === withdrawToken.tokenId && inputValue.balance - (inputValue.tradeValue || 0) < withdrawFeeInfo.fee
                // withdraw vol cannot exceed totalVol - fee
                const finalVol = isExceedBalance ? inputValue.balance - withdrawFeeInfo.fee : inputValue.tradeValue
                const withdrawVol = sdk.toBig(finalVol).times('1e' + withdrawToken.decimals).toFixed(0, 0)

                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId: accountId,
                    sellTokenId: withdrawToken.tokenId
                }, apiKey)

                const request: sdk.OffChainWithdrawalRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    owner: accAddress,
                    to: address,
                    accountId: account.accountId,
                    storageId: storageId?.offchainId,
                    token: {
                        tokenId: withdrawToken.tokenId,
                        volume: withdrawVol,
                    },
                    maxFee: {
                        tokenId: feeToken.tokenId,
                        volume: withdrawFeeInfo.__raw__,
                    },
                    fastWithdrawalMode: withdrawType2 === WithdrawType.Fast,
                    extraData: '',
                    minGas: 0,
                    validUntil: getTimestampDaysLater(DAYS),
                }

                myLog('submitOffchainWithdraw:', request)

                processRequest(request, isFirstTime)

            } catch (e) {
                sdk.dumpError400(e)
                setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
            }

            return true

        } else {
            return false
        }

    }, [account, tokenMap, exchangeInfo, withdrawType2, withdrawFeeInfo, withdrawValue, setShowAccount])

    const withdrawProps: any = {
        addressDefault: address,
        realAddr,
        tradeData: withdrawValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        withdrawBtnStatus: btnStatus,
        withdrawType: withdrawType2,
        withdrawTypes,
        onWithdrawClick: () => {
            if (withdrawValue && withdrawValue.belong) {
                handleWithdraw(withdrawValue, address)
            }
            setShowWithdraw({ isShow: false })
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            // myLog('handleFeeChange', value)
            setWithdrawFeeInfo(value as any)
        },
        handleWithdrawTypeChange: (value: 'Fast' | 'Standard') => {
            // myLog('handleWithdrawTypeChange', value)
            const offchainType = value === WithdrawType.Fast ? sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
            setWithdrawType(offchainType)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {

                if (data.to === 'button') {
                    if (walletMap2 && data?.tradeData?.belong) {
                        const walletInfo = walletMap2[data?.tradeData?.belong as string]
                        updateWithdrawData({
                            belong: data.tradeData?.belong,
                            tradeValue: data.tradeData?.tradeValue,
                            balance: walletInfo.count,
                            address: '*',
                        })
                    } else {
                        updateWithdrawData({ 
                            belong: undefined, 
                            tradeValue: undefined, 
                            balance: undefined,
                            address: '*', 
                        })
                    }
                }

                else {
                    myLog('handlePanelEvent: ', data)
                }

                res();
            })
        },
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
        },
        handleAddressError: (value: any) => {
            updateWithdrawData({ address: value, balance: -1, tradeValue: -1 })
            return { error: false, message: '' }
        },
        handleError: ({ belong, balance, tradeValue }: any) => {
            balance = getFloatValue(balance)
            tradeValue = getFloatValue(tradeValue)
            if ((balance > 0 && balance < tradeValue) || (tradeValue && !balance)) {
                setIsExceedMax(true)
                return { error: true, message: t('tokenNotEnough', { belong, }) }
            }
            setIsExceedMax(false)
            return { error: false, message: '' }
        },
    }

    return {
        withdrawAlertText,
        withdrawToastOpen,
        setWithdrawToastOpen,
        withdrawProps,
        processRequest,
        lastRequest,
    }
}
