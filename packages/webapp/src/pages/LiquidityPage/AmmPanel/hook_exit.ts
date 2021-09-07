import React from "react";
import {
    AccountStatus,
    AmmExitData,
    CoinInfo,
    fnType,
    IBData,
    SagaStatus,
} from '@loopring-web/common-resources';
import { TradeBtnStatus } from '@loopring-web/component-lib';
import { IdMap, useTokenMap } from '../../../stores/token';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import {
    accountStaticCallBack,
    ammPairInit,
    btnClickMap,
    btnLabel,
    makeCache,
    makeWalletLayer2
} from '../../../hooks/help';
import * as sdk from 'loopring-sdk'

import { useAccount } from '../../../stores/account/hook';
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { myLog } from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";

import { useWalletLayer2Socket, walletLayer2Service } from 'services/socket';

import _ from 'lodash'
import { initSlippage, usePageAmmPool, } from "stores/router";

export const useAmmExit = ({
    setToastOpen,
    pair,
    snapShotData,
}
    : {
        setToastOpen: any,
        pair: { coinAInfo: CoinInfo<string> | undefined, coinBInfo: CoinInfo<string> | undefined },
        snapShotData: { tickerData: sdk.TickerData | undefined, ammPoolSnapshot: sdk.AmmPoolSnapshot | undefined } | undefined
    }) => {

        const {
            ammExit: { fee, fees, request, btnI18nKey, btnStatus, ammCalcData, ammData, volA_show, volB_show, },
            updatePageAmmExit,
            updatePageAmmExitBtn,
            common: { ammInfo, ammPoolSnapshot, },
        } = usePageAmmPool()

    const { t } = useTranslation('common');

    const [isLoading, setIsLoading] = React.useState(false)

    const { idIndex, marketArray, marketMap, coinMap, tokenMap } = useTokenMap();
    const { ammMap } = useAmmMap();
    const { account, status: accountStatus } = useAccount();

    const [baseToken, setBaseToken] = React.useState<sdk.TokenInfo>();
    const [quoteToken, setQuoteToken] = React.useState<sdk.TokenInfo>();
    const [baseMinAmt, setBaseMinAmt,] = React.useState<any>()
    const [quoteMinAmt, setQuoteMinAmt,] = React.useState<any>()

        React.useEffect(() => {

            if (account.readyState !== AccountStatus.ACTIVATED && pair) {
                const btnInfo = accountStaticCallBack(btnLabelNew)

                if (typeof(btnInfo) === 'string') {
                    updatePageAmmExitBtn({btnI18nKey: btnInfo})
                }
                
                initAmmData(pair, undefined, true)
            }
    
        }, [account.readyState, pair, updatePageAmmExitBtn])

    React.useEffect(() => {

        if (account.readyState === AccountStatus.ACTIVATED && ammData && volA_show && volB_show) {
            const btnInfo = accountStaticCallBack(btnLabelNew, [{ ammData, volA_show, volB_show, }])
            updatePageAmmExitBtn(btnInfo)
        }

    }, [account.readyState, ammData, volA_show, volB_show, updatePageAmmExitBtn])

    const initAmmData = React.useCallback(async (pair: any, walletMap: any, isReset: boolean = false) => {

        const _ammCalcData = ammPairInit({
            fee,
            pair,
            _ammCalcData: {},
            coinMap,
            walletMap,
            ammMap,
            tickerData: snapShotData?.tickerData,
            ammPoolSnapshot: snapShotData?.ammPoolSnapshot
        })


        if (isReset) {
            updatePageAmmExit({ammCalcData: _ammCalcData})
        } else {
            updatePageAmmExit({ammCalcData: { ...ammCalcData, ..._ammCalcData }})
        }

        if (_ammCalcData.lpCoin && _ammCalcData.myCoinA && _ammCalcData.myCoinB && tokenMap) {

            const baseT = tokenMap[_ammCalcData.myCoinA.belong]

            const quoteT = tokenMap[_ammCalcData.myCoinB.belong]

            setBaseToken(baseT)
            setQuoteToken(quoteT)

            setBaseMinAmt(baseT ? sdk.toBig(baseT.orderAmounts.minimum).div('1e' + baseT.decimals).toNumber() : undefined)
            setQuoteMinAmt(quoteT ? sdk.toBig(quoteT.orderAmounts.minimum).div('1e' + quoteT.decimals).toNumber() : undefined)

            const newAmmData = {
                coinA: _ammCalcData.myCoinA,
                coinB: _ammCalcData.myCoinB,
                coinLP: _ammCalcData.lpCoin,
                slippage: initSlippage,
            }

            updatePageAmmExit({ammData: newAmmData})

        } else {
            myLog('check:', (_ammCalcData.lpCoin && _ammCalcData.myCoinA && _ammCalcData.myCoinB))
            myLog('tokenMap:', tokenMap)
        }

    }, [fee, snapShotData, coinMap, tokenMap, ammCalcData, ammMap,
        updatePageAmmExit, setBaseToken, setQuoteToken, setBaseMinAmt, setQuoteMinAmt, ])

    const btnLabelActiveCheck = React.useCallback(({ ammData, volA_show, volB_show }):
         { btnStatus?: TradeBtnStatus, btnI18nKey: string | undefined } => {

        const times = 1

        const validAmt1 = volA_show ? volA_show >= times * baseMinAmt : false
        const validAmt2 = volB_show ? volB_show >= times * quoteMinAmt : false

        if (isLoading) {
            return { btnStatus: TradeBtnStatus.LOADING, btnI18nKey: undefined }
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (ammData === undefined
                    || ammData?.coinLP?.tradeValue === undefined
                    || ammData?.coinLP?.tradeValue === 0) {
                        myLog('will DISABLED! ', ammData)

                        return { btnStatus: TradeBtnStatus.DISABLED, btnI18nKey: 'labelEnterAmount' }
                } else if (validAmt1 && validAmt2) {
                    return { btnStatus: TradeBtnStatus.AVAILABLE, btnI18nKey: undefined }
                } else {
                    return {
                        btnStatus: TradeBtnStatus.DISABLED,
                        btnI18nKey: `labelLimitMin, ${times * baseMinAmt} ${ammData?.coinA.belong} / ${times * quoteMinAmt} ${ammData?.coinB.belong}`
                    }
                }

            } else {
            }

        }

        return {
            btnStatus: TradeBtnStatus.AVAILABLE,
            btnI18nKey: undefined
        }

    }, [account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, isLoading, updatePageAmmExit,])

    const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
        [fnType.ACTIVATED]: [btnLabelActiveCheck]
    });

    const calculateCallback = React.useCallback(async () => {
        if (accountStatus === SagaStatus.UNSET) {
            if (!LoopringAPI.userAPI || !pair.coinBInfo?.simpleName
                || account.readyState !== AccountStatus.ACTIVATED
                || !ammCalcData || !tokenMap) {
                return
            }
            
            const feeToken: sdk.TokenInfo = tokenMap[pair.coinBInfo.simpleName]

            const request: sdk.GetOffchainFeeAmtRequest = {
                accountId: account.accountId,
                requestType: sdk.OffchainFeeReqType.AMM_EXIT,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }

            const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(request, account.apiKey)

            const feeRaw = fees[pair.coinBInfo.simpleName] ? fees[pair.coinBInfo.simpleName].fee : 0
            const fee = sdk.toBig(feeRaw).div('1e' + feeToken.decimals)

            updatePageAmmExit({ fee: fee.toNumber(), fees })

            const newAmmCalcData = {
                ...ammCalcData, fee: fee.toString()
                    + ' ' + pair.coinBInfo.simpleName,
            }

            updatePageAmmExit({ fee: fee.toNumber(), fees, ammCalcData: newAmmCalcData})
        }

    }, [updatePageAmmExit, accountStatus, account, pair, tokenMap, ammCalcData
    ])

    React.useEffect(() => {
        calculateCallback()
    }, [accountStatus, account.readyState, pair.coinBInfo?.simpleName, ammCalcData, tokenMap, ])

    const handleExit = React.useCallback(async ({ data, requestOut, ammData, fees, ammPoolSnapshot, tokenMap, account }) => {

        if (!tokenMap || !baseToken || !quoteToken
            || !ammPoolSnapshot || !account?.accAddress) {
            return
        }

        const { slippage } = data

        const slippageReal = sdk.toBig(slippage).div(100).toString()

        const { ammMap } = store.getState().amm.ammMap

        const { market, amm } = sdk.getExistedMarket(marketArray, baseToken.symbol, quoteToken.symbol)

        if (!market || !amm || !marketMap) {
            return
        }

        let newAmmData = {
            slippage: ammData.slippage,
        }

        const rawVal = data.coinLP.tradeValue

        let ammDataPatch = {}

        if (rawVal) {

            const { volA_show, volB_show ,request } = sdk.makeExitAmmPoolRequest2(rawVal.toString(), 
            slippageReal, account.accAddress, fees as sdk.LoopringMap<sdk.OffchainFeeInfo>,
                ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0)

                newAmmData['coinA'] = { ...ammData.coinA, tradeValue: volA_show, }
                newAmmData['coinB'] = { ...ammData.coinB, tradeValue: volB_show, }

            ammDataPatch = { request, volA_show, volB_show, }
        }

        updatePageAmmExit({...ammDataPatch, ammData: {...ammData, ...newAmmData, coinLP: data.coinLP,
            slippage: data.slippage, }})

    }, [updatePageAmmExit, idIndex, marketArray, marketMap, baseToken, quoteToken])

    const handleAmmPoolEvent = (data: AmmExitData<IBData<any>>, _type: 'coinA' | 'coinB') => {
        handleExit({ data, requestOut: request, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account })
    }

    const ammCalculator = React.useCallback(async function (props) {

        setIsLoading(true)
        updatePageAmmExitBtn({ btnStatus: TradeBtnStatus.LOADING })

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !request || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', request)

            setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmFailed') })
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
            return
        }

        
        let req = _.cloneDeep(request)

        const patch: sdk.AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as sdk.ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        const burnedReq: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: req.exitTokens.burned.tokenId as number
        }
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(burnedReq, account.apiKey)

        req.storageId = storageId0.offchainId

        try {

            myLog('---- try to exit req:', req)

            updatePageAmmExit({ammData: {
                ...ammData, ...{
                    coinLP: { ...ammData.coinLP, tradeValue: 0 },
                }
            }})
            
            const response = await LoopringAPI.ammpoolAPI.exitAmmPool(req, patch, account.apiKey)

            myLog('exit ammpool response:', response)

            if ((response.exitAmmPoolResult as any)?.resultInfo) {
                setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
            } else {
                setToastOpen({ open: true, type: 'success', content: t('labelExitAmmSuccess') })
            }

        } catch (reason) {
            sdk.dumpError400(reason)
            setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
        } finally {
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
        }

        if (props.__cache__) {
            makeCache(props.__cache__)
        }

    }, [request, ammData, account, t, updatePageAmmExit,])

    const onAmmClickMap = Object.assign(_.cloneDeep(btnClickMap), {
        [fnType.ACTIVATED]: [ammCalculator]
    })
    const onAmmClick = React.useCallback((props: AmmExitData<IBData<any>>) => {
        accountStaticCallBack(onAmmClickMap, [props])
    }, [onAmmClickMap, updatePageAmmExitBtn]);

    const walletLayer2Callback = React.useCallback(() => {

        if (pair?.coinAInfo?.simpleName && snapShotData?.ammPoolSnapshot) {
            const { walletMap } = makeWalletLayer2()
            initAmmData(pair, walletMap)
            setIsLoading(false)
        }

    }, [fee, pair?.coinAInfo?.simpleName, snapShotData?.ammPoolSnapshot])

    useWalletLayer2Socket({ walletLayer2Callback })

    React.useEffect(() => {
        walletLayer2Callback()
    }, [fee, pair?.coinAInfo?.simpleName, snapShotData?.ammPoolSnapshot, tokenMap])

    return {
        ammCalcData,
        ammData,
        handleAmmPoolEvent,
        btnStatus,
        onAmmClick,
        btnI18nKey,
        calculateCallback,

    }
}