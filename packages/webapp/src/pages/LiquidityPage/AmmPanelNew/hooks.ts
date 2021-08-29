import React from "react";
import {
    AccountStatus,
    AmmData,
    AmmInDataNew,
    CoinInfo,
    fnType,
    IBData,
    SagaStatus,
} from '@loopring-web/common-resources';
import { AmmPanelType, TradeBtnStatus } from '@loopring-web/component-lib';
import { IdMap, useTokenMap } from '../../../stores/token';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { accountStaticCallBack, ammPairInit, btnLabel, btnClickMap, makeCache, makeWalletLayer2 } from '../../../hooks/help';
import * as sdk from 'loopring-sdk';
import {
    AmmPoolRequestPatch,
    AmmPoolSnapshot,
    ChainId,
    dumpError400,
    ExitAmmPoolRequest,
    GetAmmPoolSnapshotRequest,
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
    TokenInfo, WsTopicType
} from 'loopring-sdk';
import { useAccount } from '../../../stores/account/hook';
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { deepClone } from '../../../utils/obj_tools';
import { myLog } from "utils/log_tools";
import { useTranslation } from "react-i18next";

import { useWalletLayer2Socket,walletLayer2Service } from 'services/socket';

import * as _ from 'lodash'
import { useSocket, } from "stores/socket";
import { useToast } from "hooks/common/useToast";

export const useAmmCommon = ({ pair, snapShotData, }: {
    pair: {
        coinAInfo: CoinInfo<string> | undefined,
        coinBInfo: CoinInfo<string> | undefined
    }, 
    snapShotData: any,
    }) => {

    const { toastOpen, setToastOpen, closeToast, } = useToast()

    const { sendSocketTopic, socketEnd } = useSocket()

    const { account } = useAccount()

    const [ammPoolSnapshot, setAmmPoolSnapShot] = React.useState<AmmPoolSnapshot>()

    const { marketArray, marketMap, } = useTokenMap();
    const { ammMap } = useAmmMap();

    const updateAmmPoolSnapshot = React.useCallback(async () => {

        if (!pair?.coinAInfo?.simpleName || !pair?.coinBInfo?.simpleName || !LoopringAPI.ammpoolAPI) {
            return
        }

        const { market, amm } = getExistedMarket(marketArray, pair.coinAInfo.simpleName as string,
            pair.coinBInfo.simpleName as string)

        if (!market || !amm || !marketMap || !ammMap || !ammMap[amm as string]) {
            return
        }

        const ammInfo: any = ammMap[amm as string]

        const request1: GetAmmPoolSnapshotRequest = {
            poolAddress: ammInfo.address
        }

        const response = await LoopringAPI.ammpoolAPI.getAmmPoolSnapshot(request1)

        if (!response) {
            myLog('err res:', response)
            return
        }

        const { ammPoolSnapshot } = response

        setAmmPoolSnapShot(ammPoolSnapshot)

    }, [pair, marketArray, ammMap, setAmmPoolSnapShot])

    React.useEffect(() => {
        if (account.readyState === AccountStatus.ACTIVATED) {
            sendSocketTopic({ [WsTopicType.account]: true });
        } else {
            socketEnd()
        }
        return () => {
            socketEnd()
        }
    }, [account.readyState]);

    const refreshRef = React.createRef()

    React.useEffect(() => {
        if (refreshRef.current && pair) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click();
        }

    }, []);

    const walletLayer2Callback = React.useCallback(() => {

        if (snapShotData) {
            myLog('-------------setAmmPoolSnapShot:', snapShotData.ammPoolsBalance)
            setAmmPoolSnapShot(snapShotData.ammPoolsBalance)
        }

    }, [snapShotData, setAmmPoolSnapShot])

    React.useEffect(() => {
        walletLayer2Callback()
    }, [snapShotData])

    return {
        toastOpen,
        setToastOpen,
        closeToast,
        refreshRef,
        ammPoolSnapshot,
        updateAmmPoolSnapshot,
    }

}

// ----------calc hook -------

const initSlippage = 0.5

export const useAmmCalc = <C extends { [key: string]: any }>({
    setToastOpen,
    type,
    pair,
    ammPoolSnapshot,
    snapShotData,
}
    : {
        ammPoolSnapshot: AmmPoolSnapshot | undefined,
        setToastOpen: any,
        type: AmmPanelType,
        pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
        snapShotData: { tickerData: TickerData | undefined, ammPoolsBalance: AmmPoolSnapshot | undefined } | undefined
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

    const [ammCalcData, setAmmCalcData] = React.useState<AmmInDataNew<C> | undefined>();

    const [ammData, setAmmData] = React.useState<AmmData<IBData<C>, C>>({
        coinA: { belong: undefined } as unknown as IBData<C>,
        coinB: { belong: undefined } as unknown as IBData<C>,
        slippage: initSlippage
    } as AmmData<IBData<C>, C>);

    const [btnI18nKey, setBtnI18nKey] = React.useState<string | undefined>(undefined);

    const [fees, setFees] = React.useState<LoopringMap<OffchainFeeInfo>>()

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
        myLog('initAmmData:', account.accAddress, walletMap, pair)

        const _ammCalcData = ammPairInit({
            pair,
            _ammCalcData: {},
            coinMap,
            walletMap,
            ammMap,
            tickerData: snapShotData?.tickerData,
            ammPoolsBalance: snapShotData?.ammPoolsBalance
        })

        myLog('_ammCalcData:', _ammCalcData)

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
    }, [snapShotData, coinMap, tokenMap, ammCalcData, ammMap, 
        setAmmCalcData, setAmmData, setBaseToken, setQuoteToken, setBaseMinAmt, setQuoteMinAmt, ])

    const btnLabelActiveCheck = React.useCallback(({ ammData }): string | undefined => {

        const times = type === AmmPanelType.Join ? 10 : 1

        switch(type) {
            case AmmPanelType.Join:
            case AmmPanelType.Exit:
                const validAmt1 = ammData?.coinA?.tradeValue ? ammData?.coinA?.tradeValue >= times * baseMinAmt : false
                const validAmt2 = ammData?.coinB?.tradeValue ? ammData?.coinB?.tradeValue >= times * quoteMinAmt : false
                myLog('btnLabelActiveCheck ammData', ammData?.coinA?.tradeValue, ammData?.coinB?.tradeValue,
                 times * baseMinAmt, times * quoteMinAmt)
        
                if (isLoading) {
                    setBtnI18nKey(TradeBtnStatus.LOADING)
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
                        }  else {
                            // const symbol = !validAmt1 ? ammData?.coinA.belong : !validAmt2 ? ammData?.coinB.belong : ''
                            // const minOrderSize = !validAmt1 ? times * baseMinAmt : !validAmt2 ? times * quoteMinAmt : 0
                            setBtnStatus(TradeBtnStatus.DISABLED)
                            return `labelLimitMin, ${times * baseMinAmt} ${ammData?.coinA.belong} / ${times * quoteMinAmt} ${ammData?.coinB.belong}`
                        }
        
                    } else {
                        setBtnStatus(TradeBtnStatus.AVAILABLE)
                    }
        
                }
                break
            default:
                break

        }

        return undefined

    }, [account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, isLoading, setBtnStatus, type])

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

            const requestType = type === AmmPanelType.Join ? OffchainFeeReqType.AMM_JOIN : OffchainFeeReqType.AMM_EXIT

            const request: GetOffchainFeeAmtRequest = {
                accountId,
                requestType,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }

            const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(request, apiKey)
            setFees(fees)

            const fee = sdk.toBig(fees[pair.coinBInfo.simpleName]?.fee as string)
                .div('1e' + feeToken.decimals).toString()
                + ' ' + pair.coinBInfo.simpleName

            myLog('-> feeJoin:', fee)

            setAmmCalcData({ ...ammCalcData, fee, })
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

    const handleJoin = React.useCallback(async ({data, ammData, type, fees, ammPoolSnapshot, tokenMap, account}) => {
        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData, }]))

        // myLog(data, ammData, type, fees, ammPoolSnapshot, tokenMap, account)

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

        // myLog('handleJoin:', data, type);

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

    const handleExit = React.useCallback(async ({data, ammData, type, fees, ammPoolSnapshot, tokenMap, account}) => {
        setBtnI18nKey(accountStaticCallBack(btnLabelNew, [{ ammData, }]))

        const isAtoB = type === 'coinA'

        if (!tokenMap || !data.coinA.belong || !data.coinB.belong
            || !ammPoolSnapshot || !fees || !account?.accAddress
            || (isAtoB && data.coinA.tradeValue === undefined)
            || (!isAtoB && data.coinB.tradeValue === undefined)) {
            return
        }

        // myLog('handleExit', data, type);

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

    const handleAmmPoolEvent = (data: AmmData<IBData<any>>, _type: 'coinA' | 'coinB') => {

        if (type === AmmPanelType.Join) {
            handleJoin({data, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account})
        } else if (type === AmmPanelType.Exit) {
            handleExit({data, ammData, type: _type, fees, ammPoolSnapshot, tokenMap, account})
        }
    }

    const ammCalculator = React.useCallback(async function (props) {

        setIsLoading(true)
        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !request || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', request)

            setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmFailed') })
            setIsLoading(false)
            return
        }

        const { ammInfo, request: reqTmp } = request

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        switch (type) {
            case AmmPanelType.Join:
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
                        setIsLoading(false)
                    } else {
                        setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmSuccess') })
                        walletLayer2Service.sendUserUpdate()
                    }
                } catch (reason) {
                    dumpError400(reason)
                    setIsLoading(false)
                    setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
                } finally {
                }
                break
            case AmmPanelType.Exit:
                const reqExit: ExitAmmPoolRequest = reqTmp as ExitAmmPoolRequest

                const burnedReq: GetNextStorageIdRequest = {
                    accountId: account.accountId,
                    sellTokenId: reqExit.exitTokens.burned.tokenId as number
                }
                const storageId0 = await LoopringAPI.userAPI.getNextStorageId(burnedReq, account.apiKey)

                reqExit.storageId = storageId0.offchainId

                try {

                    myLog('exit req:', request)
                    setAmmData({
                        ...ammData, ...{
                            coinA: { ...ammData.coinA, tradeValue: 0 },
                            coinB: { ...ammData.coinB, tradeValue: 0 },
                        }
                    })
                    const response = await LoopringAPI.ammpoolAPI.exitAmmPool(reqExit, patch, account.apiKey)

                    myLog('exit ammpool response:', response)

                    if ((response.exitAmmPoolResult as any)?.resultInfo) {
                        setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
                    } else {
                        setToastOpen({ open: true, type: 'success', content: t('labelExitAmmSuccess') })
                        walletLayer2Service.sendUserUpdate()
                    }

                } catch (reason) {
                    dumpError400(reason)
                    setIsLoading(false)
                    setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
                }
                break
            default:
                break
        }

        if (props.__cache__) {
            makeCache(props.__cache__)
        }
    }, [type, request, ammData, account, t])

    const onAmmClickMap = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [ammCalculator]
    })
    const onAmmClick = React.useCallback((props: AmmData<IBData<any>>) => {
        accountStaticCallBack(onAmmClickMap, [props])
    }, [onAmmClickMap]);

    const walletLayer2Callback = React.useCallback(() => {

        if (pair?.coinAInfo?.simpleName && snapShotData?.ammPoolsBalance && tokenMap) {
            const { walletMap } = makeWalletLayer2()
            initAmmData(pair, walletMap)
            setIsLoading(false)
        }

    }, [pair?.coinAInfo?.simpleName, snapShotData?.tickerData, snapShotData?.ammPoolsBalance, tokenMap])

    useWalletLayer2Socket({ walletLayer2Callback })

    React.useEffect(() => {
        walletLayer2Callback()
    }, [pair?.coinAInfo?.simpleName, snapShotData?.tickerData, snapShotData?.ammPoolsBalance, tokenMap])

    return {
        ammCalcData,
        ammData,
        handleAmmPoolEvent,
        btnStatus,
        onAmmClick,
        btnI18nKey,

    }
}