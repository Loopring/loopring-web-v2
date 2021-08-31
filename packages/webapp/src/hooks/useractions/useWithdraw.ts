import React, { useDebugValue, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { connectProvides } from '@loopring-web/web3-provider';
import { AccountStepNew, SwitchData, TradeBtnStatus, useOpenModals, WithdrawProps } from '@loopring-web/component-lib';
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

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from './useChargeFees';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { myLog } from 'utils/log_tools';
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletLayer2Socket } from '../../services/socket';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS, TOAST_TIME } from 'defs/common_defs';
import { AddressError, useAddressCheck } from 'hooks/common/useAddrCheck';
import { useWalletInfo } from 'stores/localStore/walletInfo';
import { checkErrorInfo } from './utils';
import { ConnectorError, } from 'loopring-sdk';

export const useWithdraw = <R extends IBData<T>, T>(): {
    // handleWithdraw: (inputValue:R) => void,
    withdrawAlertText: string | undefined,
    withdrawToastOpen: boolean,
    setWithdrawToastOpen: any,
    withdrawProps: WithdrawProps<R, T>
    processRequest: any,
    lastRequest: any,
    // withdrawValue: R
} => {

    const { t } = useTranslation('common')
    const { modals: { isShowWithdraw: { symbol, isShow } }, setShowAccount, setShowWithdraw, } = useOpenModals()

    const [withdrawToastOpen, setWithdrawToastOpen] = useState<boolean>(false)

    const [withdrawAlertText, setWithdrawAlertText] = useState<string>()

    const { tokenMap, totalCoinMap, } = useTokenMap();
    const { account, status: accountStatus } = useAccount()
    const { exchangeInfo, chainId } = useSystem();
    const [withdrawValue, setWithdrawValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)

    // const {status:walletLayer2Status} = useWalletLayer2();
    const [walletMap2, setWalletMap2] = React.useState(makeWalletLayer2().walletMap ?? {} as WalletMap<R>);

    const [withdrawFeeInfo, setWithdrawFeeInfo] = useState<any>()
    const [withdrawType, setWithdrawType] = useState<sdk.OffchainFeeReqType>(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)

    const { chargeFeeList } = useChargeFees(withdrawValue.belong, withdrawType, tokenMap, withdrawValue.tradeValue)

    const {
        address,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const [btnStatus, setBtnStatus,] = React.useState<TradeBtnStatus>(TradeBtnStatus.AVAILABLE)

    React.useEffect(() => {

        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && withdrawValue?.tradeValue
            && addrStatus === AddressError.NoError) {
            //valid
            //todo add amt check.
            myLog('try to AVAILABLE: ', withdrawValue?.tradeValue)
            setBtnStatus(TradeBtnStatus.AVAILABLE)
        } else {
            setBtnStatus(TradeBtnStatus.DISABLED)
        }

    }, [setBtnStatus, chargeFeeList, address, addrStatus, withdrawValue?.tradeValue])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
        setWalletMap2(walletMap)
    }, [setWalletMap2])

    const resetDefault = React.useCallback(() => {
        if (symbol) {
            setWithdrawValue({
                belong: symbol as any,
                balance: walletMap2[symbol]?.count,
                tradeValue: undefined,
            })

        } else {
            const keys = Reflect.ownKeys(walletMap2)
            for (var key in keys) {
                const keyVal = keys[key]
                const walletInfo = walletMap2[keyVal]
                if (sdk.toBig(walletInfo.count).gt(0)) {
                    setWithdrawValue({
                        belong: keyVal as any,
                        tradeValue: 0,
                        balance: walletInfo.count,
                    })
                    break
                }
            }
        }
    }, [symbol, walletMap2, setWithdrawValue])
    React.useEffect(() => {
        resetDefault();
    }, [isShow])
    useWalletLayer2Socket({ walletLayer2Callback })
    useCustomDCEffect(() => {
        if (chargeFeeList.length > 0) {
            setWithdrawFeeInfo(chargeFeeList[0])
        }
    }, [chargeFeeList, setWithdrawFeeInfo])

    const { checkHWAddr, updateDepositHashWrapper, } = useWalletInfo()

    const [lastRequest, setLastRequest] = React.useState<any>({})

    const processRequest = React.useCallback(async (request: sdk.OffChainWithdrawalRequestV3, isFirstTime: boolean) => {

        const { apiKey, connectName, eddsaKey } = account

        if (connectProvides.usedWeb3) {

            let isHWAddr = checkHWAddr(account.accAddress)

            isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

            const response = await LoopringAPI.userAPI?.submitOffchainWithdraw({
                request,
                web3: connectProvides.usedWeb3,
                chainId: chainId === 'unknown' ? 1 : chainId,
                walletType: connectName as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
            })

            myLog('submitOffchainWithdraw:', response)

            if (response?.errorInfo) {
                // Withdraw failed
                const code = checkErrorInfo(response.errorInfo, isFirstTime)
                if (code === ConnectorError.USER_DENIED) {
                    setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_User_Denied })
                } else if (code === ConnectorError.NOT_SUPPORT_ERROR) {
                    setLastRequest({ request })
                    setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_First_Method_Denied })
                } else {
                    setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_Failed })
                }
            } else if (response?.resultInfo) {
                setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_Failed })
            } else {
                // Withdraw success
                setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_In_Progress })
                await sdk.sleep(TOAST_TIME)
                setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_Success })
                if (isHWAddr) {
                    myLog('......try to set isHWAddr', isHWAddr)
                    updateDepositHashWrapper({ wallet: account.accAddress, isHWAddr })
                }
            }

        }
    }, [setLastRequest, setShowAccount, updateDepositHashWrapper, account])

    const withdrawType2 = withdrawType === sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'

    const handleWithdraw = React.useCallback(async (inputValue: R, address, isFirstTime: boolean = true) => {

        const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

        if (readyState === AccountStatus.ACTIVATED && tokenMap
            && exchangeInfo && connectProvides.usedWeb3
            && address && withdrawFeeInfo?.belong && eddsaKey?.sk) {
            try {

                setShowWithdraw({ isShow: false, })
                setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_WaitForAuth, })

                const withdrawToken = tokenMap[inputValue.belong as string]
                const feeToken = tokenMap[withdrawFeeInfo.belong]
                const withdrawVol = sdk.toBig(inputValue.tradeValue).times('1e' + withdrawToken.decimals).toFixed(0, 0)

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
                setShowAccount({ isShow: true, step: AccountStepNew.Withdraw_Failed })
            }

            return true

        } else {
            return false
        }

    }, [account, tokenMap, exchangeInfo, withdrawType2, withdrawFeeInfo, withdrawValue, setShowAccount])

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET) {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (account.accAddress) {
                    setAddress(account.accAddress)
                }
            } else {
                setShowWithdraw({ isShow: false })
            }
        }
    }, [accountStatus, account.readyState])

    const withdrawProps: WithdrawProps<R, T> = {
        addressDefault: address,
        tradeData: withdrawValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        withdrawBtnStatus: btnStatus,
        withdrawType: withdrawType2,
        withdrawTypes: WithdrawTypes,
        onWithdrawClick: () => {
            if (withdrawValue && withdrawValue.belong) {
                handleWithdraw(withdrawValue as R, address)
            }
            setShowWithdraw({ isShow: false })
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            myLog('handleFeeChange', value)
            setWithdrawFeeInfo(value as any)
        },
        handleWithdrawTypeChange: (value: 'Fast' | 'Standard') => {
            myLog('handleWithdrawTypeChange', value)
            const offchainType = value === WithdrawType.Fast ? sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
            setWithdrawType(offchainType)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    // myLog('handlePanelEvent', data.tradeData)
                    if (withdrawValue !== data.tradeData) {
                        setWithdrawValue(data.tradeData)
                    }
                }

                res();
            })
        },
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
            // myLog('withdraw handleOnAddressChange', value);
        },
        handleAddressError: (_value: any) => {
            setAddress(_value)
            return { error: false, message: '' }
        }
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
