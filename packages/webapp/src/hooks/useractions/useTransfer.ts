import React, { useCallback } from 'react';

import * as sdk from '@loopring-web/loopring-sdk'

import { connectProvides } from '@loopring-web/web3-provider';

import { AccountStep, SwitchData, TransferProps, useOpenModals, } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, FeeInfo, IBData, SagaStatus, WalletMap } from '@loopring-web/common-resources';

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from '../common/useChargeFees';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { myLog } from "@loopring-web/common-resources";
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletLayer2Socket, walletLayer2Service } from '../../services/socket';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { AddressError, BIGO, DAYS, TOAST_TIME } from 'defs/common_defs';
import { useTranslation } from 'react-i18next';
import { useAddressCheck } from 'hooks/common/useAddrCheck';
import { useWalletInfo } from 'stores/localStore/walletInfo';
import { checkErrorInfo } from './utils';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useModalData } from 'stores/router';
import { isAccActivated } from './checkAccStatus';
import { getFloatValue } from 'utils/formatter_tool';

export const useTransfer = <R extends IBData<T>, T>(): {
    transferToastOpen: boolean,
    transferAlertText: any,
    setTransferToastOpen: any,
    transferProps: TransferProps<R, T>,
    processRequest: any,
    lastRequest: any,
} => {

    const { setShowAccount, setShowTransfer, } = useOpenModals()

    const [transferToastOpen, setTransferToastOpen] = React.useState<boolean>(false)

    const [transferAlertText, setTransferAlertText] = React.useState<string>()

    const { modals: { isShowTransfer: { symbol, isShow } } } = useOpenModals()

    const { tokenMap, totalCoinMap, } = useTokenMap();
    const { account, status: accountStatus, } = useAccount()
    const { exchangeInfo, chainId } = useSystem();

    const { transferValue, updateTransferData, resetTransferData, } = useModalData()

    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>);
    const { chargeFeeList } = useChargeFees({tokenSymbol: transferValue.belong, requestType: sdk.OffchainFeeReqType.TRANSFER, tokenMap})

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<FeeInfo>()
    const [isExceedMax, setIsExceedMax] = React.useState(false)
    // const [isLoopringAddress, setIsLoopringAddress] = React.useState(true)
    // const [isAddressCheckLoading, setIsAddressCheckLoading] = React.useState(false)

    const {
        address,
        realAddr,
        setAddress,
        addrStatus,
        isLoopringAddress,
        isAddressCheckLoading,
        isSameAddress,
    } = useAddressCheck()

    const { btnStatus, enableBtn, disableBtn, } = useBtnStatus()

    // check whether the address belongs to loopring layer2
    // React.useEffect(() => {
    //     if (address && LoopringAPI && LoopringAPI.exchangeAPI && addrStatus === AddressError.NoError) {
    //         (async function checkAddress () {
    //             setIsAddressCheckLoading(true)
    //             const res = await LoopringAPI.exchangeAPI?.getAccount({ owner: realAddr || address }) // ENS or address
    //             if (res && !res.error) {
    //                 setIsLoopringAddress(true)
    //             } if (res && res.error){
    //                 setIsLoopringAddress(false)
    //             } else {
    //                 setIsLoopringAddress(true)
    //             }
    //             setIsAddressCheckLoading(false)
    //         })()
    //     }
    // }, [addrStatus, address, realAddr])

    const checkBtnStatus = React.useCallback(() => {

        if (!tokenMap || !tranferFeeInfo?.belong || !transferValue?.belong || !address) {
            disableBtn()
            return
        }

        const sellToken = tokenMap[transferValue.belong as string]

        const tradeValue = sdk.toBig(transferValue.tradeValue ?? 0).times('1e' + sellToken.decimals)
        
        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && tradeValue.gt(BIGO)
            && addrStatus === AddressError.NoError && !isExceedMax) {
            enableBtn()
        } else {
            disableBtn()

        }

    }, [enableBtn, disableBtn, tokenMap, address, addrStatus, chargeFeeList, tranferFeeInfo, transferValue, isExceedMax, ])

    React.useEffect(() => {
        
        checkBtnStatus()

    }, [tokenMap, chargeFeeList, address, addrStatus, tranferFeeInfo?.belong, transferValue?.belong, transferValue?.tradeValue, isExceedMax, ])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>
        setWalletMap(walletMap)
    }, [])

    useWalletLayer2Socket({ walletLayer2Callback })

    const resetDefault = React.useCallback(() => {
        if (symbol && walletMap) {
            myLog('resetDefault symbol:', symbol)
            updateTransferData({
                belong: symbol as any,
                balance: walletMap[symbol]?.count,
                tradeValue: undefined,
                address: "*",
            })
        } else {
            if (!transferValue.belong && walletMap) {
                const keys = Reflect.ownKeys(walletMap)
                for (var key in keys) {
                    const keyVal = keys[key]
                    const walletInfo = walletMap[keyVal]
                    if (sdk.toBig(walletInfo.count).gt(0)) {
                        updateTransferData({
                            belong: keyVal as any,
                            tradeValue: 0,
                            balance: walletInfo.count,
                            address: "*",
                        })
                        break
                    }
                }
            }

        }
    }, [symbol, walletMap, updateTransferData, transferValue])

    React.useEffect(() => {
        if (isShow) {
            resetDefault()
        }
    }, [isShow])

    React.useEffect(() => {

        if (isShow && accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
            // myLog('useEffect transferValue.address:', transferValue.address)
            if (!transferValue.address) {
                setAddress('')
            }
            // setAddress(transferValue.address ? transferValue.address : '')
        }

    }, [setAddress, isShow, transferValue.address, accountStatus, account.readyState])

    const { checkHWAddr, updateHW, } = useWalletInfo()

    const [lastRequest, setLastRequest] = React.useState<any>({})

    const processRequest = React.useCallback(async (request: sdk.OriginTransferRequestV3, isFirstTime: boolean) => {

        const { apiKey, connectName, eddsaKey } = account

        try {

            if (connectProvides.usedWeb3) {

                let isHWAddr = checkHWAddr(account.accAddress)

                isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

                const response = await LoopringAPI.userAPI?.submitInternalTransfer({
                    request,
                    web3: connectProvides.usedWeb3,
                    chainId: chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
                    walletType: connectName as sdk.ConnectorNames,
                    eddsaKey: eddsaKey.sk,
                    apiKey,
                    isHWAddr,
                })

                myLog('submitInternalTransfer:', response)


                if (isAccActivated()) {

                    if ((response as sdk.ErrorMsg)?.errMsg) {
                        // Withdraw failed
                        const code = checkErrorInfo(response, isFirstTime)
                        if (code === sdk.ConnectorError.USER_DENIED) {
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_User_Denied })
                        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                            setLastRequest({ request })
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_First_Method_Denied })
                        } else {
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_Failed })
                        }
                    } else if ((response as sdk.TX_HASH_RESULT<sdk.TX_HASH_API>)?.resultInfo ) {
                        setShowAccount({ isShow: true, step: AccountStep.Transfer_Failed })
                    } else {
                        // Withdraw success
                        setShowAccount({ isShow: true, step: AccountStep.Transfer_In_Progress })
                        await sdk.sleep(TOAST_TIME)
                        setShowAccount({ isShow: true, step: AccountStep.Transfer_Success })
                        if (isHWAddr) {
                            myLog('......try to set isHWAddr', isHWAddr)
                            updateHW({ wallet: account.accAddress, isHWAddr })
                        }
                        walletLayer2Service.sendUserUpdate()

                        resetTransferData()
                    }
                } else {

                    resetTransferData()
                }


            }

        } catch (reason) {
            const code = checkErrorInfo(reason, isFirstTime)

            if (isAccActivated()) {
                if (code === sdk.ConnectorError.USER_DENIED) {
                    setShowAccount({ isShow: true, step: AccountStep.Transfer_User_Denied })
                } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                    setLastRequest({ request })
                    setShowAccount({ isShow: true, step: AccountStep.Transfer_First_Method_Denied })
                } else {
                    setShowAccount({ isShow: true, step: AccountStep.Transfer_Failed })
                }
            }

        }
    }, [setLastRequest, setShowAccount, updateHW, account,])

    const onTransferClick = useCallback(async (transferValue, isFirstTime: boolean = true) => {
        const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

        if (readyState === AccountStatus.ACTIVATED && tokenMap && LoopringAPI.userAPI
            && exchangeInfo && connectProvides.usedWeb3
            && transferValue.address !== '*'
            && transferValue?.belong && tranferFeeInfo?.belong && eddsaKey?.sk) {

            try {

                setShowTransfer({ isShow: false })
                setShowAccount({ isShow: true, step: AccountStep.Transfer_WaitForAuth })

                const sellToken = tokenMap[transferValue.belong as string]
                const feeToken = tokenMap[tranferFeeInfo.belong]

                const fee = sdk.toBig(tranferFeeInfo.__raw__.feeRaw ?? 0)
                const balance = sdk.toBig(transferValue.balance ?? 0).times('1e' + sellToken.decimals)
                const tradeValue = sdk.toBig(transferValue.tradeValue ?? 0).times('1e' + sellToken.decimals)
                const isExceedBalance = feeToken.tokenId === sellToken.tokenId && tradeValue.plus(fee).gt(balance)
                const finalVol = isExceedBalance ?  balance.minus(fee) : tradeValue
                const transferVol = finalVol.toFixed(0, 0)

                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId,
                    sellTokenId: sellToken.tokenId
                }, apiKey)
                const req: sdk.OriginTransferRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    payerAddr: accAddress,
                    payerId: accountId,
                    payeeAddr: realAddr ? realAddr : address,
                    payeeId: 0,
                    storageId: storageId?.offchainId,
                    token: {
                        tokenId: sellToken.tokenId,
                        volume: transferVol,
                    },
                    maxFee: {
                        tokenId: feeToken.tokenId,
                        volume: fee.toString(),
                    },
                    validUntil: getTimestampDaysLater(DAYS),
                    memo: transferValue.memo,
                }

                myLog('transfer req:', req)

                processRequest(req, isFirstTime)

            } catch (e) {
                sdk.dumpError400(e)
                // transfer failed
                setShowAccount({ isShow: true, step: AccountStep.Transfer_Failed })
            }

        } else {
            return false
        }

    }, [processRequest, account, tokenMap, tranferFeeInfo?.belong, transferValue, address,realAddr])

    const handlePanelEvent = useCallback(async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {

            if (data.to === 'button') {
                if (walletMap && data?.tradeData?.belong) {
                    const walletInfo = walletMap[data?.tradeData?.belong as string]
                    updateTransferData({
                        belong: data.tradeData?.belong,
                        tradeValue: data.tradeData?.tradeValue,
                        balance: walletInfo ? walletInfo.count : 0,
                        address: '*',
                    })
                } else {
                    updateTransferData({ 
                        belong: undefined, 
                        tradeValue: undefined, 
                        balance: undefined,
                        address: '*', })
                }
            }

            res();
        })
    }, [updateTransferData, transferValue])

    const handleFeeChange = useCallback((value: FeeInfo): void => {
        setTransferFeeInfo(value)
    }, [setTransferFeeInfo])

    const { t } = useTranslation()

    const transferProps = {
        addressDefault: address,
        realAddr,
        tradeData: transferValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap as WalletMap<T>,
        transferBtnStatus: btnStatus,
        onTransferClick,
        handleFeeChange,
        handlePanelEvent,
        chargeFeeToken: transferValue.belong,
        chargeFeeTokenList: chargeFeeList,
        isLoopringAddress,
        isSameAddress,
        isAddressCheckLoading,
        addrStatus,
        handleOnAddressChange: (value: any) => {
            setAddress(value || '')
        },
        handleError: ({ belong, balance, tradeValue }: any) => {
            balance = getFloatValue(balance)
            tradeValue = getFloatValue(tradeValue)
            // myLog(belong, balance, tradeValue, (tradeValue > 0 && balance < tradeValue) || (!!tradeValue && !balance))
            if ((balance > 0 && balance < tradeValue) || (tradeValue && !balance)) {
                setIsExceedMax(true)
                return { error: true, message: t('tokenNotEnough', { belong, }) }
            }
            setIsExceedMax(false)
            return { error: false, message: '' }
        },
        handleAddressError: (value: any) => {
            updateTransferData({ address: value, balance: -1, tradeValue: -1 })
            return { error: false, message: '' }
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
