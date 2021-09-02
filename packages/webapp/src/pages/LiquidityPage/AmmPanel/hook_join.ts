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
import * as sdk from 'loopring-sdk';
import {
    AmmPoolRequestPatch,
    AmmPoolSnapshot,
    ChainId,
    dumpError400,
    ExitAmmPoolRequest,
    getExistedMarket,
    GetNextStorageIdRequest,
    GetOffchainFeeAmtRequest,
    JoinAmmPoolRequest,
    LoopringMap,
    makeExitAmmPoolRequest,
    makeJoinAmmPoolRequest,
    MarketInfo,
    OffchainFeeInfo,
    OffchainFeeReqType,
    TickerData,
    toBig,
    TokenInfo,
} from 'loopring-sdk';
import { useAccount } from '../../../stores/account/hook';
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { deepClone } from '../../../utils/obj_tools';
import { myLog } from "utils/log_tools";
import { useTranslation } from "react-i18next";

import { useWalletLayer2Socket, walletLayer2Service } from 'services/socket';

// ----------calc hook -------

const initSlippage = 0.5

export const useAmmJoin = <C extends { [key: string]: any }>({
    setToastOpen,
    pair,
    ammPoolSnapshot,
    snapShotData,
}
    : {
        ammPoolSnapshot: AmmPoolSnapshot | undefined,
        setToastOpen: any,
        pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
        snapShotData: { tickerData: TickerData | undefined, ammPoolSnapshot: AmmPoolSnapshot | undefined } | undefined
    }) => {
    const { t } = useTranslation('common');

    const [isLoading, setIsLoading] = React.useState(false)

    const { coinMap, tokenMap } = useTokenMap();
    const { ammMap } = useAmmMap();
    const { account, status: accountStatus } = useAccount();
    const [btnStatus, setBtnStatus] = React.useState(TradeBtnStatus.DISABLED);

    const [baseToken, setBaseToken] = React.useState<TokenInfo>();
    const [quoteToken, setQuoteToken] = React.useState<TokenInfo>();
    const [baseMinAmt, setBaseMinAmt,] = React.useState<any>()
    const [quoteMinAmt, setQuoteMinAmt,] = React.useState<any>()

    const [ammCalcData, setAmmCalcData] = React.useState<AmmInData<C> | undefined>();

    const [ammData, setAmmData] = React.useState<AmmJoinData<IBData<C>, C>>({
        coinA: { belong: undefined } as unknown as IBData<C>,
        coinB: { belong: undefined } as unknown as IBData<C>,
        slippage: initSlippage
    } as AmmJoinData<IBData<C>, C>);

    const [btnI18nKey, setBtnI18nKey] = React.useState<string | undefined>(undefined);

    const [fees, setFees] = React.useState<LoopringMap<OffchainFeeInfo>>()
    const [fee, setFee] = React.useState<number>(0)

    const { account: { accountId, apiKey } } = useAccount()

    React.useEffect(() => {
        if (account.readyState !== AccountStatus.ACTIVATED) {
            setBtnStatus(TradeBtnStatus.AVAILABLE)
            setBtnI18nKey(accountStaticCallBack(btnLabelNew))
        } else {
            setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData }]))
        }

    }, [account.readyState, ammData])

    const initAmmData = React.useCallback(async (pair: any, walletMap: any) => {

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

        setAmmCalcData({ ...ammCalcData, ..._ammCalcData });
        if (_ammCalcData.myCoinA && tokenMap) {

            const baseT = tokenMap[_ammCalcData.myCoinA.belong]

            const quoteT = tokenMap[_ammCalcData.myCoinB.belong]

            setBaseToken(baseT)
            setQuoteToken(quoteT)

            setBaseMinAmt(baseT ? sdk.toBig(baseT.orderAmounts.minimum).div('1e' + baseT.decimals).toNumber() : undefined)
            setQuoteMinAmt(quoteT ? sdk.toBig(quoteT.orderAmounts.minimum).div('1e' + quoteT.decimals).toNumber() : undefined)

            setAmmData({
                coinA: { ..._ammCalcData.myCoinA, tradeValue: undefined },
                coinB: { ..._ammCalcData.myCoinB, tradeValue: undefined },
                slippage: initSlippage,
            })
        }
    }, [fee, snapShotData, coinMap, tokenMap, ammCalcData, ammMap,
        setAmmCalcData, setAmmData, setBaseToken, setQuoteToken, setBaseMinAmt, setQuoteMinAmt,])

    const btnLabelActiveCheck = React.useCallback(({ ammData }): string | undefined => {

        const times = 10

        const validAmt1 = ammData?.coinA?.tradeValue ? ammData?.coinA?.tradeValue >= times * baseMinAmt : false
        const validAmt2 = ammData?.coinB?.tradeValue ? ammData?.coinB?.tradeValue >= times * quoteMinAmt : false
        // myLog('btnLabelActiveCheck ammData', ammData?.coinA?.tradeValue, ammData?.coinB?.tradeValue,
        //     times * baseMinAmt, times * quoteMinAmt)

        if (isLoading) {
            setBtnI18nKey(TradeBtnStatus.LOADING)
            myLog('set LOADING')
            return undefined
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (ammData === undefined
                    || ammData?.coinA.tradeValue === undefined
                    || ammData?.coinB.tradeValue === undefined
                    || ammData?.coinA.tradeValue === 0
                    || ammData?.coinB.tradeValue === 0) {
                    setBtnStatus(TradeBtnStatus.DISABLED)
                    return 'labelEnterAmount';
                } else if (validAmt1 && validAmt2) {
                    setBtnStatus(TradeBtnStatus.AVAILABLE)
                    return undefined
                } else {
                    // const symbol = !validAmt1 ? ammData?.coinA.belong : !validAmt2 ? ammData?.coinB.belong : ''
                    // const minOrderSize = !validAmt1 ? times * baseMinAmt : !validAmt2 ? times * quoteMinAmt : 0
                    setBtnStatus(TradeBtnStatus.DISABLED)
                    return `labelLimitMin, ${times * baseMinAmt} ${ammData?.coinA.belong} / ${times * quoteMinAmt} ${ammData?.coinB.belong}`
                }

            } else {
                setBtnStatus(TradeBtnStatus.AVAILABLE)
            }

        }
        return undefined

    }, [account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, isLoading, setBtnStatus,])

    const btnLabelNew = Object.assign(deepClone(btnLabel), {
        [fnType.ACTIVATED]: [btnLabelActiveCheck]
    });

    const calculateCallback = React.useCallback(async () => {
        if (accountStatus === SagaStatus.UNSET) {
            if (!LoopringAPI.userAPI || !pair.coinBInfo?.simpleName
                || account.readyState !== AccountStatus.ACTIVATED
                || !ammCalcData || !tokenMap) {
                return
            }
            const feeToken: TokenInfo = tokenMap[pair.coinBInfo.simpleName]

            const requestType = OffchainFeeReqType.AMM_JOIN

            const request: GetOffchainFeeAmtRequest = {
                accountId,
                requestType,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }

            const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(request, apiKey)

            setFees(fees)

            const feeRaw = fees[pair.coinBInfo.simpleName] ? fees[pair.coinBInfo.simpleName].fee : 0
            const fee = sdk.toBig(feeRaw).div('1e' + feeToken.decimals)

            setFee(fee.toNumber())

            setAmmCalcData({
                ...ammCalcData, fee: fee.toString()
                    + ' ' + pair.coinBInfo.simpleName,
            })
        }

    }, [
        setFees, setAmmCalcData, setBtnI18nKey,
        accountStatus, account.readyState, accountId, apiKey,
        pair.coinBInfo?.simpleName, tokenMap, ammCalcData
    ])

    React.useEffect(() => {
        calculateCallback()
    }, [accountStatus, pair, ammData])

    const [request, setRequest] = React.useState<{ ammInfo: any, request: JoinAmmPoolRequest | ExitAmmPoolRequest }>();

    const handleJoin = React.useCallback(async ({ data, ammData, type, fees, ammPoolSnapshot, tokenMap, account }) => {
        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData, }]))

        if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !fees || !account?.accAddress) {
            return
        }

        const { slippage } = data

        const slippageReal = sdk.toBig(slippage).div(100).toString()

        const isAtoB = type === 'coinA'

        const { idIndex, marketArray, marketMap, } = store.getState().tokenMap

        const { ammMap } = store.getState().amm.ammMap

        const { market, amm } = getExistedMarket(marketArray, data.coinA.belong as string,
            data.coinB.belong as string)

        if (!market || !amm || !marketMap) {
            return
        }

        const marketInfo: MarketInfo = marketMap[market]

        const ammInfo: any = ammMap[amm as string]

        const coinA = tokenMap[data.coinA.belong as string]
        const coinB = tokenMap[data.coinB.belong as string]

        const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0;
        const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0;
        const rawVal = isAtoB ? rawA : rawB;

        const { request } = makeJoinAmmPoolRequest(rawVal,
            isAtoB, slippageReal, account.accAddress, fees as LoopringMap<OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.joinTokens.pooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.joinTokens.pooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData: data }]))

        setAmmData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage,
        })

        setRequest({
            ammInfo,
            request
        })

    }, [])

    const handleExit = React.useCallback(async ({ data, ammData, type, fees, ammPoolSnapshot, tokenMap, account }) => {
        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData, }]))

        const isAtoB = type === 'coinA'

        if (!tokenMap || !data.coinA.belong || !data.coinB.belong
            || !ammPoolSnapshot || !fees || !account?.accAddress
            || (isAtoB && data.coinA.tradeValue === undefined)
            || (!isAtoB && data.coinB.tradeValue === undefined)) {
            return
        }

        const { slippage } = data

        const slippageReal = sdk.toBig(slippage).div(100).toString()

        const { idIndex, marketArray, marketMap, } = store.getState().tokenMap

        const { ammMap } = store.getState().amm.ammMap

        const { market, amm } = getExistedMarket(marketArray, data.coinA.belong as string,
            data.coinB.belong as string)

        if (!market || !amm || !marketMap) {
            return
        }

        const marketInfo: MarketInfo = marketMap[market]

        const ammInfo: any = ammMap[amm as string]

        const coinA = tokenMap[data.coinA.belong as string]
        const coinB = tokenMap[data.coinB.belong as string]

        const rawVal = isAtoB ? data.coinA.tradeValue : data.coinB.tradeValue

        const { request } = makeExitAmmPoolRequest(rawVal.toString(), isAtoB, slippageReal, account.accAddress, fees as LoopringMap<OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData: data }]))

        setAmmData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage,
        })

        setRequest({
            ammInfo,
            request,
        })
        // }

    }, [])

    const handleAmmPoolEvent = (data: AmmJoinData<IBData<any>>, _type: 'coinA' | 'coinB') => {
        handleJoin({ data, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account })
    }

    const ammCalculator = React.useCallback(async function (props) {

        setIsLoading(true)
        setBtnStatus(TradeBtnStatus.LOADING)

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !request || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', request)

            setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmFailed') })
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
            return
        }

        const { ammInfo, request: reqTmp } = request

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        const req: JoinAmmPoolRequest = reqTmp as JoinAmmPoolRequest
        try {

            const request2: GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: req.joinTokens.pooled[0].tokenId as number
            }
            const storageId0 = await LoopringAPI.userAPI.getNextStorageId(request2, account.apiKey)

            const request_1: GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: req.joinTokens.pooled[1].tokenId as number
            }
            const storageId1 = await LoopringAPI.userAPI.getNextStorageId(request_1, account.apiKey)

            req.storageIds = [storageId0.offchainId, storageId1.offchainId]
            setAmmData({
                ...ammData, ...{
                    coinA: { ...ammData.coinA, tradeValue: 0 },
                    coinB: { ...ammData.coinB, tradeValue: 0 },
                }
            })
            const response = await LoopringAPI.ammpoolAPI.joinAmmPool(req, patch, account.apiKey)

            myLog('join ammpool response:', response)

            if ((response.joinAmmPoolResult as any)?.resultInfo) {
                setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
            } else {
                setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmSuccess') })
            }
        } catch (reason) {
            dumpError400(reason)
            setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
        } finally {
            setIsLoading(false)
            walletLayer2Service.sendUserUpdate()
        }

        if (props.__cache__) {
            makeCache(props.__cache__)
        }

    }, [request, ammData, account, t])

    const onAmmClickMap = Object.assign(deepClone(btnClickMap), {
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

    }, [fee, pair?.coinAInfo?.simpleName, snapShotData?.tickerData, snapShotData?.ammPoolSnapshot])

    useWalletLayer2Socket({ walletLayer2Callback })

    React.useEffect(() => {
        walletLayer2Callback()
    }, [fee, pair?.coinAInfo?.simpleName, snapShotData?.tickerData, snapShotData?.ammPoolSnapshot, tokenMap])

    return {
        ammCalcData,
        ammData,
        handleAmmPoolEvent,
        btnStatus,
        onAmmClick,
        btnI18nKey,

    }
}