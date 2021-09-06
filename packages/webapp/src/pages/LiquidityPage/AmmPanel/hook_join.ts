import React from "react";
import {
    AccountStatus,
    AmmJoinData,
    AmmInData,
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
import { initSlippage, usePageAmmPool } from "stores/router";

import _ from 'lodash'

// ----------calc hook -------

export const useAmmJoin = ({
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
        ammJoin: { fee, fees, request, btnStatus, btnI18nKey, ammCalcData, ammData, },
        updatePageAmmJoin,
        common: { ammInfo, ammPoolSnapshot, },
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__,
    } = usePageAmmPool()

    const { t } = useTranslation('common');

    const [isLoading, setIsLoading] = React.useState(false)

    const { coinMap, tokenMap } = useTokenMap();
    const { ammMap } = useAmmMap();
    const { account, status: accountStatus } = useAccount();

    const [baseToken, setBaseToken] = React.useState<sdk.TokenInfo>();
    const [quoteToken, setQuoteToken] = React.useState<sdk.TokenInfo>();
    const [baseMinAmt, setBaseMinAmt,] = React.useState<any>()
    const [quoteMinAmt, setQuoteMinAmt,] = React.useState<any>()

    React.useEffect(() => {
        
        if (account.readyState !== AccountStatus.ACTIVATED && pair) {
            updatePageAmmJoin({ btnStatus: TradeBtnStatus.AVAILABLE, btnI18nKey: accountStaticCallBack(btnLabelNew) })
            initAmmData(pair, undefined, true)
        }

    }, [account.readyState, pair])

    React.useEffect(() => {
        
        if (account.readyState === AccountStatus.ACTIVATED && ammData) {
            updatePageAmmJoin({ btnStatus: TradeBtnStatus.AVAILABLE, btnI18nKey: accountStaticCallBack(btnLabelNew, [{ ammData }]) })
        }

    }, [account.readyState, ammData])

    const btnLabelActiveCheck = React.useCallback(({ ammData }): string | undefined => {

        const times = 10

        const validAmt1 = ammData?.coinA?.tradeValue ? ammData?.coinA?.tradeValue >= times * baseMinAmt : false
        const validAmt2 = ammData?.coinB?.tradeValue ? ammData?.coinB?.tradeValue >= times * quoteMinAmt : false

        if (isLoading) {
            updatePageAmmJoin({ btnStatus: TradeBtnStatus.LOADING, })
            myLog('set LOADING')
            return undefined
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (ammData === undefined
                    || ammData?.coinA.tradeValue === undefined
                    || ammData?.coinB.tradeValue === undefined
                    || ammData?.coinA.tradeValue === 0
                    || ammData?.coinB.tradeValue === 0) {
                        updatePageAmmJoin({ btnStatus: TradeBtnStatus.DISABLED, })
                    return 'labelEnterAmount';
                } else if (validAmt1 && validAmt2) {
                    updatePageAmmJoin({ btnStatus: TradeBtnStatus.AVAILABLE, })
                    return undefined
                } else {
                    updatePageAmmJoin({ btnStatus: TradeBtnStatus.DISABLED, })
                    return `labelLimitMin, ${times * baseMinAmt} ${ammData?.coinA.belong} / ${times * quoteMinAmt} ${ammData?.coinB.belong}`
                }

            } else {
                updatePageAmmJoin({ btnStatus: TradeBtnStatus.AVAILABLE, })
            }

        }
        return undefined

    }, [account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, isLoading, updatePageAmmJoin,])

    const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
        [fnType.ACTIVATED]: [btnLabelActiveCheck]
    });

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

        myLog('initAmmData:', _ammCalcData)

        if (isReset) {
            updatePageAmmJoin({ammCalcData: _ammCalcData})
        } else {
            updatePageAmmJoin({ammCalcData: { ...ammCalcData, ..._ammCalcData }})
        }

        if (_ammCalcData.myCoinA && tokenMap) {

            const baseT = tokenMap[_ammCalcData.myCoinA.belong]

            const quoteT = tokenMap[_ammCalcData.myCoinB.belong]

            setBaseToken(baseT)
            setQuoteToken(quoteT)

            setBaseMinAmt(baseT ? sdk.toBig(baseT.orderAmounts.minimum).div('1e' + baseT.decimals).toNumber() : undefined)
            setQuoteMinAmt(quoteT ? sdk.toBig(quoteT.orderAmounts.minimum).div('1e' + quoteT.decimals).toNumber() : undefined)

            updatePageAmmJoin({ammData: {
                coinA: { ..._ammCalcData.myCoinA, tradeValue: undefined },
                coinB: { ..._ammCalcData.myCoinB, tradeValue: undefined },
                slippage: initSlippage,
            }})
        }
    }, [fee, snapShotData, coinMap, tokenMap, ammCalcData, ammMap,
        updatePageAmmJoin, setBaseToken, setQuoteToken, setBaseMinAmt, setQuoteMinAmt,])

    const calculateCallback = React.useCallback(async () => {
        if (accountStatus === SagaStatus.UNSET) {
            if (!LoopringAPI.userAPI || !pair.coinBInfo?.simpleName
                || account.readyState !== AccountStatus.ACTIVATED
                || !ammCalcData || !tokenMap) {
                return
            }

            myLog('calculateCallback......')

            const feeToken: sdk.TokenInfo = tokenMap[pair.coinBInfo.simpleName]

            const requestType = sdk.OffchainFeeReqType.AMM_JOIN

            const request: sdk.GetOffchainFeeAmtRequest = {
                accountId: account.accountId,
                requestType,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }

            const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(request, account.apiKey)

            const feeRaw = fees[pair.coinBInfo.simpleName] ? fees[pair.coinBInfo.simpleName].fee : 0
            const fee = sdk.toBig(feeRaw).div('1e' + feeToken.decimals)

            const newAmmCalcData = {
                ...ammCalcData, fee: fee.toString()
                    + ' ' + pair.coinBInfo.simpleName,
            }

            updatePageAmmJoin({ fee: fee.toNumber(), fees, ammCalcData: newAmmCalcData})
        }

    }, [updatePageAmmJoin, accountStatus, account, pair, tokenMap, ammCalcData
    ])

    React.useEffect(() => {
        calculateCallback()
    }, [accountStatus, pair.coinBInfo?.simpleName, ammData])

    const handleJoin = React.useCallback(async ({ data, ammData, type, fees, ammPoolSnapshot, tokenMap, account }) => {
        
        updatePageAmmJoin({ btnI18nKey: accountStaticCallBack(btnLabelNew, [{ ammData }]) })
        
        if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !fees || !account?.accAddress) {
            return
        }

        const { slippage } = data

        const slippageReal = sdk.toBig(slippage).div(100).toString()

        const isAtoB = type === 'coinA'

        const { idIndex, marketArray, marketMap, } = store.getState().tokenMap

        const { ammMap } = store.getState().amm.ammMap

        const { market, amm } = sdk.getExistedMarket(marketArray, data.coinA.belong as string,
            data.coinB.belong as string)

        if (!market || !amm || !marketMap) {
            return
        }

        const marketInfo: sdk.MarketInfo = marketMap[market]

        const ammInfo: any = ammMap[amm as string]

        const coinA = tokenMap[data.coinA.belong as string]
        const coinB = tokenMap[data.coinB.belong as string]

        const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0
        const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0
        const rawVal = isAtoB ? rawA : rawB;

        const { request } = sdk.makeJoinAmmPoolRequest(rawVal,
            isAtoB, slippageReal, account.accAddress, fees as sdk.LoopringMap<sdk.OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(sdk.toBig(request.joinTokens.pooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(sdk.toBig(request.joinTokens.pooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        myLog('raw request:', request)

        updatePageAmmJoin({ 
            request,
            btnI18nKey: accountStaticCallBack(btnLabelNew, [{ ammData }]),
            ammData: {
                coinA: data.coinA as IBData<string>,
                coinB: data.coinB as IBData<string>,
                slippage,
            }
        })

    }, [])

    const handleAmmPoolEvent = (data: AmmJoinData<IBData<any>>, _type: 'coinA' | 'coinB') => {
        handleJoin({ data, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account })
    }

    const ammCalculator = React.useCallback(async function (props) {

        setIsLoading(true)
        updatePageAmmJoin({ btnStatus: TradeBtnStatus.LOADING, })

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !request || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', request)

            setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmFailed') })
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
            return
        }

        const patch: sdk.AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as sdk.ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        let req = _.cloneDeep(request)

        try {
            myLog('join request.joinTokens:', request.joinTokens)
            myLog('join joinTokens:', req.joinTokens)

            const request0: sdk.GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: req.joinTokens.pooled[0].tokenId as number,
            }
            const storageId0 = await LoopringAPI.userAPI.getNextStorageId(request0, account.apiKey)

            const request_1: sdk.GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: req.joinTokens.pooled[1].tokenId as number
            }
            const storageId1 = await LoopringAPI.userAPI.getNextStorageId(request_1, account.apiKey)

            req.storageIds = [storageId0.offchainId, storageId1.offchainId]

            myLog('join storageId0:', storageId0)
            myLog('join storageId1:', storageId1)
            myLog('join req:', req)

            const response = await LoopringAPI.ammpoolAPI.joinAmmPool(req, patch, account.apiKey)

            myLog('join ammpool response:', response)

            updatePageAmmJoin({ 
                ammData: {
                    ...ammData, ...{
                        coinA: { ...ammData.coinA, tradeValue: 0 },
                        coinB: { ...ammData.coinB, tradeValue: 0 },
                    }
                }
            })

            if ((response.joinAmmPoolResult as any)?.resultInfo) {
                setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
            } else {
                setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmSuccess') })
            }
        } catch (reason) {
            sdk.dumpError400(reason)
            setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
        } finally {
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
        }

        if (props.__cache__) {
            makeCache(props.__cache__)
        }

    }, [request, ammData, account, t])

    const onAmmClickMap = Object.assign(_.cloneDeep(btnClickMap), {
        [fnType.ACTIVATED]: [ammCalculator]
    })
    const onAmmClick = React.useCallback((props: AmmJoinData<IBData<any>>) => {
        accountStaticCallBack(onAmmClickMap, [props])
    }, [onAmmClickMap]);

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

    }
}