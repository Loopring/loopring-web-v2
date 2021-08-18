import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { connectProvides } from '@loopring-web/web3-provider';
import { SwitchData, TradeBtnStatus, useOpenModals, WithdrawProps } from '@loopring-web/component-lib';
import {
    AccountStatus,
    CoinMap,
    IBData,
    SagaStatus,
    WalletMap,
    WithdrawType,
    WithdrawTypes
} from '@loopring-web/common-resources';
import { ConnectorNames, dumpError400, OffchainFeeReqType, toBig, VALID_UNTIL } from 'loopring-sdk';

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from './useChargeFees';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { myLog } from 'utils/log_tools';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { makeWalletLayer2 } from 'hooks/help';

export const useWithdraw = <R extends IBData<T>, T>(): {
    // handleWithdraw: (inputValue:R) => void,
    withdrawAlertText: string | undefined,
    withdrawToastOpen: boolean, 
    setWithdrawToastOpen: any,
    withdrawProps: WithdrawProps<R, T>
    // withdrawValue: R
} => {

    const { t } = useTranslation('common')

    const [withdrawToastOpen, setWithdrawToastOpen] = useState<boolean>(false)

    const [withdrawAlertText, setWithdrawAlertText] = useState<string>()

    const {tokenMap, totalCoinMap, } = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    const [withdrawValue, setWithdrawValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {status:walletLayer2Status} = useWalletLayer2();
    const [walletMap2, setWalletMap2] = React.useState(makeWalletLayer2().walletMap??{} as WalletMap<R>);
    const {chargeFeeList} = useChargeFees(withdrawValue.belong, OffchainFeeReqType.OFFCHAIN_WITHDRAWAL, tokenMap)
    const [withdrawAddr, setWithdrawAddr] = useState<string>()
    const [withdrawFeeInfo, setWithdrawFeeInfo] = useState<any>(undefined)
    const [withdrawType, setWithdrawType] = useState<OffchainFeeReqType>(OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
    const { setShowWithdraw, }  = useOpenModals()

    React.useEffect(()=>{
        if(walletLayer2Status === SagaStatus.UNSET){
            const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
            setWalletMap2(walletMap)
        }
    },[walletLayer2Status])
    useCustomDCEffect(() => {
        if (chargeFeeList.length > 0) {
            setWithdrawFeeInfo(chargeFeeList[0])
        }
    }, [chargeFeeList, setWithdrawFeeInfo])

    const handleWithdraw = React.useCallback(async (inputValue: R) => {

        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account
        if (readyState === AccountStatus.ACTIVATED && tokenMap 
            && exchangeInfo && connectProvides.usedWeb3 
            && withdrawAddr && withdrawFeeInfo?.belong && eddsaKey?.sk) {
            try {
                const withdrawToken = tokenMap[ inputValue.belong as string ]
                const feeToken = tokenMap[ withdrawFeeInfo.belong ]
                const withdrawVol = toBig(inputValue.tradeValue).times('1e' + withdrawToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId: accountId,
                    sellTokenId: withdrawToken.tokenId
                }, apiKey)
                const response = await LoopringAPI.userAPI?.submitOffchainWithdraw({
                        exchange: exchangeInfo.exchangeAddress,
                        owner: accAddress,
                        to: withdrawAddr,
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
                        extraData: '',
                        minGas: 0,
                        validUntil: VALID_UNTIL,
                    },
                    connectProvides.usedWeb3,
                    chainId === 'unknown' ? 1 : chainId, connectName as ConnectorNames,
                    eddsaKey.sk, apiKey)

                    myLog('got response:', response)

                    if (response?.hash === undefined && response?.errInfo) {
                        setWithdrawAlertText(t('labelWithdrawFailed'))
                    } else {
                        setWithdrawAlertText(t('labelWithdrawSucess'))
                    }
                    
            } catch (e) {
                dumpError400(e)
                setWithdrawAlertText(t('labelWithdrawFailed'))
            }
            
            setWithdrawToastOpen(true)

            return true

        } else {
            return false
        }

    }, [account, tokenMap, withdrawFeeInfo])

    const withdrawType2 = withdrawType === OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'

    const withdrawProps: WithdrawProps<R, T> = {
        tradeData: {belong: undefined} as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
        withdrawType: withdrawType2,
        withdrawTypes: WithdrawTypes,
        onWithdrawClick: () => {
            if (withdrawValue && withdrawValue.belong) {
                handleWithdraw(withdrawValue as R)
            }
            setShowWithdraw({isShow:false})
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            setWithdrawFeeInfo(value as any)
        },
        handleWithdrawTypeChange: (value: 'Fast' | 'Standard') => {
            myLog('handleWithdrawTypeChange', value)
            const offchainType = value === WithdrawType.Fast ? OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
            setWithdrawType(offchainType)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    if (withdrawValue !== data.tradeData) {
                        setWithdrawValue(data.tradeData)
                    }
                } else {
                    setWithdrawValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }

                res();
            })
        },
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
            // myLog('withdraw handleOnAddressChange', value);
            setWithdrawAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    }

    return {
        withdrawAlertText,
        withdrawToastOpen, 
        setWithdrawToastOpen,
        withdrawProps,
    }
}
