import React, { useCallback } from 'react';

import * as sdk from 'loopring-sdk'

import { connectProvides } from '@loopring-web/web3-provider';

import { AccountStepNew, SwitchData, TradeBtnStatus, TransferProps, useOpenModals, } from '@loopring-web/component-lib';
import { AccountStatus, CoinInfo, CoinMap, IBData, WalletMap } from '@loopring-web/common-resources';

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from './useChargeFees';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { myLog } from 'utils/log_tools';
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletHook } from '../../services/wallet/useWalletHook';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS, REFRESH_RATE, TOAST_TIME } from 'defs/common_defs';
import { useTranslation } from 'react-i18next';
import { AddressError, useAddressCheck } from 'hooks/common/useAddrCheck';
import { ChainId, ConnectorError, sleep } from 'loopring-sdk';

export const useTransfer = <R extends IBData<T>, T>(): {
    // handleTransfer: (inputValue:R) => void,
        transferToastOpen: boolean,
        transferAlertText: any,
        setTransferToastOpen: any,
    transferProps: TransferProps<R, T>
    // transferValue: R
} => {

    const { setShowAccount, setShowTransfer, } = useOpenModals()

    const [transferToastOpen, setTransferToastOpen] = React.useState<boolean>(false)

    const [transferAlertText, setTransferAlertText] = React.useState<string>()

    const {modals: {isShowTransfer: {symbol,isShow}}} = useOpenModals()

    const { tokenMap, totalCoinMap, } = useTokenMap();
    const { account } = useAccount()
    const { exchangeInfo, chainId } = useSystem();
    // const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2().walletMap ?? {} as WalletMap<R>);
    // const {setShowTransfer}  = useOpenModals();
    const [transferValue, setTransferValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const { chargeFeeList } = useChargeFees(transferValue.belong, sdk.OffchainFeeReqType.TRANSFER, tokenMap)

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<any>()

    const {
        address,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const [btnStatus, setBtnStatus,] = React.useState<TradeBtnStatus>(TradeBtnStatus.AVAILABLE)

    React.useEffect(() => {

        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && transferValue
            && addrStatus === AddressError.NoError) {
            //valid
            //todo add amt check.
            myLog('try to AVAILABLE')
            setBtnStatus(TradeBtnStatus.AVAILABLE)
        } else {
            setBtnStatus(TradeBtnStatus.DISABLED)
        }

    }, [setBtnStatus, chargeFeeList, address, addrStatus, transferValue])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
        setWalletMap(walletMap)

    }, [])
    useWalletHook({walletLayer2Callback})
    const resetDefault = React.useCallback(() => {
        if (symbol) {
            setTransferValue({
                belong: symbol as any,
                balance: walletMap[ symbol ]?.count,
                tradeValue: undefined,
            })

        } else {
            const keys = Reflect.ownKeys(walletMap)
            for (var key in keys) {
                const keyVal = keys[key]
                const walletInfo = walletMap[keyVal]
                if (sdk.toBig(walletInfo.count).gt(0)) {
                    setTransferValue({
                        belong: keyVal as any,
                        tradeValue: 0,
                        balance: walletInfo.count,
                    })
                    break
                }
            }
            // }
            // const balance:CoinInfo<any> = walletMap ? walletMap[ Object.keys(walletMap)[ 0 ] ] : {}
            // setTransferValue({
            //     belong: balance.belong as any,
            //     balance: balance.count,
            //     tradeValue: undefined,
            // })
        }
    }, [symbol, walletMap, setTransferValue])

    React.useEffect(() => {
        resetDefault();
    }, [isShow])
    useCustomDCEffect(() => {

        if (chargeFeeList.length > 0) {
            setTransferFeeInfo(chargeFeeList[0])
        }

    }, [chargeFeeList, setTransferFeeInfo])

    const onTransferClick = useCallback(async (transferValue) => {
        const { accountId, accAddress, readyState, apiKey, connectName, eddsaKey } = account
        myLog('useCallback tranferFeeInfo:', tranferFeeInfo)

        if (readyState === AccountStatus.ACTIVATED && tokenMap && LoopringAPI.userAPI
            && exchangeInfo && connectProvides.usedWeb3
            && transferValue?.belong && tranferFeeInfo?.belong && eddsaKey?.sk) {

            try {

                setShowTransfer({ isShow: false})
                setShowAccount({isShow: true, step: AccountStepNew.Transfer_WaitForAuth})

                const sellToken = tokenMap[transferValue.belong as string]
                const feeToken = tokenMap[tranferFeeInfo.belong]
                const transferVol = sdk.toBig(transferValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId,
                    sellTokenId: sellToken.tokenId
                }, apiKey)
                const req: sdk.OriginTransferRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    payerAddr: accAddress,
                    payerId: accountId,
                    payeeAddr: address,
                    payeeId: 0,
                    storageId: storageId?.offchainId,
                    token: {
                        tokenId: sellToken.tokenId,
                        volume: transferVol,
                    },
                    maxFee: {
                        tokenId: feeToken.tokenId,
                        volume: tranferFeeInfo.__raw__,
                    },
                    validUntil: getTimestampDaysLater(DAYS),
                }

                const response = await LoopringAPI.userAPI.submitInternalTransfer({
                    request: req,
                    web3: connectProvides.usedWeb3,
                    chainId: chainId !== ChainId.GOERLI ? ChainId.MAINNET : chainId,
                    walletType: connectName as sdk.ConnectorNames,
                    eddsaKey: eddsaKey.sk,
                    apiKey,
                })

                myLog(response)

                if (response?.errorInfo) {
                    // transfer failed
                    myLog('NOT_SUPPORT_ERROR:', ConnectorError.NOT_SUPPORT_ERROR.toString())

                    if (response.errorInfo.errMsg && ConnectorError[response.errorInfo.errMsg]) {
                        setShowAccount({ isShow: true, step: AccountStepNew.Transfer_First_Method_Refused })
                    } else {
                        setShowAccount({ isShow: true, step: AccountStepNew.Transfer_Failed })
                    }
                } else if (response?.resultInfo) {
                    setShowAccount({ isShow: true, step: AccountStepNew.Transfer_Failed })
                } else {
                    // transfer success
                    setShowAccount({ isShow: true, step: AccountStepNew.Transfer_In_Progress })
                    await sleep(TOAST_TIME)
                    setShowAccount({ isShow: true, step: AccountStepNew.Transfer_Success })
                }

            } catch (e) {
                sdk.dumpError400(e)
                // transfer failed
                setShowAccount({ isShow: true, step: AccountStepNew.Transfer_Failed })
            }

        } else {
            return false
        }

    }, [account, tokenMap, tranferFeeInfo?.belong, transferValue, address])

    const handlePanelEvent = useCallback(async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            if (data?.tradeData?.belong && transferValue !== data.tradeData) {
                    setTransferValue(data.tradeData)
            } else {
                setTransferValue({ belong: undefined, tradeValue: 0, balance: 0 } as IBData<unknown>)
            }
            res();
        })
    }, [setTransferValue, transferValue])

    const handleFeeChange = useCallback((value: {
        belong: any;
        fee: number | string;
        __raw__?: any
    }): void => {
        myLog('handleFeeChange:', value)
        setTransferFeeInfo(value)
    }, [setTransferFeeInfo])

    const { t } = useTranslation()

    const transferProps = {
        tradeData: transferValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap as WalletMap<T>,
        transferBtnStatus: btnStatus,
        onTransferClick,
        handleFeeChange,
        handlePanelEvent,
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
        },
        handleError: ({ belong, balance, tradeValue }: any) => {
            if (typeof tradeValue !== 'undefined' && balance < tradeValue || (tradeValue && !balance)) {
                return { error: true, message: t('tokenNotEnough', { belong, }) }
            }
            return { error: false, message: '' }
        },
        handleAddressError: (_value: any) => {
            setAddress(_value)
            return { error: false, message: '' }
        }
    }
    
    return {
        transferToastOpen,
        transferAlertText,
        setTransferToastOpen,
        transferProps,
    }
}
