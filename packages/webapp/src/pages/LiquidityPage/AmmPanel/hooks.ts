import React, { useState } from "react";
import {
    AccountStatus,
    AmmData,
    AmmInData,
    CoinInfo,
    fnType,
    globalSetup,
    IBData,
    SagaStatus,
} from '@loopring-web/common-resources';
import { AmmPanelType } from '@loopring-web/component-lib';
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
    TokenInfo
} from 'loopring-sdk';
import { useCustomDCEffect } from '../../../hooks/common/useCustomDCEffect';
import { useAccount } from '../../../stores/account/hook';
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { debounce } from "lodash";

import { deepClone } from '../../../utils/obj_tools';
import { useWalletLayer2 } from "stores/walletLayer2";
import { myLog } from "utils/log_tools";
import { REFRESH_RATE_SLOW } from "defs/common_defs";
import { useTranslation } from "react-i18next";

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

    const [ammToastOpen, setAmmToastOpen] = useState<boolean>(false)
    const [ammAlertText, setAmmAlertText] = useState<string>()
    const { delayAndUpdateWalletLayer2 } = useWalletLayer2();
    const { t } = useTranslation('common')
    const { coinMap, tokenMap } = useTokenMap();
    const { ammMap } = useAmmMap();
    const { account, status: accountStatus } = useAccount();
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

    const initAmmData = React.useCallback(async (pair: any, walletMap: any) => {
        myLog('initAmmData:', account.accAddress, walletMap, pair)

        let _ammCalcData = ammPairInit(
            {
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

        setAmmCalcData({ ...ammCalcData, ..._ammCalcData });
        if (_ammCalcData.myCoinA) {
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
    const updateAmmPoolSnapshot = React.useCallback(async () => {

        if (!pair.coinAInfo?.simpleName || !pair.coinBInfo?.simpleName || !LoopringAPI.ammpoolAPI) {
            setAmmAlertText(t('labelAmmJoinFailed'))
            return
        }

        const { marketArray, marketMap, } = store.getState().tokenMap

        const { ammMap } = store.getState().amm.ammMap

        const { market, amm } = getExistedMarket(marketArray, pair.coinAInfo.simpleName as string,
            pair.coinBInfo.simpleName as string)

        if (!market || !amm || !marketMap) {
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
    }, [pair, ammMap])

    React.useEffect(() => {
        if (nodeTimer.current !== -1) {
            clearInterval(nodeTimer.current as NodeJS.Timeout);
        }
        nodeTimer.current = setInterval(() => {
            updateAmmPoolSnapshot()
        }, REFRESH_RATE_SLOW)

        updateAmmPoolSnapshot()

        return () => {
            clearInterval(nodeTimer.current as NodeJS.Timeout);
        }

    }, [nodeTimer.current])

    // set fees

    const [joinFees, setJoinFees] = useState<LoopringMap<OffchainFeeInfo>>()
    const [exitFees, setExitfees] = useState<LoopringMap<OffchainFeeInfo>>()
    const { account: { accountId, apiKey } } = useAccount()

    // const { status } = useSelector((state: RootState) => state.account)

    useCustomDCEffect(async () => {
        if (accountStatus === SagaStatus.UNSET) {

            const label: string | undefined = accountStaticCallBack(btnLabel)
            setAmmDepositBtnI18nKey(label)
            setAmmWithdrawBtnI18nKey(label)

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

            setExitfees(feesExit)

            const feeExit = sdk.toBig(feesExit[pair.coinBInfo.simpleName].fee as string).div('1e' + feeToken.decimals).toString()
                + ' ' + pair.coinBInfo.simpleName

            myLog('-> feeJoin:', feeJoin, ' feeExit:', feeExit)

            setAmmCalcData({ ...ammCalcData, feeJoin, feeExit })
        }
    }, [setJoinFees, setExitfees, setAmmCalcData, setAmmDepositBtnI18nKey, setAmmWithdrawBtnI18nKey,
        accountStatus, account.readyState, accountId, apiKey,
        pair.coinBInfo?.simpleName, tokenMap, ammCalcData])

    // join

    const [joinRequest, setJoinRequest] = useState<{ ammInfo: any, request: JoinAmmPoolRequest }>()

    const handlerJoinInDebounce = React.useCallback(debounce(async (data, type, joinFees, ammPoolSnapshot) => {

        if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong || !ammPoolSnapshot || !joinFees || !account?.accAddress) {
            return
        }

        myLog('handlerJoinInDebounce', data, type);

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

        setAmmJoinData({
            coinA: data.coinA as IBData<C>,
            coinB: data.coinB as IBData<C>,
            slippage,
        })

        setJoinRequest({
            ammInfo,
            request
        })

    }, globalSetup.wait), [account?.accAddress, tokenMap])

    const handleJoinAmmPoolEvent = React.useCallback(async (data: AmmData<IBData<any>>, type: 'coinA' | 'coinB') => {
        await handlerJoinInDebounce(data, type, joinFees, ammPoolSnapshot)
    }, [joinFees, handlerJoinInDebounce, ammPoolSnapshot]);

    const addToAmmCalculator = React.useCallback(async function (props
    ) {

        setJoinLoading(true)
        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !joinRequest || !account?.eddsaKey?.sk) {
            myLog(' onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'joinRequest:', joinRequest)

            setAmmAlertText(t('labelJoinAmmFailed'))
            setAmmToastOpen(true)

            setJoinLoading(false)
            return
        }

        //todo add loading

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
                setAmmAlertText(t('labelJoinAmmFailed'))
            } else {
                setAmmAlertText(t('labelJoinAmmSuccess'))
                await delayAndUpdateWalletLayer2()
            }

        } catch (reason) {

            dumpError400(reason)

            setAmmAlertText(t('labelJoinAmmFailed'))
        } finally {
            setAmmToastOpen(true)
            setJoinLoading(false)
        }
        if (props.__cache__) {
            makeCache(props.__cache__)
        }
    }, [joinRequest, ammJoinData, account, delayAndUpdateWalletLayer2, t])

    const onAmmDepositClickMap = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [addToAmmCalculator]
    })
    const onAmmAddClick = React.useCallback((props: AmmData<IBData<any>>) => {
        accountStaticCallBack(onAmmDepositClickMap, [props])
    }, [onAmmDepositClickMap]);

    // exit
    const [exitRequest, setExitRequest] = useState<{ rawVal: '', ammInfo: any, request: ExitAmmPoolRequest }>()

    const handleExitInDebounce = React.useCallback(debounce(async (data, type, exitFees, ammPoolSnapshot) => {

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

    }, globalSetup.wait), [account?.accAddress, tokenMap])

    const handleExitAmmPoolEvent = React.useCallback(async (data: AmmData<IBData<any>>, type: 'coinA' | 'coinB') => {
        await handleExitInDebounce(data, type, exitFees, ammPoolSnapshot)
    }, [exitFees, ammPoolSnapshot, handleExitInDebounce]);


    const [isJoinLoading, setJoinLoading] = useState(false)

    const [isExitLoading, setExitLoading] = useState(false)

    const removeAmmCalculator = React.useCallback(async function (props
    ) {
        setExitLoading(true);
        //TODO: onExit
        myLog('removeAmmCalculator props:', props)

        // const { exitRequest } = props

        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !exitRequest || !account?.eddsaKey?.sk) {
            myLog(' onExit ammpoolAPI:', LoopringAPI.ammpoolAPI,
                'exitRequest:', exitRequest)

            setAmmAlertText(t('labelExitAmmFailed'))
            setAmmToastOpen(true)

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
                setAmmAlertText(t('labelExitAmmFailed'))
            } else {
                setAmmAlertText(t('labelExitAmmSuccess'))
                await delayAndUpdateWalletLayer2()
            }

        } catch (reason) {
            dumpError400(reason)
            setAmmAlertText(t('labelExitAmmFailed'))
        } finally {
            setAmmToastOpen(true)
            setExitLoading(false)
        }

    }, [exitRequest, ammExitData, delayAndUpdateWalletLayer2, account, t])

    const removeAmmClickMap = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [removeAmmCalculator]
    })

    const onAmmRemoveClick = React.useCallback((props: AmmData<IBData<any>>) => {

        myLog('onAmmRemoveClick, exitRequest:', exitRequest, ' ammExitData:', ammExitData)
        accountStaticCallBack(removeAmmClickMap, [props])
    }, [exitRequest, ammExitData, removeAmmClickMap]);

    const { status: walletLayer2Status } = useWalletLayer2();

    useCustomDCEffect(() => {
        if (walletLayer2Status !== SagaStatus.UNSET || !pair || !snapShotData) {
            return
        }

        const { walletMap } = makeWalletLayer2()
        initAmmData(pair, walletMap)
    }, [walletLayer2Status, pair, snapShotData, account?.accAddress,]);

    return {
        ammAlertText,
        ammToastOpen,
        setAmmToastOpen,

        ammCalcData,
        ammJoinData,
        ammExitData,
        isJoinLoading,
        isExitLoading,
        handleJoinAmmPoolEvent,
        handleExitAmmPoolEvent,
        onAmmRemoveClick,
        onAmmAddClick,
        ammDepositBtnI18nKey,
        ammWithdrawBtnI18nKey,
    }
}