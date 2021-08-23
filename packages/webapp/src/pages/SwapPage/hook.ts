import {
    AccountStatus,
    CoinMap,
    fnType,
    IBData,
    SagaStatus,
    TradeCalcData,
    TradeFloat, WalletMap,
} from '@loopring-web/common-resources';
import React from 'react';
import { LoopringAPI } from 'api_wrapper';
import { useTokenMap } from 'stores/token';
import * as sdk from 'loopring-sdk';
import { sleep } from 'loopring-sdk';

import { useAmmMap } from 'stores/Amm/AmmMap';
import { useWalletLayer2 } from 'stores/walletLayer2';
import {
    RawDataTradeItem,
    SwapData,
    SwapTradeData,
    SwapType,
    TradeBtnStatus,
    useSettings
} from '@loopring-web/component-lib';
import { useAccount } from 'stores/account/hook';
import {
    accountStaticCallBack,
    btnClickMap,
    btnLabel,
    makeCache,
    makeMarketArray,
    makeTickView,
    makeWalletLayer2,
    pairDetailBlock,
    pairDetailDone,
} from 'hooks/help';
import store from 'stores';
import { deepClone } from 'utils/obj_tools';
import { myError, myLog } from 'utils/log_tools';
import { useTranslation } from 'react-i18next';
import { usePairMatch } from 'hooks/usePairMatch';
import { useWalletHook } from 'services/wallet/useWalletHook';
import { useSocket } from 'stores/socket';
import { walletService } from 'services/wallet/walletService';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS, REFRESH_RATE } from 'defs/common_defs';

import { VolToNumberWithPrecision } from '../../utils/formatter_tool';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';

const useSwapSocket = () => {
    const {sendSocketTopic, socketEnd} = useSocket();
    const {account} = useAccount()
    React.useEffect(() => {
        if (account.readyState === AccountStatus.ACTIVATED) {
            sendSocketTopic({[ sdk.WsTopicType.account ]: true});
        } else {
            socketEnd()
        }
        return () => {
            socketEnd()
        }
    }, [account.readyState]);
}
export const useSwapPage = <C extends { [ key: string ]: any }>() => {
    useSwapSocket()
    /** get store value **/
    const [debugInfo, setDebugInfo] = React.useState()

    const {account, status: accountStatus} = useAccount()
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap, idIndex} = useTokenMap()
    const {slippage} = useSettings()
    const {walletLayer2} = useWalletLayer2();
    const {ammMap} = useAmmMap()
    const {status: walletLayer2Status} = useWalletLayer2();


    /*** api prepare ***/
    const {t} = useTranslation('common')
    const {pair, setPair, market, setMarket, } = usePairMatch('/trading/lite');
    const [swapBtnI18nKey, setSwapBtnI18nKey] = React.useState<string | undefined>(undefined)
    const [swapBtnStatus, setSwapBtnStatus] = React.useState(TradeBtnStatus.AVAILABLE)
    const [isSwapLoading, setIsSwapLoading] = React.useState(false)
    const [quoteMinAmt, setQuoteMinAmt] = React.useState<string>()
    const [swapToastOpen, setSwapToastOpen] = React.useState<{ flag: boolean, type: any, label: string } | undefined>(undefined)
    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<Partial<TradeCalcData<C>>>({
        coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
            return {...prev, [ item ]: coinMap?coinMap[ item ]:{}}
        }, {} as CoinMap<C>)
    });
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    const [tickMap, setTickMap] = React.useState<sdk.LoopringMap<sdk.TickerData>|undefined>(undefined)
    const [ammPoolSnapshot, setAmmPoolSnapshot] = React.useState<sdk.AmmPoolSnapshot | undefined>(undefined);

    const [output, setOutput] = React.useState<any>()

    const [takerRate, setTakerRate] = React.useState<string>('0')

    const [feeBips, setFeeBips] = React.useState<string>('0')

    const [depth, setDepth] = React.useState<sdk.DepthData>()

    const [amountMap, setAmountMap] = React.useState<any>()

    //table myTrade
    const myTradeTableCallback = React.useCallback(() => {
        if (market && account.accountId && account.apiKey && LoopringAPI.userAPI) {
            LoopringAPI.userAPI.getUserTrades({
                accountId: account.accountId,
                market: market,
            }, account.apiKey).then((response: {
                totalNum: any;
                userTrades: sdk.UserTrade[];
                raw_data: any;
            }) => {
                let _myTradeArray = makeMarketArray(market, response.userTrades) as RawDataTradeItem[]
                setMyTradeArray(_myTradeArray ? _myTradeArray : [])
            })
        } else {
            setMyTradeArray([])
        }

    }, [market, account.accountId, account.apiKey])

    React.useEffect(() => {

        if (!!pair?.coinBInfo?.simpleName) {
            resetSwap(undefined, undefined)
        }

    }, [pair?.coinBInfo?.simpleName])

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET && walletLayer2Status === SagaStatus.UNSET) {
            myTradeTableCallback();
        }
    }, [account.readyState, market, accountStatus, walletLayer2Status]);

    //table marketTrade
    const marketTradeTableCallback = React.useCallback(() => {
        if (LoopringAPI.exchangeAPI) {
            LoopringAPI.exchangeAPI.getMarketTrades({market}).then(({marketTrades}: {
                totalNum: any;
                marketTrades: sdk.MarketTradeInfo[];
                raw_data: any;
            }) => {
                const _tradeArray = makeMarketArray(market, marketTrades)
                setTradeArray(_tradeArray as RawDataTradeItem[])
            })

        } else {
            setTradeArray([])
        }

    }, [market, setTradeArray,]);

    const updateDepth = React.useCallback(async () => {
        if (market && LoopringAPI.exchangeAPI) {
            myLog('swap page updateDepth', market)
            const {depth} = await LoopringAPI.exchangeAPI.getMixDepth({market})
            setDepth(depth)
        }
    }, [market, setDepth])

    React.useEffect(() => {
        if (market) {
            marketTradeTableCallback();
            updateDepth();
        }
    }, [market]);

    //Btn related function
    const btnLabelAccountActive = React.useCallback((): string | undefined => {

        const validAmt = (output?.amountBOut && quoteMinAmt
            && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false;
        if (isSwapLoading) {
            setSwapBtnStatus(TradeBtnStatus.LOADING)
            return undefined
        } else {
            if (validAmt || quoteMinAmt === undefined) {
                setSwapBtnStatus(TradeBtnStatus.AVAILABLE)
                return undefined

            } else if (tradeData === undefined || tradeData?.sell.tradeValue === undefined || tradeData?.buy.tradeValue === undefined) {
                setSwapBtnStatus(TradeBtnStatus.DISABLED)
                return 'labelEnterAmount';
            } else {
                const quote = tradeData?.buy.belong;
                const minOrderSize = VolToNumberWithPrecision(quoteMinAmt, quote) + ' ' + tradeData?.buy.belong;
                setSwapBtnStatus(TradeBtnStatus.DISABLED)
                return `labelLimitMin, ${minOrderSize}`

            }

        }
    }, [quoteMinAmt, tradeData, isSwapLoading, setSwapBtnStatus])

    const _btnLabel = Object.assign(deepClone(btnLabel), {
        [ fnType.ACTIVATED ]: [
            btnLabelAccountActive
        ]
    });

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET) {
            setSwapBtnI18nKey(accountStaticCallBack(_btnLabel));
        }
    }, [account.readyState, accountStatus, isSwapLoading, tradeData?.sell.tradeValue])

    const swapCalculatorCallback = React.useCallback(async ({sell, buy, slippage, ...rest}: any) => {

        const {exchangeInfo} = store.getState().system
        setIsSwapLoading(true);
        if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !output
            || account.readyState !== AccountStatus.ACTIVATED) {

            setSwapToastOpen({flag: true, type: 'error', label: t('labelSwapFailed')})
            setIsSwapLoading(false)

            return
        }

        const baseToken = tokenMap[ sell.belong as string ]
        const quoteToken = tokenMap[ buy.belong as string ]

        const request: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: baseToken.tokenId
        }

        const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)

        try {

            const tradeChannel = output.exceedDepth ? sdk.TradeChannel.AMM_POOL : sdk.TradeChannel.MIXED

            const request: sdk.SubmitOrderRequestV3 = {
                exchange: exchangeInfo.exchangeAddress,
                accountId: account.accountId,
                storageId: storageId.orderId,
                sellToken: {
                    tokenId: baseToken.tokenId,
                    volume: output.amountS
                },
                buyToken: {
                    tokenId: quoteToken.tokenId,
                    volume: output.amountBOutSlip.minReceived
                },
                allOrNone: false,
                validUntil: getTimestampDaysLater(DAYS),
                maxFeeBips: parseInt(feeBips),
                fillAmountBOrS: false, // amm only false
                orderType: sdk.OrderType.TakerOnly,
                tradeChannel,
                eddsaSignature: '',
            }

            myLog(request)

            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

            myLog(response)

            if (!response?.hash) {
                setSwapToastOpen({flag: true, type: 'error', label: t('labelSwapFailed')})
                myError(response?.errInfo)
            } else {
                setSwapToastOpen({flag: true, type: 'success', label: t('labelSwapSuccess')})
                walletService.sendUserUpdate()
                setTradeData({
                    ...tradeData,
                    ...{
                        sell: {...tradeData?.sell, tradeValue: 0},
                        buy: {...tradeData?.buy, tradeValue: 0},
                    }
                } as SwapTradeData<IBData<C>>)
            }
        } catch (reason) {
            sdk.dumpError400(reason)

            setSwapToastOpen({flag: true, type: 'error', label: t('labelSwapFailed')})

        }

        setOutput(undefined)

        await sleep(REFRESH_RATE)

        setIsSwapLoading(false)

        if (rest.__cache__) {
            makeCache(rest.__cache__)
        }

    }, [tradeData, output, tokenMap])
    const swapBtnClickArray = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]: [swapCalculatorCallback]
    })
    const onSwapClick = React.useCallback(({sell, buy, slippage, ...rest}: SwapTradeData<IBData<C>>) => {
        accountStaticCallBack(swapBtnClickArray, [{sell, buy, slippage, ...rest}])
    }, [swapBtnClickArray])
    //Btn related end

    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET) {
            walletLayer2Callback()
        }
    }, [amountMap, account.readyState, accountStatus, market, tradeData?.sell.belong, tradeData?.buy.belong])

    const updateAmtMap = React.useCallback(async () => {

        if (LoopringAPI.userAPI && market && pair?.coinAInfo?.simpleName
            && pair?.coinBInfo?.simpleName && ammMap && accountStatus === SagaStatus.UNSET) {
            const {amm,} = sdk.getExistedMarket(marketArray, pair?.coinAInfo?.simpleName, pair?.coinBInfo?.simpleName)

            const realMarket = amm && ammMap[ amm ] ? amm : market

            const req: sdk.GetMinimumTokenAmtRequest = {
                accountId: account.accountId,
                market: realMarket,
            }

            const {amountMap} = await LoopringAPI.userAPI.getMinimumTokenAmt(req, account.apiKey)

            setAmountMap(amountMap)

            myLog('amountMap:', amountMap)
        }

    }, [setAmountMap, market, marketArray, ammMap, accountStatus, account.apiKey, pair?.coinAInfo?.simpleName, pair?.coinBInfo?.simpleName,])

    useCustomDCEffect(() => {

        updateAmtMap()

    }, [market, pair?.coinAInfo?.simpleName, pair?.coinBInfo?.simpleName, accountStatus])

    const walletLayer2Callback = React.useCallback(async () => {
        // const base = tradeData?.sell.belong
        // const quote = tradeData?.buy.belong

        if (marketArray && amountMap && tradeCalcData.coinSell && tradeCalcData.coinBuy && market &&
            LoopringAPI.userAPI && account.readyState === AccountStatus.ACTIVATED
            && ammMap && account?.accountId && account?.apiKey) {
            const {walletMap} = makeWalletLayer2();
            const {amm,} = sdk.getExistedMarket(marketArray, tradeCalcData.coinSell, tradeCalcData.coinBuy)

            const realMarket = amm && ammMap[ amm ] ? amm : market

            const quoteMinAmtInfo = amountMap[ tradeCalcData.coinBuy ]

            if (!quoteMinAmtInfo) {
                return
            }

            myLog(`enter walletLayer2Callback: base:${tradeCalcData.coinSell} quote:${tradeCalcData.coinBuy} `, amountMap)

            const takerRate = quoteMinAmtInfo.userOrderInfo.takerRate
            const feeBips = amm && ammMap[ amm ] ? ammMap[ amm ].__rawConfig__.feeBips : 0
            const totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()

            setTradeData({
                ...tradeData,
                sell: {
                    belong: tradeCalcData.coinSell,
                    balance: walletMap ? walletMap[ tradeCalcData.coinSell as string ]?.count : 0
                },
                buy: {
                    belong: tradeCalcData.coinBuy,
                    balance: walletMap ? walletMap[ tradeCalcData.coinBuy as string ]?.count : 0
                },
            } as SwapTradeData<IBData<C>>)
            myLog('walletLayer2Callback,tradeCalcData',tradeData, tradeCalcData);

            setQuoteMinAmt(quoteMinAmtInfo?.userOrderInfo.minAmount)
            setFeeBips(totalFee)
            myLog(`${realMarket} totalFee: ${totalFee}`)

            setTakerRate(takerRate.toString())
            setTradeCalcData({...tradeCalcData, walletMap, fee: totalFee} as TradeCalcData<C>)
        } else {
            myLog(`setFeeBips('0')`)
            setFeeBips('0')
            setTakerRate('0')

            setTradeCalcData({...tradeCalcData, walletMap: {}, fee: '0'} as TradeCalcData<C>)

            setTradeData({
                ...tradeData,
                sell: {
                    belong: tradeCalcData.coinSell,
                    balance: 0
                },
                buy: {
                    belong: tradeCalcData.coinBuy,
                    balance: 0
                },
            } as SwapTradeData<IBData<C>>)
            myLog('walletLayer2Callback,tradeCalcData',tradeData, tradeCalcData);

        }

    }, [tradeData, amountMap, marketArray, ammMap, account])

    useWalletHook({walletLayer2Callback})

    // myLog('tradeData?.sell.belong:', tradeData?.sell.belong)
    // myLog('tradeData?.buy.belong:', tradeData?.buy.belong)

    //HIGH: effect by wallet state update

    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, swapType: any): Promise<void> => {

        myLog('handleSwapPanelEvent...')

        const {tradeData} = swapData
        resetSwap(swapType, tradeData)

    }

    const apiCallback = React.useCallback( ({ammPoolsBalance,tickMap})=>{
            setAmmPoolSnapshot(ammPoolsBalance)
            setTickMap(tickMap)
    },[])
    React.useEffect(()=>{
        if(ammPoolSnapshot && idIndex
            && idIndex[ammPoolSnapshot.lp.tokenId].replace('LP-','') === market
            && tickMap && market && (
            `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
            `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market) ) {
            refreshAmmPoolSnapshot()
        }
    },[tickMap,ammPoolSnapshot,market,tradeCalcData.coinBuy,tradeCalcData.coinSell])
    const refreshAmmPoolSnapshot =  React.useCallback(()=>{
        console.log('ammPoolSnapshot')
        if(tickMap &&  ammPoolSnapshot && market )  {
            let {stob} = pairDetailDone({
                coinKey:tradeData?`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`:market,
                market,
                ammPoolsBalance:ammPoolSnapshot,
                tickerData: tickMap[ market ] ? tickMap[ market ] : {},
                tokenMap,
                _tradeCalcData: tradeCalcData,
                coinMap,
                marketCoins,
                fee: feeBips,
            })
            let _tradeFloat = makeTickView(tickMap[ market ] ? tickMap[ market ] : {})
            setTradeFloat(_tradeFloat as TradeFloat);
            tradeCalcData.StoB = stob
            tradeCalcData.BtoS = 1/stob
            myLog('ammPoolSnapshot tradeCalcData', tradeCalcData);
            setTradeCalcData(tradeCalcData);
        }


        // if(_tradeData && _tradeData.sell && _tradeData.buy){
        //     _tradeData.sell ={..._tradeData.sell, balance : tradeCalcData.walletMap ? tradeCalcData.walletMap[ coinA ]?.count : 0} ;
        //     _tradeData.buy ={..._tradeData.buy, balance : tradeCalcData.walletMap ? tradeCalcData.walletMap[ coinB ]?.count : 0} ;
        //     myLog('tradeData',tradeData,_tradeData)
        //     setTradeData({...tradeData,..._tradeData});
        // }
    },[ammPoolSnapshot,market,tickMap,tradeCalcData,setTradeCalcData])


    const resetTradeCalcData = React.useCallback((_tradeData, market?, depth?, type?) => {
        if (coinMap && tokenMap && marketMap && marketArray && ammMap) {
            let coinA: string, coinB: string;
            if (market) {
                [, coinA, coinB] = market.match(/([\w,#]+)-([\w,#]+)/i);
            } else {
                coinA = '#null'
                coinB = '#null'
            }

            let whichCoinIndex = [coinA, coinB].findIndex(item => item !== '#null');

            if (whichCoinIndex !== -1 && coinMap[ [coinA, coinB][ whichCoinIndex ] ] === undefined) {
                whichCoinIndex == 0 ? coinA = 'LRC' : coinB = 'LRC';
            }
            if (whichCoinIndex === -1) {
                whichCoinIndex = 0;
                coinA = 'LRC';
            }
            if(type === 'sell' && coinB!=='#null' ){
                if(!tokenMap[coinA].tradePairs.includes(coinB)){
                    coinB =  tokenMap[coinA].tradePairs[0]
                }
            }else if(coinB === '#null' || coinA === '#null'){
                if (!tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs.includes([coinA, coinB][ whichCoinIndex ^ 1 ])) {
                    whichCoinIndex == 0 ? coinB = tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs[ 0 ]
                        : coinA = tokenMap[ [coinA, coinB][ whichCoinIndex ] ].tradePairs[ 0 ];
                }
            }
            let walletMap;
            console.log((tradeCalcData.walletMap === {} || tradeCalcData.walletMap ),  account.readyState === AccountStatus.ACTIVATED
                      ,walletLayer2Status === SagaStatus.UNSET)
            if (account.readyState === AccountStatus.ACTIVATED
                && walletLayer2Status === SagaStatus.UNSET) {
                if( tradeCalcData.walletMap == {})  {
                    debugger
                    tradeCalcData.walletMap = makeWalletLayer2().walletMap as WalletMap<any>;
                }
                walletMap = tradeCalcData.walletMap;
            }
            _tradeData = {
                sell: {
                    belong: coinA,
                    balance: walletMap ? walletMap[ coinA ]?.count : 0
                }, buy: {
                    belong: coinB,
                    balance: walletMap ? walletMap[ coinB ]?.count : 0

                }
            }

            tradeCalcData.coinSell = coinA;
            tradeCalcData.coinBuy = coinB;
            tradeCalcData.sellCoinInfoMap =  tokenMap[ coinB ].tradePairs?.reduce((prev: any, item: string | number) => {
                return {...prev, [ item ]: coinMap[ item ]}
            }, {} as CoinMap<C>)
            tradeCalcData.buyCoinInfoMap = tokenMap[ coinA ].tradePairs?.reduce((prev: any, item: string | number) => {
                return {...prev, [ item ]: coinMap[ item ]}
            }, {} as CoinMap<C>);
            myLog('resetTradeCalcData,tradeCalcData',tradeCalcData);
            setTradeCalcData({...tradeCalcData})
            setTradeData({...tradeData,..._tradeData})
            let {amm: ammKey, market: _market} = sdk.getExistedMarket(marketArray, coinA, coinB);
            setMarket(_market);
            setPair({ coinAInfo: coinMap[coinA], coinBInfo: coinMap[coinB]})


            let apiList = [pairDetailBlock({coinKey: _market, ammKey: ammKey as string, ammMap})];
            Promise.all([...apiList])
                .then(([{ammPoolsBalance, tickMap}]: any[])=>apiCallback({ammPoolsBalance,tickMap}))
                .catch((error) => {
                    myLog(error,'go to LER-ETH');
                    resetTradeCalcData(undefined, market, depth)
                })

        }
        return {
            _tradeData,
            _tradeCalcData:tradeCalcData,
        }

    }, [tradeCalcData, tradeData, coinMap, tokenMap, marketMap, marketArray, ammMap, feeBips])
    const reCalculateDataWhenValueChange = React.useCallback((_tradeData, market?, depth?, type?)=>{
        if(marketArray && tokenMap && marketMap && ammMap && ammPoolSnapshot && takerRate){
            const coinA = _tradeData.sell.belong
            const coinB = _tradeData.buy.belong
            myLog('coinA,coinB', coinA, coinB);
            setTradeData({...tradeData,..._tradeData} as SwapTradeData<IBData<C>>)
            tradeCalcData.fee = feeBips;
            setTradeCalcData(tradeCalcData)
        }


    }, [tradeCalcData, tradeData, coinMap, tokenMap, marketMap, marketArray, ammMap, feeBips])
    const resetSwap = (swapType: SwapType | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined) => {
        switch (swapType) {
            case SwapType.SEll_CLICK:
            case SwapType.BUY_CLICK:
                return
            case SwapType.SELL_SELECTED:
                //type = 'sell'
                myLog(`${_tradeData?.sell.belong}-#null`)
                if(_tradeData?.sell.belong !== tradeData?.sell.belong){
                   resetTradeCalcData(_tradeData, `${_tradeData?.sell?.belong??`#null`}-${_tradeData?.buy?.belong??`#null`}`, depth, 'sell')
                }else{
                   reCalculateDataWhenValueChange(_tradeData, `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`, depth, 'sell')
                }
                // throttleSetValue('sell', _tradeData)
                break
            case SwapType.BUY_SELECTED:
                //type = 'buy'
                myLog(`#null-${_tradeData?.buy.belong}`)
                if(_tradeData?.buy.belong !== tradeData?.buy.belong){
                    resetTradeCalcData(_tradeData, `${_tradeData?.sell?.belong??`#null`}-${_tradeData?.buy?.belong??`#null`}`, depth, 'buy')

                }else{
                    reCalculateDataWhenValueChange(_tradeData, `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`, depth, 'buy')

                }
                break
            case SwapType.EXCHANGE_CLICK:
                let _coin = tradeCalcData.coinSell,map = tradeCalcData.sellCoinInfoMap;
                tradeCalcData.coinSell = tradeCalcData.coinBuy;
                tradeCalcData.coinBuy = _coin;
                tradeCalcData.sellCoinInfoMap =  tradeCalcData.buyCoinInfoMap
                tradeCalcData.buyCoinInfoMap = map
                tradeCalcData.StoB = tradeCalcData.BtoS
                tradeCalcData.BtoS = tradeCalcData.StoB? 1/tradeCalcData.StoB: 0;
                myLog('Exchange,tradeCalcData',tradeCalcData);
                setTradeCalcData({...tradeCalcData})
                break;
            default:
                myLog('resetSwap default')
                resetTradeCalcData(undefined, market, depth)
                break
        }


    }
    // const resetSwap = (swapType: SwapType | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined) => {
    //
    //     let type = undefined
    //     let coinKey = `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`
    //
    //     switch (swapType) {
    //         case SwapType.SEll_CLICK:
    //         case SwapType.BUY_CLICK:
    //             return
    //         case SwapType.SELL_SELECTED:
    //             //type = 'sell'
    //             myLog(`#null-${_tradeData?.sell.belong}`)
    //             resetTradeCalcData(`#null-${_tradeData?.sell.belong}`)
    //             break
    //         case SwapType.BUY_SELECTED:
    //             //type = 'buy'
    //             myLog(`${_tradeData?.buy.belong}-#null`)
    //             resetTradeCalcData(`${_tradeData?.buy.belong}-#null`)
    //             break
    //         case SwapType.EXCHANGE_CLICK:
    //             myLog('Exchange Click')
    //             resetTradeCalcData(`${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`)
    //             break
    //         default:
    //             resetTradeCalcData(market)
    //             break
    //     }
    //     // throttleSetValue(type, _tradeData)
    //     // myLog('*******', tradeCalcData !== undefined, coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
    //     // _tradeData !== undefined, type !== undefined, !tradeData, _tradeData)
    //
    //     if (tradeCalcData
    //         && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
    //         && type
    //         && _tradeData
    //         && (!tradeData || (tradeData[type]?.tradeValue !== _tradeData[type]?.tradeValue))) {
    //         throttleSetValue(type, _tradeData)
    //     } else {
    //
    //         let _tradeFloat: Partial<TradeFloat> = {}
    //         const hasInitialPair = pair?.coinAInfo?.simpleName && pair?.coinBInfo?.simpleName // && pair?.coinAInfo?.simpleName !== pair?.coinBInfo?.simpleName
    //         let _tradeCalcData: Partial<TradeCalcData<C>> = {
    //             coinSell: hasInitialPair ? pair?.coinAInfo?.simpleName : 'LRC',
    //             coinBuy: hasInitialPair ? pair?.coinBInfo?.simpleName : 'ETH'
    //         }
    //         const sellSymbol = _tradeData?.sell.belong as string; //_tradeData?.sell.belong as string
    //         const buySymbol = _tradeData?.buy.belong as string; //_tradeData?.buy.belong as string
    //
    //         let coinKey = `${sellSymbol}-${buySymbol}`
    //
    //         if (sellSymbol && buySymbol) {
    //             _tradeCalcData.coinSell = sellSymbol
    //
    //             if (marketMap && marketMap[coinKey]) {
    //                 _tradeCalcData.coinBuy = buySymbol
    //             } else {
    //                 if (tokenMap && tokenMap[sellSymbol]) {
    //                     // myLog(' tradePairs:', tokenMap[sellSymbol].tradePairs )
    //                     if (tokenMap[sellSymbol].tradePairs.indexOf(buySymbol) >= 0) {
    //                         _tradeCalcData.coinBuy = buySymbol
    //                     } else {
    //                         const newBuy = tokenMap[sellSymbol].tradePairs[0]
    //                         if (newBuy) {
    //                             _tradeCalcData.coinBuy = newBuy
    //                         } else {
    //                             throw Error('no such symbol!')
    //                         }
    //                     }
    //                 } else {
    //                     _tradeCalcData.coinSell='LRC'
    //                     _tradeCalcData.coinBuy='ETH'
    //                 }
    //             }
    //         }
    //
    //         // myLog('_tradeCalcData:', _tradeCalcData)
    //
    //         let {
    //             amm,
    //             market: market2,
    //             baseShow,
    //             quoteShow,
    //         } = sdk.getExistedMarket(marketArray, _tradeCalcData.coinSell as string, _tradeCalcData.coinBuy as string);
    //
    //         if (market2) {
    //
    //             setTradeCalcData({ ...tradeCalcData, fee: feeBips, ..._tradeCalcData } as TradeCalcData<C>);
    //             if (coinMap) {
    //                 setPair({
    //                     coinAInfo: coinMap[baseShow],
    //                     coinBInfo: coinMap[quoteShow],
    //                 })
    //                 setMarket(market2)
    //             }
    //
    //             let apiList = [];
    //             //TODO wallet saga done
    //             if (marketArray && amm && market && ammMap) {
    //                 // let pairPromise =  usePairTitleBlock({market})
    //                 apiList = [
    //                     pairDetailBlock({ coinKey: market, ammKey: amm, ammMap })
    //                 ];
    //                 //HiGH: this need add websocket to update infr ticker ammpoolsbalace
    //                 // @ts-ignore
    //                 Promise.all([...apiList]).then(
    //                     ([ { ammPoolsBalance, tickMap }]: any[]) => {
    //                         setAmmPoolSnapshot(ammPoolsBalance)
    //                         if (tokenMap) {
    //                             let { _tradeCalcData: _td } = pairDetailDone({
    //                                 coinKey: `${_tradeCalcData.coinSell}-${_tradeCalcData.coinBuy}`,
    //                                 market,
    //                                 ammPoolsBalance,
    //                                 tickerData: tickMap[market] ? tickMap[market] : {},
    //                                 tokenMap,
    //                                 _tradeCalcData,
    //                                 coinMap,
    //                                 marketCoins,
    //                                 fee: feeBips,
    //                             })
    //                             _tradeCalcData = _td;
    //                             _tradeFloat = makeTickView(tickMap[market] ? tickMap[market] : {})
    //
    //                             // @ts-ignore
    //                             setTradeCalcData(_tradeCalcData as TradeCalcData<C>);
    //                             // @ts-ignore
    //                             setTradeFloat(_tradeFloat);
    //
    //                             setTradeData({
    //                                 sell: {
    //                                     belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinSell]?.simpleName : undefined,
    //                                     balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinSell]?.count : 0
    //                                 },
    //                                 // @ts-ignore
    //                                 buy: {
    //                                     belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinBuy]?.simpleName : undefined,
    //                                     balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinBuy]?.count : 0
    //                                 },
    //                             } as SwapTradeData<IBData<C>>)
    //                         }
    //                     }).catch((error) => {
    //                         myLog(error)
    //                     })
    //             }
    //
    //         }
    //     }
    //
    // }

    return {
        swapToastOpen,
        setSwapToastOpen,

        tradeCalcData,
        tradeFloat,
        tradeArray,
        myTradeArray,
        tradeData,
        pair,
        marketArray,
        onSwapClick,
        swapBtnI18nKey,
        swapBtnStatus: swapBtnStatus,
        handleSwapPanelEvent,
        updateDepth,

        debugInfo,
    }

}