import React from "react";
import {
    AccountStatus,
    AmmJoinData,
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
import { sleep } from "loopring-sdk";
import { getTimestampDaysLater } from "utils/dt_tools";
import { DAYS } from "defs/common_defs";

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
        updatePageAmmJoinBtn,
        common: { ammInfo, ammPoolSnapshot, },
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
            const btnInfo = accountStaticCallBack(btnLabelNew)

            if (typeof(btnInfo) === 'string') {
                updatePageAmmJoinBtn({btnStatus: TradeBtnStatus.AVAILABLE, btnI18nKey: btnInfo})
            }
            
            initAmmData(pair, undefined, true)
        }

    }, [account.readyState, pair, updatePageAmmJoinBtn])

    React.useEffect(() => {

        if (account.readyState === AccountStatus.ACTIVATED && ammData?.coinA.belong && ammData.coinB.belong) {
            updatePageAmmJoinBtn(accountStaticCallBack(btnLabelNew, [{ ammData }]))
        }

    }, [account.readyState, ammData, updatePageAmmJoinBtn])

    const btnLabelActiveCheck = React.useCallback(({ ammData }): { btnStatus?: TradeBtnStatus, btnI18nKey: string | undefined } => {

        const times = 10

        const validAmt1 = ammData?.coinA?.tradeValue ? ammData?.coinA?.tradeValue >= times * baseMinAmt : false
        const validAmt2 = ammData?.coinB?.tradeValue ? ammData?.coinB?.tradeValue >= times * quoteMinAmt : false

        if (isLoading) {
            return { btnStatus: TradeBtnStatus.LOADING, btnI18nKey: undefined }
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (ammData === undefined
                    || ammData?.coinA.tradeValue === undefined
                    || ammData?.coinB.tradeValue === undefined
                    || ammData?.coinA.tradeValue === 0
                    || ammData?.coinB.tradeValue === 0) {
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

    }, [account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, isLoading, updatePageAmmJoin,])

    const btnLabelNew = Object.assign(_.cloneDeep(btnLabel), {
        [fnType.ACTIVATED]: [btnLabelActiveCheck]
    });

    const initAmmData = React.useCallback(async (pair: any, walletMap: any, isReset: boolean = false) => {

        const feeInfo = await getJoinFee()

        if (feeInfo?.fee && feeInfo?.fees) {
            const _ammCalcData = ammPairInit({
                fee: feeInfo?.fee,
                pair,
                _ammCalcData: {},
                coinMap,
                walletMap,
                ammMap,
                tickerData: snapShotData?.tickerData,
                ammPoolSnapshot: snapShotData?.ammPoolSnapshot
            })

            const feePatch = {
                fee: feeInfo?.fee.toNumber(), 
                fees: feeInfo?.fees,
            }

            if (isReset) {
                updatePageAmmJoin({ ammCalcData: _ammCalcData, ...feePatch, })
            } else {
                updatePageAmmJoin({ ammCalcData: { ...ammCalcData, ..._ammCalcData }, ...feePatch, })
            }
    
            if (_ammCalcData.myCoinA && tokenMap) {
    
                const baseT = tokenMap[_ammCalcData.myCoinA.belong]
    
                const quoteT = tokenMap[_ammCalcData.myCoinB.belong]
    
                setBaseToken(baseT)
                setQuoteToken(quoteT)
    
                setBaseMinAmt(baseT ? sdk.toBig(baseT.orderAmounts.minimum).div('1e' + baseT.decimals).toNumber() : undefined)
                setQuoteMinAmt(quoteT ? sdk.toBig(quoteT.orderAmounts.minimum).div('1e' + quoteT.decimals).toNumber() : undefined)
    
                const newAmmData = {
                    coinA: { ..._ammCalcData.myCoinA, tradeValue: undefined },
                    coinB: { ..._ammCalcData.myCoinB, tradeValue: undefined },
                    slippage: initSlippage,
                }
    
                updatePageAmmJoin({ ammData: newAmmData, })
            }

        }

    }, [snapShotData, coinMap, tokenMap, ammCalcData, ammMap,
        updatePageAmmJoin, setBaseToken, setQuoteToken, setBaseMinAmt, setQuoteMinAmt,])

    const getJoinFee = React.useCallback(async () => {
        if (accountStatus === SagaStatus.UNSET && LoopringAPI.userAPI && pair.coinBInfo?.simpleName
                && account.readyState === AccountStatus.ACTIVATED && tokenMap) {

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

            myLog('new join fee:', fee.toString())
            return {
                fee, 
                fees,
            }
        }

    }, [accountStatus, account, pair, tokenMap])

    const updateJoinFee = React.useCallback(async() => {

        if (pair?.coinBInfo?.simpleName && ammCalcData) {
            const feeInfo = await getJoinFee()
    
            if (feeInfo?.fee && feeInfo?.fees) {
    
                const newAmmCalcData = {
                    ...ammCalcData, fee: feeInfo?.fee.toString() + ' ' + pair.coinBInfo.simpleName,
                }
    
                updatePageAmmJoin({ fee: feeInfo?.fee.toNumber(), fees: feeInfo?.fees, ammCalcData: newAmmCalcData })
    
            }
        }


    }, [updatePageAmmJoin, ammCalcData, pair])

    const handleJoin = React.useCallback(async ({ data, ammData, type, fees, ammPoolSnapshot, tokenMap, account }) => {

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

        const coinA = tokenMap[data.coinA.belong as string]
        const coinB = tokenMap[data.coinB.belong as string]

        const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0
        const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0
        const rawVal = isAtoB ? rawA : rawB;

        const { request } = sdk.makeJoinAmmPoolRequest(rawVal,
            isAtoB, slippageReal, account.accAddress, fees as sdk.LoopringMap<sdk.OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0, 0)

        const newData = _.cloneDeep(data)

        if (isAtoB) {
            newData.coinB.tradeValue = parseFloat(sdk.toBig(request.joinTokens.pooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            newData.coinA.tradeValue = parseFloat(sdk.toBig(request.joinTokens.pooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        myLog('raw request:', request)

        updatePageAmmJoin({
            request,
            ammData: {
                coinA: newData.coinA as IBData<string>,
                coinB: newData.coinB as IBData<string>,
                slippage,
            }
        })

    }, [])

    // myLog('ammData in hook:', ammData)

    const handleAmmPoolEvent = (data: AmmJoinData<IBData<any>>, _type: 'coinA' | 'coinB') => {
        handleJoin({ data, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account })
    }

    const ammCalculator = React.useCallback(async function (props) {

        setIsLoading(true)

        updatePageAmmJoinBtn({ btnStatus: TradeBtnStatus.LOADING, })

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

            req.validUntil = getTimestampDaysLater(DAYS)

            myLog('join ammpool req:', req)

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
    }, [onAmmClickMap, updatePageAmmJoinBtn]);

    const walletLayer2Callback = React.useCallback(async() => {

        if (pair?.coinAInfo?.simpleName && snapShotData?.ammPoolSnapshot) {
            const { walletMap } = makeWalletLayer2()
            initAmmData(pair, walletMap)
            setIsLoading(false)
        }

    }, [pair?.coinAInfo?.simpleName, snapShotData?.ammPoolSnapshot])

    useWalletLayer2Socket({ walletLayer2Callback })

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET && LoopringAPI.userAPI && pair.coinBInfo?.simpleName && snapShotData?.ammPoolSnapshot
            && account.readyState === AccountStatus.ACTIVATED && tokenMap) {
                walletLayer2Callback()
        }
    }, [accountStatus, account.readyState, pair?.coinBInfo?.simpleName, snapShotData?.ammPoolSnapshot, tokenMap])

    return {
        ammCalcData,
        ammData,
        handleAmmPoolEvent,
        btnStatus,
        onAmmClick,
        btnI18nKey,
        updateJoinFee,
    }
}