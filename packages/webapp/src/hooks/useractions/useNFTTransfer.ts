import React, { useCallback } from 'react';

import * as sdk from '@loopring-web/loopring-sdk'

import { connectProvides } from '@loopring-web/web3-provider';

import { AccountStep, SwitchData, TransferProps, useOpenModals, } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, FeeInfo, IBData, SagaStatus, WalletMap } from '@loopring-web/common-resources';

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from '../common/useChargeFees';
import { LoopringAPI, NFTTokenInfo, NFTWholeINFO } from 'api_wrapper';
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
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk/dist/defs/loopring_defs';

export const useNFTTransfer = <R extends IBData<T> & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>,T>(): {
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

    const { nftTransferValue, updateNFTTransferData, resetTransferData, } = useModalData()

    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>);
    const { chargeFeeList } = useChargeFees({tokenSymbol: nftTransferValue.belong, requestType: sdk.OffchainFeeReqType.TRANSFER, tokenMap})

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<FeeInfo>()
    const [isExceedMax, setIsExceedMax] = React.useState(false)

    const {
        address,
        realAddr,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const { btnStatus, enableBtn, disableBtn, } = useBtnStatus()

    const checkBtnStatus = React.useCallback(() => {

        if (!tokenMap || !tranferFeeInfo?.belong || !nftTransferValue?.belong || !address) {
            disableBtn()
            return
        }

        const sellToken = tokenMap[nftTransferValue.belong as string]

        const tradeValue = sdk.toBig(nftTransferValue.tradeValue ?? 0).times('1e' + sellToken.decimals)
        
        if (chargeFeeList && chargeFeeList?.length > 0 && !!address && tradeValue.gt(BIGO)
            && addrStatus === AddressError.NoError && !isExceedMax) {
            enableBtn()
        } else {
            disableBtn()
        }

    }, [enableBtn, disableBtn, tokenMap, address, addrStatus, chargeFeeList, tranferFeeInfo, nftTransferValue, isExceedMax, ])

    React.useEffect(() => {
        
        checkBtnStatus()

    }, [tokenMap, chargeFeeList, address, addrStatus, tranferFeeInfo?.belong, nftTransferValue?.belong, nftTransferValue?.tradeValue, isExceedMax, ])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>
        setWalletMap(walletMap)
    }, [])

    useWalletLayer2Socket({ walletLayer2Callback })

    const resetDefault = React.useCallback(() => {
        updateNFTTransferData({
            accountId: 0,
            description: '',
            image: '',
            pending: {deposit: '', withdraw: ''}, total: '',
            status: false,
            locked: '',
            memo: undefined,
            nftType: '',
            minter: '',
            name: '',
            tokenId: 0,
            creatorFeeBips: 0,
            nftData: '',
            nftId: '',
            tokenAddress: '',
            belong: symbol as any,
            balance:  Number(nftTransferValue?.total),
            tradeValue: undefined,
            address: "*"
        })
        // if (symbol && walletMap) {
        //     myLog('resetDefault symbol:', symbol)
        //     updateTransferData({
        //         belong: symbol as any,
        //         balance: walletMap[symbol]?.count,
        //         tradeValue: undefined,
        //         address: "*",
        //     })
        // } else {
        //     if (!nftTransferValue.belong && walletMap) {
        //         const keys = Reflect.ownKeys(walletMap)
        //         for (var key in keys) {
        //             const keyVal = keys[key]
        //             const walletInfo = walletMap[keyVal]
        //             if (sdk.toBig(walletInfo.count).gt(0)) {
        //                 updateTransferData({
        //                     belong: keyVal as any,
        //                     tradeValue: 0,
        //                     balance: walletInfo.count,
        //                     address: "*",
        //                 })
        //                 break
        //             }
        //         }
        //     }
        //
        // }
    }, [symbol, walletMap, updateNFTTransferData, nftTransferValue])

    React.useEffect(() => {
        if (isShow) {
            resetDefault()
        }
    }, [isShow])

    React.useEffect(() => {

        if (isShow && accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
            myLog('useEffect nftTransferValue.address:', nftTransferValue.address)
            setAddress(nftTransferValue.address ? nftTransferValue.address : '')
        }

    }, [setAddress, isShow, nftTransferValue.address, accountStatus, account.readyState])

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

                    if (response?.errorInfo) {
                        // Withdraw failed
                        const code = checkErrorInfo(response.errorInfo, isFirstTime)
                        if (code === sdk.ConnectorError.USER_DENIED) {
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_User_Denied })
                        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                            setLastRequest({ request })
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_First_Method_Denied })
                        } else {
                            setShowAccount({ isShow: true, step: AccountStep.Transfer_Failed })
                        }
                    } else if (response?.resultInfo) {
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

    const onTransferClick = useCallback(async (nftTransferValue, isFirstTime: boolean = true) => {
        const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

        if (readyState === AccountStatus.ACTIVATED && tokenMap && LoopringAPI.userAPI
            && exchangeInfo && connectProvides.usedWeb3
            && nftTransferValue?.belong && tranferFeeInfo?.belong && eddsaKey?.sk) {

            try {

                setShowTransfer({ isShow: false })
                setShowAccount({ isShow: true, step: AccountStep.Transfer_WaitForAuth })

                const sellToken = tokenMap[nftTransferValue.belong as string]
                const feeToken = tokenMap[tranferFeeInfo.belong]

                const fee = sdk.toBig(tranferFeeInfo.__raw__.feeRaw ?? 0)
                const balance = sdk.toBig(nftTransferValue.balance ?? 0).times('1e' + sellToken.decimals)
                const tradeValue = sdk.toBig(nftTransferValue.tradeValue ?? 0).times('1e' + sellToken.decimals)
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
                    memo: nftTransferValue.memo,
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

    }, [processRequest, account, tokenMap, tranferFeeInfo?.belong, nftTransferValue, address])

    const handlePanelEvent = useCallback(async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {

            if (data.to === 'button') {
                if (walletMap && data?.tradeData?.belong) {
                    const walletInfo = walletMap[data?.tradeData?.belong as string]
                    updateNFTTransferData({
                        // belong: data.tradeData?.belong,
                        tradeValue: data.tradeData?.tradeValue,
                        balance: walletInfo ? walletInfo.count : 0,
                        address: '*',
                    })
                } else {
                    updateNFTTransferData({
                        belong: undefined, 
                        tradeValue: undefined, 
                        balance: undefined,
                        address: '*', })
                }
            }

            res();
        })
    }, [updateNFTTransferData, nftTransferValue])

    const handleFeeChange = useCallback((value: FeeInfo): void => {
        setTransferFeeInfo(value)
    }, [setTransferFeeInfo])

    const { t } = useTranslation()

    const transferProps = {
        addressDefault: address,
        realAddr,
        tradeData: nftTransferValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap as WalletMap<T>,
        transferBtnStatus: btnStatus,
        onTransferClick,
        handleFeeChange,
        handlePanelEvent,
        chargeFeeToken: nftTransferValue.belong,
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
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
            updateNFTTransferData({ address: value, balance: -1, tradeValue: -1 })
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
