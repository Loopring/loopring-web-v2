import React from 'react';

import { useTranslation } from 'react-i18next';

import { connectProvides } from '@loopring-web/web3-provider';
import { AccountStep, SwitchData, useOpenModals, WithdrawProps } from '@loopring-web/component-lib';
import {
    AccountStatus,
    CoinMap,
    FeeInfo,
    IBData, NFTWholeINFO,
    SagaStatus,
    WalletMap,
    WithdrawType,
    WithdrawTypes
} from '@loopring-web/common-resources';

import * as sdk from '@loopring-web/loopring-sdk'

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
import { useAddressCheck, } from 'hooks/common/useAddrCheck';
import { useWalletInfo } from 'stores/localStore/walletInfo';
import { checkErrorInfo } from './utils';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useModalData } from 'stores/router';
import { isAccActivated } from './checkAccStatus';
import { getFloatValue } from 'utils/formatter_tool';
import { ErrorMsg, OffchainFeeReqType, OffchainNFTFeeReqType, UserNFTBalanceInfo } from '@loopring-web/loopring-sdk';
import { NFTTokenInfo } from '@loopring-web/loopring-sdk';
import { useChargeNFTFees } from '../common/useChargeNFTFees';

export const useNFTWithdraw = <R extends IBData<T> & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>,T>(
    {isLocalShow = false,doWithdrawDone}: { isLocalShow?: boolean, doWithdrawDone?:()=>void }
): {
    nftWithdrawAlertText: string | undefined,
    nftWithdrawToastOpen: boolean,
    setNFTWithdrawToastOpen: any,
    nftWithdrawProps: WithdrawProps<R, T>
    processRequestNFT: any,
    lastNFTRequest: any,
} => {

    const { t } = useTranslation('common')
    const { modals: { isShowNFTWithdraw: { isShow ,nftData,nftBalance,...nftRest} }, setShowAccount, setShowNFTWithdraw, } = useOpenModals()

    const [nftWithdrawToastOpen, setNFTWithdrawToastOpen] = React.useState<boolean>(false)

    const [nftWithdrawAlertText, setNFTWithdrawAlertText] = React.useState<string>()

    const { tokenMap, totalCoinMap, } = useTokenMap();
    const { account, status: accountStatus } = useAccount()
    const { exchangeInfo, chainId } = useSystem();

    const { nftWithdrawValue, updateNFTWithdrawData, resetNFTWithdrawData, } = useModalData()

    const [walletMap2, setWalletMap2] = React.useState(makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>);

    const [nftWithdrawFeeInfo, setNFTWithdrawFeeInfo] = React.useState<FeeInfo>()

    const [nftWithdrawType, setWithdrawType] = React.useState<sdk.OffchainFeeReqType>(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)

    // const nftWithdrawType2 = nftWithdrawType === sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'
    const { chargeFeeList } = useChargeNFTFees({tokenAddress: nftWithdrawValue.tokenAddress,
        requestType:OffchainNFTFeeReqType.NFT_WITHDRAWAL,
        tokenMap, amount: nftWithdrawValue.tradeValue,needRefresh:true})

    //const [, setWithdrawTypes] = React.useState<any>({ 'Standard': '' })
    const nftWithdrawTypes =  { Standard: '' };
    const [isExceedMax, setIsExceedMax] = React.useState(false)
    const { checkHWAddr, updateHW, } = useWalletInfo()

    const [lastNFTRequest, setLastNFTRequest] = React.useState<any>({})

    const [nftWithdrawI18nKey, setWithdrawI18nKey] = React.useState<string>()

    const {
        address,
        realAddr,
        setAddress,
        addrStatus,
    } = useAddressCheck()

    const { btnStatus, enableBtn, disableBtn, } = useBtnStatus()
    //TODO NO pop is pop add isShow
    React.useEffect(() => {
        if ( isLocalShow) {
            resetDefault()
        }
    }, [isLocalShow])
    const checkBtnStatus = React.useCallback(() => {

        if (!tokenMap || !nftWithdrawFeeInfo?.belong || !nftWithdrawValue?.tradeValue || !address) {
            disableBtn()
            return
        }

        // const nftWithdrawT = tokenMap[nftWithdrawValue.belong as string]

        // const tradeValue = sdk.toBig(nftWithdrawValue.tradeValue ?? 0).times('1e' + nftWithdrawT.decimals)

        // const exceedPoolLimit = nftWithdrawType2 === 'Fast' && tradeValue.gt(0) && tradeValue.gte(sdk.toBig(nftWithdrawT.fastWithdrawLimit))
        const tradeValue =  sdk.toBig(nftWithdrawValue.tradeValue ?? 0)
        if (chargeFeeList && chargeFeeList?.length > 0 && !!address &&  tradeValue.gt(BIGO)
            && tradeValue.lte(nftWithdrawValue.nftBalance??0)
            && addrStatus === AddressError.NoError && !isExceedMax ) {
            enableBtn()
        } else {
            disableBtn()
        }

        // if (exceedPoolLimit) {
        //     setWithdrawI18nKey('nf tWithdrawLabelBtnExceed')
        // } else {
        //     setWithdrawI18nKey(undefined)
        // }

        // myLog('exceedPoolLimit:', exceedPoolLimit, feeToken, nftWithdrawFeeInfo)

    }, [ enableBtn, disableBtn, tokenMap, address, addrStatus,
        chargeFeeList, nftWithdrawFeeInfo, nftWithdrawValue, isExceedMax, ])

    React.useEffect(() => {
        
        checkBtnStatus()
    }, [ address, addrStatus, nftWithdrawFeeInfo?.belong, nftWithdrawFeeInfo?.fee,
        nftWithdrawFeeInfo?.belong, nftWithdrawValue?.tradeValue, isExceedMax, ])

    // const updateWithdrawTypes = React.useCallback(async () => {
    //     //
    //     // if (nftWithdrawValue.belong && LoopringAPI.exchangeAPI && tokenMap) {
    //     //
    //     //     const tokenInfo = tokenMap[nftWithdrawValue.belong]
    //     //
    //     //     const req: sdk.GetWithdrawalAgentsRequest = {
    //     //         tokenId: tokenInfo.tokenId,
    //     //         amount: sdk.toBig('1e' + tokenInfo.decimals).toString(),
    //     //     }
    //     //
    //     //     const agent = await LoopringAPI.exchangeAPI.getWithdrawalAgents(req)
    //     //
    //     //     if (agent.supportTokenMap[nftWithdrawValue.belong]) {
    //     //         myLog('------- have agent!')
    //     //         setWithdrawTypes(WithdrawTypes)
    //     //     } else {
    //     //         myLog('------- have NO agent!')
    //     //         setWithdrawTypes({ 'Standard': '' })
    //     //     }
    //     // }
    //
    // }, [nftWithdrawValue, tokenMap,])

    // const updateWithdrawType = React.useCallback(() => {
    //     // myLog('nftWithdrawTypes:', nftWithdrawTypes, ' nftWithdrawType2:', nftWithdrawType2)
    //     if (!nftWithdrawTypes['Fast']) {
    //         // myLog('try to reset setWithdrawType!')
    //         setWithdrawType(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
    //     }
    // }, [nftWithdrawTypes, setWithdrawType])

    // React.useEffect(() => {
    //     updateWithdrawType()
    // }, [nftWithdrawTypes])

    // React.useEffect(() => {
    //
    //     updateWithdrawTypes()
    //
    // }, [nftWithdrawValue.belong, tokenMap,])

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2(true).walletMap ?? {} as WalletMap<R>
        setWalletMap2(walletMap)
    }, [setWalletMap2])

    const resetDefault = React.useCallback(() => {
        if (nftData) {
            updateNFTWithdrawData({
                belong: nftData as any,
                balance:  nftBalance,
                tradeValue: undefined,
                ...nftRest,
                address: address? address:"*",
            })

        } else {
            updateNFTWithdrawData({
                belong: '',
                balance:  0,
                tradeValue: 0,
                address: "*",
            })
            setShowNFTWithdraw({isShow:false})
        }
    }, [nftData, walletMap2, updateNFTWithdrawData, nftWithdrawValue])

    React.useEffect(() => {
        if (isShow) {
            resetDefault();
        }
    }, [isShow])

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
        } else {
            setShowNFTWithdraw({ isShow: false })
        }
    }, [accountStatus, account.readyState])

    React.useEffect(() => {

        if (accountStatus === SagaStatus.UNSET && account.readyState === AccountStatus.ACTIVATED) {
            if (nftWithdrawValue.address) {
                myLog('addr 1')
                setAddress(nftWithdrawValue.address)
            } else {
                myLog('addr 2')
                // setAddress(account.accAddress)
                updateNFTWithdrawData({
                    balance: -1,
                    tradeValue: -1,
                })
            }
        }

    }, [setAddress, isShow, nftWithdrawValue.address, accountStatus, account.readyState])

    useWalletLayer2Socket({ walletLayer2Callback })

    const processRequestNFT = React.useCallback(async (request: sdk.NFTWithdrawRequestV3, isFirstTime: boolean) => {

        const { apiKey, connectName, eddsaKey } = account

        try {
            if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {

                let isHWAddr = checkHWAddr(account.accAddress)

                isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

                myLog('nftWithdraw processRequestNFT:', isHWAddr, isFirstTime)
                const response = await LoopringAPI.userAPI.submitNFTWithdraw({
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
                    if ((response as sdk.ErrorMsg)?.errMsg) {
                        // Withdraw failed
                        const code = checkErrorInfo(response, isFirstTime)
                        if (code === sdk.ConnectorError.USER_DENIED) {
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_User_Denied })
                        } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                            setLastNFTRequest({ request })
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_First_Method_Denied })
                        } else {
                            setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                        }
                    } else if ((response as sdk.TX_HASH_RESULT<sdk.TX_HASH_API>)?.resultInfo ) {
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                    } else {
                        // Withdraw success
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_In_Progress })
                        await sdk.sleep(TOAST_TIME)
                        setShowAccount({ isShow: true, step: AccountStep.Withdraw_Success })
                        if (isHWAddr) {
                            myLog('......try to set isHWAddr', isHWAddr)
                            updateHW({ wallet: account.accAddress, isHWAddr })
                        }
                        if(doWithdrawDone){
                            doWithdrawDone()
                        }
                        resetNFTWithdrawData()
                    }

                    walletLayer2Service.sendUserUpdate()
                } else {

                    resetNFTWithdrawData()
                }

            }

        } catch (reason) {
            sdk.dumpError400(reason)
            const code = checkErrorInfo(reason, isFirstTime)
            myLog('code:', code)

            if (isAccActivated()) {
                if (code === sdk.ConnectorError.USER_DENIED) {
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_User_Denied })
                } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                    setLastNFTRequest({ request })
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_First_Method_Denied })
                } else {
                    setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
                }
            }
        }

    }, [setLastNFTRequest, setShowAccount, updateHW, account])

    const handleNFTWithdraw = React.useCallback(async (nftWithdrawToken: any, address, isFirstTime: boolean = true) => {

        const { accountId, accAddress, readyState, apiKey, eddsaKey } = account

        if (readyState === AccountStatus.ACTIVATED && tokenMap
            && exchangeInfo && connectProvides.usedWeb3
            && address && nftWithdrawFeeInfo?.belong && eddsaKey?.sk) {
            try {

                setShowNFTWithdraw({ isShow: false, })
                setShowAccount({ isShow: true, step: AccountStep.Withdraw_WaitForAuth, })

                // const nftWithdrawValue = tokenMap[inputValue.belong as string]
                const feeToken = tokenMap[nftWithdrawFeeInfo.belong]
                const fee = sdk.toBig(nftWithdrawFeeInfo?.__raw__?.feeRaw ?? 0)
                // const balance = sdk.toBig(nftWithdrawValue.balance ?? 0).times('1e' + nftWithdrawValue.decimals)
                // const tradeValue = sdk.toBig(nftWithdrawValue.tradeValue ?? 0).times('1e' + nftWithdrawValue.decimals)
                const tradeValue = nftWithdrawToken.tradeValue;
                // const balance = nftWithdrawValue.nftBalance;
                // const isExceedBalance = feeToken.tokenId === nftWithdrawValue.tokenId && tradeValue.plus(fee).gt(balance)
                // const isExceedBalance =  sdk.toBig(tradeValue).gt(balance)

                // const finalVol = isExceedBalance ?  balance.minus(fee) : tradeValue
                // const nftWithdrawVol = finalVol.toFixed(0, 0)

                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId: accountId,
                    sellTokenId: nftWithdrawToken.tokenId
                }, apiKey)
                
                const request: sdk.NFTWithdrawRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    owner: accAddress,
                    to: address,
                    accountId: account.accountId,
                    storageId: storageId?.offchainId,
                    token: {
                        tokenId: nftWithdrawToken.tokenId,
                        nftData: nftWithdrawToken.nftData,
                        amount: tradeValue.toString(),
                    },
                    maxFee: {
                        tokenId: feeToken.tokenId,
                        amount: fee.toString(),
                    },
                    // fastWithdrawalMode: nftWithdrawType2 === WithdrawType.Fast,
                    extraData: '',
                    minGas: 0,
                    validUntil: getTimestampDaysLater(DAYS),
                }

                myLog('submitOffchainWithdraw:', request)

                processRequestNFT(request, isFirstTime)

            } catch (e) {
                sdk.dumpError400(e)
                setShowAccount({ isShow: true, step: AccountStep.Withdraw_Failed })
            }

            return true

        } else {
            return false
        }

    }, [account, tokenMap, exchangeInfo, nftWithdrawType, nftWithdrawFeeInfo, nftWithdrawValue, setShowAccount])

    const handleFeeChange = React.useCallback((value: FeeInfo): void => {
        setNFTWithdrawFeeInfo(value)
    }, [setNFTWithdrawFeeInfo])

    const nftWithdrawProps: any = {
        withdrawI18nKey:nftWithdrawI18nKey,
        addressDefault: address,
        realAddr,
        tradeData: nftWithdrawValue as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        // nftWithdrawBtnStatus: btnStatus,
        // nftWithdrawType: nftWithdrawType,
        // nftWithdrawTypes:withdrawTypes,
        withdrawBtnStatus: btnStatus,
        withdrawType: nftWithdrawType,
        withdrawTypes: nftWithdrawTypes,
        onWithdrawClick: () => {
            if (nftWithdrawValue && nftWithdrawValue.tradeValue) {
                handleNFTWithdraw(nftWithdrawValue, realAddr ? realAddr : address)
            }
            setShowNFTWithdraw({ isShow: false })
        },
        handleFeeChange,
        handleNFTWithdrawTypeChange: (value: 'Fast' | 'Standard') => {
            // myLog('handleNFTWithdrawTypeChange', value)
            const offchainType = value === WithdrawType.Fast ? sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
            setWithdrawType(offchainType)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {

                if (data.to === 'button') {
                    if (data.tradeData.belong) {
                        updateNFTWithdrawData({
                            tradeValue: data.tradeData?.tradeValue,
                            balance: data.tradeData.nftBalance,
                            address: '*',
                        })
                    } else {
                        updateNFTWithdrawData({
                            belong: undefined,
                            tradeValue: undefined,
                            balance: undefined,
                            address: '*', })
                    }
                }

                res()
            })
        },
        chargeFeeToken: nftWithdrawFeeInfo?.belong,
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
        },
        handleAddressError: (value: any) => {
            updateNFTWithdrawData({ address: value, balance: -1, tradeValue: -1 })
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
        nftWithdrawAlertText,
        nftWithdrawToastOpen,
        setNFTWithdrawToastOpen,
        nftWithdrawProps,
        processRequestNFT,
        lastNFTRequest,
    }
}
