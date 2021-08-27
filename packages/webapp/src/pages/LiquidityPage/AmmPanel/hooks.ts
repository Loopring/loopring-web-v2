import React, { useEffect, useState } from "react";
import {
    AccountStatus,
    AmmData,
    AmmInData,
    CoinInfo,
    fnType,
    globalSetup,
    IBData,
    SagaStatus, WalletMap,
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
import { useWalletHook } from '../../../services/wallet/useWalletHook';
import { useSocket } from '../../../stores/socket';
import { walletLayer2Service } from '../../../services/wallet/walletLayer2Service';
import * as _ from 'lodash'
import { useToast } from "hooks/common/useToast";
export const useAmmPanel = <C extends { [key: string]: any }>({
    pair,
    ammType,
    snapShotData,
}
    : {
        pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
        snapShotData: { tickerData: TickerData | undefined, ammPoolsBalance: AmmPoolSnapshot | undefined } | undefined
        ammType: keyof typeof AmmPanelType
    }) => {
    const { t } = useTranslation('common');
    const {sendSocketTopic,socketEnd} = useSocket();
    const refreshRef = React.createRef();

    const [isJoinLoading, setJoinLoading] = useState(false)

    const [isExitLoading, setExitLoading] = useState(false)
    const { toastOpen, setToastOpen, closeToast, } = useToast()

    const { coinMap, tokenMap } = useTokenMap();
    const { ammMap } = useAmmMap();
    const { account, status: accountStatus } = useAccount();
    const { marketArray, marketMap, } = useTokenMap();
    const [addBtnStatus, setAddBtnStatus] = React.useState(TradeBtnStatus.AVAILABLE);
    const [removeBtnStatus, setRemoveBtnStatus] = React.useState(TradeBtnStatus.AVAILABLE);

    //TODO:
    const [baseToken, setBaseToken] =  useState<TokenInfo>();
    const [quoteToken, setQuoteToken] =  useState<TokenInfo>(); 
    const [baseMinAmt, setBaseMinAmt,] = useState<any>()
    const [quoteMinAmt, setQuoteMinAmt,] = useState<any>()
    
    const [ammCalcData, setAmmCalcData] = React.useState<AmmInData<C> | undefined>();
    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
    const [ammJoinData, setAmmJoinData] = React.useState<AmmData<IBData<C>, C>>({
        coinA: { belong: undefined } as unknown as IBData<C>,
        coinB: { belong: undefined } as unknown as IBData<C>,
        slippage: 0.5
    } as AmmData<IBData<C>, C>);

    const [ammExitData, setAmmExitData] = React.useState({
        coinA: { belong: undefined } as unknown as IBData<C>,
        coinB: { belong: undefined } as unknown as IBData<C>,
        slippage: 0.5
    } as AmmData<IBData<C>, C>);

    const [ammDepositBtnI18nKey, setAmmDepositBtnI18nKey] = React.useState<string | undefined>(undefined);
    const [ammWithdrawBtnI18nKey, setAmmWithdrawBtnI18nKey] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        if(account.readyState === AccountStatus.ACTIVATED){
            sendSocketTopic({[ WsTopicType.account ]: true});
        }else{
            socketEnd()
        }
        return ()=>{
            socketEnd()
        }
    }, [account.readyState]);
    React.useEffect(() => {
        if(refreshRef.current && pair ) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click();
        }

    }, []);

    const initAmmData = React.useCallback(async (pair: any, walletMap: any) => {
        myLog('initAmmData:', account.accAddress, walletMap, pair)
        myLog('refreshRef',refreshRef.current);

        const _ammCalcData = ammPairInit({
                pair,
                ammType,
                _ammCalcData: {},
                tokenMap,
                coinMap,
                walletMap,
                ammMap,
                tickerData: snapShotData?.tickerData,
                ammPoolsBalance: snapShotData?.ammPoolsBalance
        })
        
        myLog('_ammCalcData:', _ammCalcData)

        setAmmCalcData({ ...ammCalcData, ..._ammCalcData });
        if (_ammCalcData.myCoinA) {

            const baseT = tokenMap?.[_ammCalcData.myCoinA.belong]

            const quoteT = tokenMap?.[_ammCalcData.myCoinB.belong]

            setBaseToken(baseT)
            setQuoteToken(quoteT)

            setBaseMinAmt(baseT ? sdk.toBig(baseT.orderAmounts.minimum).div('1e' + baseT.decimals).toNumber() : undefined)
            setQuoteMinAmt(quoteT ? sdk.toBig(quoteT.orderAmounts.minimum).div('1e' + quoteT.decimals).toNumber() : undefined)

            setAmmJoinData({
                coinA: { ..._ammCalcData.myCoinA, tradeValue: undefined },
                coinB: { ..._ammCalcData.myCoinB, tradeValue: undefined },
                slippage: 0.5
            })
            setAmmExitData({
                coinA: { ..._ammCalcData.lpCoinA, tradeValue: undefined },
                coinB: { ..._ammCalcData.lpCoinB, tradeValue: undefined },
                slippage: 0.5
            })
        }
    }, [snapShotData, coinMap, tokenMap, ammCalcData, ammMap, ammType, setAmmCalcData, setAmmJoinData, setAmmExitData])

    const [ammPoolSnapshot, setAmmPoolSnapShot] = useState<AmmPoolSnapshot>()

    const updateAmmPoolSnapshot = React.useCallback(async() => {

        if (!pair.coinAInfo?.simpleName || !pair.coinBInfo?.simpleName || !LoopringAPI.ammpoolAPI) {
            setToastOpen({ content: t('labelAmmJoinFailed'), type: 'error' })
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
        
    }, [pair, ammMap, setAmmPoolSnapShot])

    // set fees

    const [joinFees, setJoinFees] = useState<LoopringMap<OffchainFeeInfo>>()
    const [exitFees, setExitFees] = useState<LoopringMap<OffchainFeeInfo>>()
    const { account: { accountId, apiKey } } = useAccount()

    const times = 5

    const addBtnLabelActive = React.useCallback((): string | undefined => {
        //TODO:
        const validAmt1 = ammJoinData?.coinA?.tradeValue ? ammJoinData?.coinA?.tradeValue > times * baseMinAmt : false
        const validAmt2 = ammJoinData?.coinB?.tradeValue ? ammJoinData?.coinB?.tradeValue > times * quoteMinAmt : false

        myLog('validAmt1:', validAmt1, baseMinAmt, ' tradeValue', ammJoinData?.coinA?.tradeValue)
        myLog('validAmt2:', validAmt2, quoteMinAmt, ' tradeValue', ammJoinData?.coinB?.tradeValue)

        if (isJoinLoading) {
            setAmmDepositBtnI18nKey(TradeBtnStatus.LOADING)
            return undefined
        } else {
            myLog('ammJoinData:', ammJoinData)
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (validAmt1 || validAmt2) {
                    setAddBtnStatus(TradeBtnStatus.AVAILABLE)
                    return undefined
                } else if (ammJoinData === undefined
                    || ammJoinData?.coinA.tradeValue === undefined
                    || ammJoinData?.coinB.tradeValue === undefined
                    || ammJoinData?.coinA.tradeValue === 0
                    || ammJoinData?.coinB.tradeValue === 0) {
                    setAddBtnStatus(TradeBtnStatus.DISABLED)
                    return 'labelEnterAmount';
                }  else {
                    const quote = ammJoinData?.coinA.belong;
                    const minOrderSize = 0 + ' ' + ammJoinData?.coinA.belong;
                    setAddBtnStatus(TradeBtnStatus.DISABLED)
                    return `labelLimitMin, ${minOrderSize}`
                }

            } else {
                setAddBtnStatus(TradeBtnStatus.AVAILABLE)
            }

        }
    }, [
        account.readyState, baseToken, quoteToken, baseMinAmt, quoteMinAmt, ammJoinData, isJoinLoading, setAddBtnStatus])
        
    const removeBtnLabelActive = React.useCallback((): string | undefined => {
        //TODO:
        // const validAmt = (output?.amountBOut && quoteMinAmt
        //     && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false;

        const validAmt1 = ammExitData?.coinA?.tradeValue ? ammExitData?.coinA?.tradeValue > times * baseMinAmt : false
        const validAmt2 = ammExitData?.coinB?.tradeValue ? ammExitData?.coinB?.tradeValue > times * quoteMinAmt : false

        if (isExitLoading) {
            setAmmDepositBtnI18nKey(TradeBtnStatus.LOADING)
            return undefined
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (true) {
                    setRemoveBtnStatus(TradeBtnStatus.AVAILABLE)
                    return undefined
                } else if (ammExitData === undefined
                    || ammExitData?.coinA.tradeValue === undefined
                    || ammExitData?.coinB.tradeValue === undefined
                    || ammExitData?.coinA.tradeValue === 0
                    || ammExitData?.coinB.tradeValue === 0) {
                    setRemoveBtnStatus(TradeBtnStatus.DISABLED)
                    return 'labelEnterAmount';
                } else {
                    const quote = ammExitData?.coinA.belong;
                    const minOrderSize = 0 + ' ' + ammExitData?.coinA.belong;
                    setRemoveBtnStatus(TradeBtnStatus.DISABLED)
                    return `labelLimitMin, ${minOrderSize}`

                }

            } else {
                setRemoveBtnStatus(TradeBtnStatus.AVAILABLE)
            }

        }
    }, [account.readyState, , baseToken, quoteToken, ammExitData, isExitLoading, setRemoveBtnStatus])

    const _removeBtnLabel = Object.assign(deepClone(btnLabel), {
        [ fnType.ACTIVATED ]: [removeBtnLabelActive]
    })

    const _addBtnLabel = Object.assign(deepClone(btnLabel), {
        [ fnType.ACTIVATED ]: [addBtnLabelActive]
    });

    const calculateCallback = React.useCallback(async ()=>{
        if (accountStatus === SagaStatus.UNSET) {

            setAddBtnStatus(TradeBtnStatus.AVAILABLE)
            setAmmDepositBtnI18nKey(accountStaticCallBack(_addBtnLabel))
            setRemoveBtnStatus(TradeBtnStatus.AVAILABLE)
            setAmmWithdrawBtnI18nKey(accountStaticCallBack(_removeBtnLabel))

            if (!LoopringAPI.userAPI || !pair.coinBInfo?.simpleName
                || account.readyState !== AccountStatus.ACTIVATED
                || !ammCalcData || !tokenMap) {
                return
            }
            const feeToken: TokenInfo = tokenMap[pair.coinBInfo.simpleName]

            const requestJoin: GetOffchainFeeAmtRequest = {
                accountId,
                requestType: OffchainFeeReqType.AMM_JOIN,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }

            const { fees: feesJoin } = await LoopringAPI.userAPI.getOffchainFeeAmt(requestJoin, apiKey)
            setJoinFees(feesJoin)

            const feeJoin = sdk.toBig(feesJoin[pair.coinBInfo.simpleName]?.fee as string).div('1e' + feeToken.decimals).toString()
                + ' ' + pair.coinBInfo.simpleName

            const requestExit: GetOffchainFeeAmtRequest = {
                accountId: account.accountId,
                requestType: OffchainFeeReqType.AMM_EXIT,
                tokenSymbol: pair.coinBInfo.simpleName as string,
            }
            const { fees: feesExit } = await LoopringAPI.userAPI.getOffchainFeeAmt(requestExit, apiKey)

            setExitFees(feesExit)

            const feeExit = sdk.toBig(feesExit[pair.coinBInfo.simpleName].fee as string).div('1e' + feeToken.decimals).toString()
                + ' ' + pair.coinBInfo.simpleName

            myLog('-> feeJoin:', feeJoin, ' feeExit:', feeExit)

            setAmmCalcData({ ...ammCalcData, feeJoin, feeExit })
        }

    },[
        setJoinFees, setExitFees, setAmmCalcData, setAmmDepositBtnI18nKey, setAmmWithdrawBtnI18nKey,
        accountStatus, account.readyState, accountId, apiKey,
        pair.coinBInfo?.simpleName, tokenMap, ammCalcData
    ])
    
    React.useEffect(() => {
        calculateCallback()
    }, [accountStatus, pair, ammJoinData])

    // join

    const [joinRequest, setJoinRequest] = useState<{ ammInfo: any, request: JoinAmmPoolRequest }>()
    const handleJoinInDebounce = React.useCallback(_.debounce(async (data, type, joinFees, ammPoolSnapshot,tokenMap,account) => {

        if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !joinFees || !account?.accAddress) {
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

        myLog('handleJoinInDebounce', data, type);

        const marketInfo: MarketInfo = marketMap[market]

        const ammInfo: any = ammMap[amm as string]

        const coinA = tokenMap[data.coinA.belong as string]
        const coinB = tokenMap[data.coinB.belong as string]

        const coinA_TV = ammPoolSnapshot.pooled[0]
        const coinB_TV = ammPoolSnapshot.pooled[1]

        const covertVal = data.coinA.tradeValue ? sdk.toBig(data.coinA.tradeValue)
            .times('1e' + isAtoB ? coinA.decimals : coinB.decimals).toFixed(0, 0) : '0'
        const { output, ratio } = sdk.ammPoolCalc(covertVal, isAtoB, coinA_TV, coinB_TV)
        const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : 0;
        const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : 0;
        const rawVal = isAtoB ? rawA : rawB;

        const { request } = makeJoinAmmPoolRequest(rawVal,
            isAtoB, slippageReal, account.accAddress, joinFees as LoopringMap<OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.joinTokens.pooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.joinTokens.pooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        console.log('coinA:', data.coinA)
        console.log('coinB:', data.coinB)

        setAmmJoinData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage,
        })

        setJoinRequest({
            ammInfo,
            request
        })

    }, globalSetup.wait), [])

    const handleJoinAmmPoolEvent =  (data: AmmData<IBData<any>>, type: 'coinA' | 'coinB') => {
        handleJoinInDebounce(data, type, joinFees, ammPoolSnapshot,tokenMap,account)
    };

    const addToAmmCalculator = React.useCallback(async function (props
    ) {

        setJoinLoading(true)
        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !joinRequest || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', joinRequest)

            setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmFailed') })
            setJoinLoading(false)
            return
        }

        const { ammInfo, request } = joinRequest

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        try {

            const request2: GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: request.joinTokens.pooled[0].tokenId as number
            }
            const storageId0 = await LoopringAPI.userAPI.getNextStorageId(request2, account.apiKey)

            const request_1: GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: request.joinTokens.pooled[1].tokenId as number
            }
            const storageId1 = await LoopringAPI.userAPI.getNextStorageId(request_1, account.apiKey)

            request.storageIds = [storageId0.offchainId, storageId1.offchainId]
            setAmmJoinData({
                ...ammJoinData, ...{
                    coinA: { ...ammJoinData.coinA, tradeValue: 0 },
                    coinB: { ...ammJoinData.coinB, tradeValue: 0 },
                }
            })
            const response = await LoopringAPI.ammpoolAPI.joinAmmPool(request, patch, account.apiKey)

            myLog('join ammpool response:', response)

            if ((response.joinAmmPoolResult as any)?.resultInfo) {
                setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
                setJoinLoading(false)
            } else {
                setToastOpen({ open: true, type: 'success', content: t('labelJoinAmmSuccess') })
                walletLayer2Service.sendUserUpdate()
            }

        } catch (reason) {
            dumpError400(reason)
            setJoinLoading(false)
            setToastOpen({ open: true, type: 'error', content: t('labelJoinAmmFailed') })
        } finally {
        }
        if (props.__cache__) {
            makeCache(props.__cache__)
        }
    }, [joinRequest, ammJoinData, account, t])

    const onAmmDepositClickMap = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [addToAmmCalculator]
    })
    const onAmmAddClick = React.useCallback((props: AmmData<IBData<any>>) => {
        accountStaticCallBack(onAmmDepositClickMap, [props])
    }, [onAmmDepositClickMap]);

    // exit
    const [exitRequest, setExitRequest] = useState<{ rawVal: '', ammInfo: any, request: ExitAmmPoolRequest }>()

    const handleExitInDebounce = React.useCallback(_.debounce(async (data, type, exitFees, ammPoolSnapshot,tokenMap,account) => {

        const isAtoB = type === 'coinA'

        if (!tokenMap || !data.coinA.belong || !data.coinB.belong
            || !ammPoolSnapshot || !exitFees || !account?.accAddress
            || (isAtoB && data.coinA.tradeValue === undefined) 
            || (!isAtoB && data.coinB.tradeValue === undefined)) {
            return
        }

        myLog('handleExitInDebounce', data, type);

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

        const coinA_TV = ammPoolSnapshot.pooled[0]
        const coinB_TV = ammPoolSnapshot.pooled[1]

        const rawVal = isAtoB ? data.coinA.tradeValue : data.coinB.tradeValue

        const rawDecimal = isAtoB ? coinA.decimals : coinB.decimals

        const covertVal = sdk.toBig(rawVal).times('1e' + rawDecimal).toFixed(0, 0)
        const { output, ratio } = sdk.ammPoolCalc(covertVal, isAtoB, coinA_TV, coinB_TV)

        const { request } = makeExitAmmPoolRequest(rawVal.toString(), isAtoB, slippageReal, account.accAddress, exitFees as LoopringMap<OffchainFeeInfo>,
            ammMap[amm], ammPoolSnapshot, tokenMap as any, idIndex as IdMap, 0)

        if (isAtoB) {
            data.coinB.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[1].volume)
                .div('1e' + coinB.decimals).toFixed(marketInfo.precisionForPrice))
        } else {
            data.coinA.tradeValue = parseFloat(toBig(request.exitTokens.unPooled[0].volume)
                .div('1e' + coinA.decimals).toFixed(marketInfo.precisionForPrice))
        }

        setAmmExitData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage,
        })

        setExitRequest({
            rawVal,
            ammInfo,
            request,
        })
        // }

    }, globalSetup.wait), [])

    const handleExitAmmPoolEvent = (data: AmmData<IBData<any>>, type: 'coinA' | 'coinB') => {
        handleExitInDebounce(data, type, exitFees, ammPoolSnapshot,tokenMap,account)
    };



    const removeAmmCalculator = React.useCallback(async function (props
    ) {
        setExitLoading(true);
        
        myLog('removeAmmCalculator props:', props)

        // const { exitRequest } = props

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !exitRequest || !account?.eddsaKey?.sk) {
            myLog(' onExit ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'exitRequest:', exitRequest)

            setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
            setExitLoading(false);
            return
        }

        // const acc: Lv2Account = store.getState().account

        const { ammInfo, request } = exitRequest

        const patch: AmmPoolRequestPatch = {
            chainId: store.getState().system.chainId as ChainId,
            ammName: ammInfo.__rawConfig__.name,
            poolAddress: ammInfo.address,
            eddsaKey: account.eddsaKey.sk
        }

        const burnedReq: GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: request.exitTokens.burned.tokenId as number
        }
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(burnedReq, account.apiKey)

        request.storageId = storageId0.offchainId

        try {

            myLog('exit req:', request)
            setAmmExitData({
                ...ammExitData, ...{
                    coinA: { ...ammExitData.coinA, tradeValue: 0 },
                    coinB: { ...ammExitData.coinB, tradeValue: 0 },
                }
            })
            const response = await LoopringAPI.ammpoolAPI.exitAmmPool(request, patch, account.apiKey)

            myLog('exit ammpool response:', response)

            if ((response.exitAmmPoolResult as any)?.resultInfo) {
                setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
            } else {
                setToastOpen({ open: true, type: 'success', content: t('labelExitAmmSuccess') })
                walletLayer2Service.sendUserUpdate()
            }

        } catch (reason) {
            dumpError400(reason)
            setExitLoading(false)
            setToastOpen({ open: true, type: 'error', content: t('labelExitAmmFailed') })
        }

    }, [exitRequest, ammExitData, account, t])

    const removeAmmClickMap = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [removeAmmCalculator]
    })

    const onAmmRemoveClick = React.useCallback((props: AmmData<IBData<any>>) => {

        myLog('onAmmRemoveClick, exitRequest:', exitRequest, ' ammExitData:', ammExitData)
        accountStaticCallBack(removeAmmClickMap, [props])
    }, [exitRequest, ammExitData, removeAmmClickMap]);

    // useCustomDCEffect(() => {
    //     if (walletLayer2Status !== SagaStatus.UNSET || !pair || !snapShotData) {
    //         return
    //     }
    //
    //     const { walletMap } = makeWalletLayer2()
    //     initAmmData(pair, walletMap)
    //
    //     myLog('init snapshot:', snapShotData.ammPoolsBalance)
    //
    //     setAmmPoolSnapShot(snapShotData.ammPoolsBalance)
    //
    // }, [walletLayer2Status, pair, snapShotData, account?.accAddress,]);
    const  walletLayer2Callback= React.useCallback(()=>{
       
        if(pair && snapShotData){
            const { walletMap } = makeWalletLayer2()
            initAmmData(pair, walletMap)
            myLog('init snapshot:', snapShotData.ammPoolsBalance)
            setAmmPoolSnapShot(snapShotData.ammPoolsBalance)
            setExitLoading(false)
            setJoinLoading(false)
        }

    },[ pair, snapShotData])

    useWalletHook({walletLayer2Callback})
    React.useEffect(()=>{
        walletLayer2Callback()
        // if(walletLayer2Status === SagaStatus.UNSET){
        //
        // }
    },[pair, snapShotData])
    return {
        onRefreshData: updateAmmPoolSnapshot,
        toastOpen,
        closeToast,
        refreshRef,
        ammCalcData,
        ammJoinData,
        ammExitData,
        isJoinLoading,
        isExitLoading,
        handleJoinAmmPoolEvent,
        handleExitAmmPoolEvent,
        addBtnStatus,
        removeBtnStatus,
        onAmmRemoveClick,
        onAmmAddClick,
        ammDepositBtnI18nKey,
        ammWithdrawBtnI18nKey,
    }
}