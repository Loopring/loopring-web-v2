import React, { useCallback } from 'react';

import * as sdk from 'loopring-sdk'
import { ChainId, ConnectorError } from 'loopring-sdk'

import { connectProvides } from '@loopring-web/web3-provider';

import { AccountStep, SwitchData, TransferProps, useOpenModals, } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, IBData, WalletMap } from '@loopring-web/common-resources';

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { FeeInfo, useChargeFees } from '../common/useChargeFees';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { myLog } from 'utils/log_tools';
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletLayer2Socket, walletLayer2Service } from '../../services/socket';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS, TOAST_TIME } from 'defs/common_defs';
import { useTranslation } from 'react-i18next';
import { AddressError, useAddressCheck } from 'hooks/common/useAddrCheck';
import { useWalletInfo } from 'stores/localStore/walletInfo';
import { checkErrorInfo } from './utils';
import { useBtnStatus } from 'hooks/common/useBtnStatus';

export const useTransfer = <R extends IBData<T>, T>(): {
    // handleTransfer: (inputValue:R) => void,
    transferToastOpen: boolean,
    transferAlertText: any,
    setTransferToastOpen: any,
    transferProps: TransferProps<R, T>,
    processRequest: any,
    lastRequest: any,
    // transferValue: R
} => {

    const {setShowAccount, setShowTransfer,} = useOpenModals()

    const [transferToastOpen, setTransferToastOpen] = React.useState<boolean>(false)

    const [transferAlertText, setTransferAlertText] = React.useState<string>()

    const {modals: {isShowTransfer: {symbol, isShow}}} = useOpenModals()

    const {tokenMap, totalCoinMap,} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    // const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2().walletMap ?? {} as WalletMap<R>);
    // const {setShowTransfer}  = useOpenModals();
    const [transferValue, setTransferValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {chargeFeeList} = useChargeFees(transferValue.belong, sdk.OffchainFeeReqType.TRANSFER, tokenMap)

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<FeeInfo>()
    const [isExceedMax, setIsExceedMax] = React.useState(false)

    const {
        address,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const {btnStatus, enableBtn, disableBtn,} = useBtnStatus()

    React.useEffect(() => {

        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && transferValue?.tradeValue
            && addrStatus === AddressError.NoError && !isExceedMax) {
            enableBtn()
        } else {
            disableBtn()
        }

    }, [enableBtn, disableBtn, chargeFeeList, address, addrStatus, transferValue?.tradeValue, isExceedMax])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
        setWalletMap(walletMap)
    }, [])

    useWalletLayer2Socket({walletLayer2Callback})

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
                const keyVal = keys[ key ]
                const walletInfo = walletMap[ keyVal ]
                if (sdk.toBig(walletInfo.count).gt(0)) {
                    setTransferValue({
                        belong: keyVal as any,
                        tradeValue: 0,
                        balance: walletInfo.count,
                    })
                    break
                }
            }

        }
    }, [symbol, walletMap, setTransferValue])

    React.useEffect(() => {
        resetDefault();
    }, [isShow, tranferFeeInfo])

    // useCustomDCEffect(() => {
    //     if (chargeFeeList.length > 0) {
    //         setTransferFeeInfo(chargeFeeList[ 0 ])
    //     }
    // }, [chargeFeeList, setTransferFeeInfo])

    const {checkHWAddr, updateDepositHashWrapper,} = useWalletInfo()

    const [lastRequest, setLastRequest] = React.useState<any>({})

    const processRequest = React.useCallback(async (request: sdk.OriginTransferRequestV3, isFirstTime: boolean) => {

        const {apiKey, connectName, eddsaKey} = account

        if (connectProvides.usedWeb3) {

            let isHWAddr = checkHWAddr(account.accAddress)

            isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

            const response = await LoopringAPI.userAPI?.submitInternalTransfer({
                request,
                web3: connectProvides.usedWeb3,
                chainId: chainId !== ChainId.GOERLI ? ChainId.MAINNET : chainId,
                walletType: connectName as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
            })

            myLog('submitInternalTransfer:', response)

            if (response?.errorInfo) {
                // Withdraw failed
                const code = checkErrorInfo(response.errorInfo, isFirstTime)
                if (code === ConnectorError.USER_DENIED) {
                    setShowAccount({isShow: true, step: AccountStep.Transfer_User_Denied})
                } else if (code === ConnectorError.NOT_SUPPORT_ERROR) {
                    setLastRequest({request})
                    setShowAccount({isShow: true, step: AccountStep.Transfer_First_Method_Denied})
                } else {
                    setShowAccount({isShow: true, step: AccountStep.Transfer_Failed})
                }
            } else if (response?.resultInfo) {
                setShowAccount({isShow: true, step: AccountStep.Transfer_Failed})
            } else {
                // Withdraw success
                setShowAccount({isShow: true, step: AccountStep.Transfer_In_Progress})
                await sdk.sleep(TOAST_TIME)
                setShowAccount({isShow: true, step: AccountStep.Transfer_Success})
                if (isHWAddr) {
                    myLog('......try to set isHWAddr', isHWAddr)
                    updateDepositHashWrapper({wallet: account.accAddress, isHWAddr})
                }
            }

            walletLayer2Service.sendUserUpdate()

        }
    }, [setLastRequest, setShowAccount, updateDepositHashWrapper, account,])


    const onTransferClick = useCallback(async (transferValue, isFirstTime: boolean = true) => {
        console.log(transferValue)
        const {accountId, accAddress, readyState, apiKey, eddsaKey} = account
        myLog('useCallback tranferFeeInfo:', tranferFeeInfo)

        if (readyState === AccountStatus.ACTIVATED && tokenMap && LoopringAPI.userAPI
            && exchangeInfo && connectProvides.usedWeb3
            && transferValue?.belong && tranferFeeInfo?.belong && eddsaKey?.sk) {

            try {

                setShowTransfer({isShow: false})
                setShowAccount({isShow: true, step: AccountStep.Transfer_WaitForAuth})

                const sellToken = tokenMap[ transferValue.belong as string ]
                const feeToken = tokenMap[ tranferFeeInfo.belong ]
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
                        volume: String(tranferFeeInfo.fee),
                    },
                    validUntil: getTimestampDaysLater(DAYS),
                    memo: transferValue.memo,
                }

                processRequest(req, isFirstTime)

            } catch (e) {
                sdk.dumpError400(e)
                // transfer failed
                setShowAccount({isShow: true, step: AccountStep.Transfer_Failed})
            }

        } else {
            return false
        }

    }, [processRequest, account, tokenMap, tranferFeeInfo?.belong, transferValue, address])

    const handlePanelEvent = useCallback(async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            if (data?.tradeData?.belong && transferValue !== data.tradeData) {
                setTransferValue(data.tradeData)
            } else {
                setTransferValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
            }
            res();
        })
    }, [setTransferValue, transferValue])

    const handleFeeChange = useCallback((value: {
        belong: string;
        fee: number;
        __raw__?: any
    }): void => {
        myLog('handleFeeChange:', value)
        setTransferFeeInfo(value)
    }, [setTransferFeeInfo])

    const {t} = useTranslation()

    const transferProps = {
        tradeData: transferValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap as WalletMap<T>,
        transferBtnStatus: btnStatus,
        onTransferClick,
        handleFeeChange,
        handlePanelEvent,
        chargeFeeToken: transferValue.belong,
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
        },
        handleError: ({belong, balance, tradeValue}: any) => {
            if (typeof tradeValue !== 'undefined' && balance < tradeValue || (tradeValue && !balance)) {
                setIsExceedMax(true)
                return {error: true, message: t('tokenNotEnough', {belong,})}
            }
            setIsExceedMax(false)
            return {error: false, message: ''}
        },
        handleAddressError: (_value: any) => {
            setAddress(_value)
            return {error: false, message: ''}
        }
    }

    return {
        transferToastOpen,
        transferAlertText,
        setTransferToastOpen,
        transferProps,
        processRequest,
        lastRequest,
    }
}
