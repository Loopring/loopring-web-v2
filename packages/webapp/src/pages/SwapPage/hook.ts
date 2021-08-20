import {
    AccountStatus,
    fnType,
    globalSetup,
    IBData,
    SagaStatus,
    TradeCalcData,
    TradeFloat,
    WalletMap
} from '@loopring-web/common-resources';
import React, { useCallback, useEffect, useState } from 'react';
import { LoopringAPI } from 'api_wrapper';
import { useTokenMap } from 'stores/token';
import * as sdk from 'loopring-sdk';
import {
    AmmPoolInfoV3,
    AmmPoolSnapshot,
    DepthData,
    dumpError400,
    getExistedMarket,
    GetMinimumTokenAmtRequest,
    GetNextStorageIdRequest,
    LoopringMap,
    OrderType,
    SubmitOrderRequestV3,
    VALID_UNTIL, WsTopicType
} from 'loopring-sdk';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useWalletLayer2 } from '../../stores/walletLayer2';
import { RawDataTradeItem, SwapData, SwapTradeData, SwapType, TradeBtnStatus } from '@loopring-web/component-lib';
import { useAccount } from '../../stores/account/hook';
import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';
import {
    accountStaticCallBack,
    btnLabel,
    btnClickMap,
    getUserTrades,
    makeCache,
    makeMarketArray,
    makeTickView,
    makeWalletLayer2,
    pairDetailBlock,
    pairDetailDone,
} from '../../hooks/help';
import * as _ from 'lodash'
import store from 'stores';
import { deepClone } from '../../utils/obj_tools';
import { myError, myLog } from 'utils/log_tools';
import { useTranslation } from 'react-i18next';
import { usePairMatch } from 'hooks/usePairMatch';
import { VolToNumberWithPrecision } from '../../utils/formatter_tool';
import { useWalletHook } from '../../services/wallet/useWalletHook';
import { useSocket } from '../../stores/socket';

export const useSwapBtnStatusCheck = (output: any, tradeData: any) => {

    const [baseMinAmt, setBaseMinAmt] = useState<string>()

    const [quoteMinAmt, setQuoteMinAmt] = useState<string>()

    const [btnStatus, setBtnStatus] = useState(TradeBtnStatus.AVAILABLE)

    const [swapBtnI18nKey, setSwapBtnI18nKey] = React.useState<string | undefined>(undefined)

    const [isSwapLoading, setIsSwapLoading] = useState(false)

    const { account } = useAccount()

    useCustomDCEffect(() => {

        const label: string | undefined = accountStaticCallBack(btnLabel)
        setSwapBtnI18nKey(label)

        if (account.readyState !== AccountStatus.ACTIVATED) {
            setBtnStatus(TradeBtnStatus.AVAILABLE)
        } else {

            if (isSwapLoading) {
                setBtnStatus(TradeBtnStatus.LOADING)
            } else {

                const validAmt = (output?.amountBOut && quoteMinAmt
                    && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false
                if (validAmt || quoteMinAmt === undefined ) {
                        setBtnStatus(TradeBtnStatus.AVAILABLE)
                        setSwapBtnI18nKey(undefined)

                }else if(tradeData === undefined || tradeData?.buy.tradeValue === undefined){
                    setBtnStatus(TradeBtnStatus.DISABLED)
                    setSwapBtnI18nKey('labelEnterAmount')
                } else {
                    const minOrderSize = VolToNumberWithPrecision(quoteMinAmt, tradeData?.buy.belong) + ' ' + tradeData?.buy.belong
                    setSwapBtnI18nKey(`labelLimitMin, ${minOrderSize}`)
                    setBtnStatus(TradeBtnStatus.DISABLED)
                }
            }

        }

    }, [isSwapLoading, account.readyState,
        output, quoteMinAmt, tradeData, setSwapBtnI18nKey])

    return {
        btnStatus,
        swapBtnI18nKey,
        quoteMinAmt,
        setBaseMinAmt,
        setQuoteMinAmt,
        setIsSwapLoading,
        setSwapBtnI18nKey,
    }

}

export const useSwapPage = <C extends { [key: string]: any }>() => {
    /*** api prepare ***/
    const { t } = useTranslation('common')
    const {sendSocketTopic,socketEnd} = useSocket();

    const [swapToastOpen, setSwapToastOpen] = useState<boolean>(false)

    const [swapAlertText, setSwapAlertText] = useState<string>()
    const wait = globalSetup.wait
    const { coinMap, tokenMap, marketArray, marketCoins, marketMap, } = useTokenMap()
    const { ammMap } = useAmmMap()

    const { account, status: accountStatus } = useAccount()
    const { delayAndUpdateWalletLayer2, walletLayer2 } = useWalletLayer2();

    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<Partial<TradeCalcData<C>>>({});
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);

    const { pair, setPair, market, setMarket, } = usePairMatch('/trading/lite')
    React.useEffect(() => {
        if(account.readyState === AccountStatus.ACTIVATED){
            sendSocketTopic({[ WsTopicType.account ]: true});
        }else{
            socketEnd()
        }
    }, [account.readyState]);
    useCustomDCEffect(() => {
        if (!market) {
            return
        }
        resetSwap(undefined, undefined);
    }, [market]);

    useCustomDCEffect(() => {

        if (!market || !LoopringAPI.userAPI) {
            return
        }

        if (account.accountId && account.apiKey) {
            LoopringAPI.userAPI.getUserTrades({accountId: account.accountId, market,}, account.apiKey).then((response: {
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
        
    }, [market, account.accountId, account.apiKey]);

    const [ammPoolSnapshot, setAmmPoolSnapshot] = React.useState<AmmPoolSnapshot | undefined>(undefined);

    const [output, setOutput] = useState<any>()

    const [takerRate, setTakerRate] = useState<string>('0')

    const [feeBips, setFeeBips] = useState<string>('0')

    // --- btn status check
    const {
        btnStatus,
        swapBtnI18nKey,
        quoteMinAmt,
        setBaseMinAmt,
        setQuoteMinAmt,
        setIsSwapLoading,
    } = useSwapBtnStatusCheck(output, tradeData)
    // --- end of btn status check.
    React.useEffect(()=>{
        walletLayer2Callback()
    },[walletLayer2,tradeData?.sell.belong, tradeData?.buy.belong, account.apiKey])
    const walletLayer2Callback = React.useCallback(async ()=>{
        const base = tradeData?.sell.belong
        const quote = tradeData?.buy.belong

        if (marketArray && base && quote && market &&
            LoopringAPI.userAPI && account.readyState === AccountStatus.ACTIVATED
            && ammMap && account?.accountId && account?.apiKey) {
            const { walletMap } = makeWalletLayer2();
            const {amm} = getExistedMarket(marketArray, base, quote)
            const req: GetMinimumTokenAmtRequest = {
                accountId: account.accountId,
                market,
            }
            const { amountMap } = await LoopringAPI.userAPI.getMinimumTokenAmt(req, account.apiKey)
            const baseMinAmtInfo = amountMap[base]
            const quoteMinAmtInfo = amountMap[quote]
            const takerRate = quoteMinAmtInfo.userOrderInfo.takerRate
            const feeBips = amm && ammMap[amm]? ammMap[amm].__rawConfig__.feeBips: 0
            const totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()
            setTradeData({
                sell: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinSell]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinSell as string]?.count : 0
                },
                buy: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinBuy]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinBuy as string]?.count : 0
                },
            } as SwapTradeData<IBData<C>>)
            setBaseMinAmt(baseMinAmtInfo?.userOrderInfo.minAmount)
            setQuoteMinAmt(quoteMinAmtInfo?.userOrderInfo.minAmount)
            setFeeBips(totalFee)
            setTakerRate(takerRate.toString())
            setTradeCalcData({ ...tradeCalcData,walletMap, fee: totalFee } as TradeCalcData<C>)
        } else {

            // myLog('set fee to 0')

            setFeeBips('0')
            setTakerRate('0')

            setTradeCalcData({ ...tradeCalcData, walletMap: {}, fee: '0' } as TradeCalcData<C>)
            setTradeData({
                sell: {
                    belong: base,
                    balance: 0
                },
                buy: {
                    belong: quote,
                    balance: 0
                },
            } as SwapTradeData<IBData<C>>)
        }
    },[tradeData?.sell.belong, tradeData?.buy.belong, marketArray, ammMap,
        account.readyState, account.apiKey, account.accountId])
    useWalletHook({walletLayer2Callback})

    // myLog('tradeData?.sell.belong:', tradeData?.sell.belong)
    // myLog('tradeData?.buy.belong:', tradeData?.buy.belong)

    //HIGH: effect by wallet state update

    const swapCalculatorCallback = useCallback(async ({ sell, buy, slippage, ...rest }: any) => {

        const { exchangeInfo } = store.getState().system
        setIsSwapLoading(true);
        if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !output
            || account.readyState !== AccountStatus.ACTIVATED) {

            setSwapAlertText(t('labelSwapFailed'))
            setSwapToastOpen(true)
            setIsSwapLoading(false)

            return
        }

        const baseToken = tokenMap[sell.belong as string]
        const quoteToken = tokenMap[buy.belong as string]

        const request: GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: baseToken.tokenId
        }

        const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)

        try {

            const request: SubmitOrderRequestV3 = {
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
                validUntil: VALID_UNTIL,
                maxFeeBips: parseInt(feeBips),
                fillAmountBOrS: false, // amm only false
                orderType: OrderType.LimitOrder,
                eddsaSignature: '',
            }

            myLog(request)

            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

            myLog(response)

            if (!response?.hash) {
                setSwapAlertText(t('labelSwapFailed'))
                myError(response?.errInfo)
            } else {
                setSwapAlertText(t('labelSwapSuccess'))
                await delayAndUpdateWalletLayer2()

                setTradeData({
                    ...tradeData,
                    ...{
                        sell: { ...tradeData?.sell, tradeValue: 0 },
                        buy: { ...tradeData?.buy, tradeValue: 0 },
                    }
                } as SwapTradeData<IBData<C>>)
            }

            setSwapToastOpen(true)
            setIsSwapLoading(false)

        } catch (reason) {
            setIsSwapLoading(false);
            dumpError400(reason)

            setSwapAlertText(t('labelSwapFailed'))
            setSwapToastOpen(true)

            setIsSwapLoading(false)
        }

        setOutput(undefined)

        if (rest.__cache__) {
            makeCache(rest.__cache__)
        }

    }, [tradeData, output, tokenMap])

    const swapBtnClickArray = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [swapCalculatorCallback]
    })

    const onSwapClick = React.useCallback(({ sell, buy, slippage, ...rest }: SwapTradeData<IBData<C>>) => {
        accountStaticCallBack(swapBtnClickArray, [{ sell, buy, slippage, ...rest }])
    }, [swapBtnClickArray])

    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, swapType: any): Promise<void> => {

        const { tradeData } = swapData
        resetSwap(swapType, tradeData)

    }

    const [depth, setDepth] = useState<DepthData>()

    const updateDepth = useCallback(async() => {

        if (!market || !LoopringAPI.exchangeAPI) {
            return
        }

        const { depth } = await LoopringAPI.exchangeAPI.getMixDepth({ market })

        setDepth(depth)

    }, [market, setDepth])

    useCustomDCEffect(async() => {
        
        updateDepth()

    }, [market, setDepth])

    const calculateTradeData = async (type: 'sell' | 'buy', _tradeData: SwapTradeData<IBData<C>>, ammPoolSnapshot: AmmPoolSnapshot | undefined)
        : Promise<{ _tradeCalcData: TradeCalcData<C>, _tradeData: SwapTradeData<IBData<C>> }> => {

        if (!marketArray || !tokenMap || !marketMap || !ammMap || !tradeCalcData || !market
            || !depth || depth.symbol !== market) {
            let _tradeCalcData = { ...tradeCalcData } as TradeCalcData<C>
            return { _tradeData, _tradeCalcData }
        }

        const isAtoB = type === 'sell'
        let input: any = (isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue)

        if (input) {
            input = (input.toString() as string).trim()
            if (input === '0.') {
                input = '0'
            }
        } else {
            input = '0'
        }

        myLog('input val:', input)

        const base = _tradeData.sell.belong as string
        const quote = _tradeData.buy.belong as string

        let slippage = _tradeData.slippage

        if (slippage === undefined) {
            slippage = 0.5
        }

        slippage = sdk.toBig(slippage).times(100).toString()

        // const ammMapRaw = { ['AMM-' + market]: ammMap['AMM-' + market].__rawConfig__ } as LoopringMap<AmmPoolInfoV3>

        const output = sdk.getOutputAmount(input, base, quote, isAtoB, marketArray, tokenMap,
            marketMap, depth, ammMap as any, ammPoolSnapshot, takerRate, slippage)

        setOutput(output)

        tradeCalcData.priceImpact = output?.priceImpact as string
        tradeCalcData.minimumReceived = output?.amountBOutSlip.minReceivedVal as string

        if (isAtoB) {
            _tradeData.buy.tradeValue = output?.output ? parseFloat(output?.output) : 0
        } else {
            _tradeData.sell.tradeValue = output?.output ? parseFloat(output?.output) : 0
        }

        //TODO: renew  tradeCalcData
        let _tradeCalcData = { ...tradeCalcData } as TradeCalcData<C>;

        return { _tradeData, _tradeCalcData }

    }

    const throttleSetValue = React.useCallback(_.debounce(async (type, _tradeData, _ammPoolSnapshot) => {

        const { _tradeData: td, _tradeCalcData } = await calculateTradeData(type, _tradeData, _ammPoolSnapshot)//.then(()=>{
        setTradeData(td)
        setTradeCalcData({ ..._tradeCalcData, fee: feeBips })

    }, wait * 2), [setTradeData, setTradeCalcData, calculateTradeData, takerRate]);

    const resetSwap = (swapType: SwapType | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined) => {

        let type = undefined

        let coinKey = `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`

        let _ammPoolSnapshot = ammPoolSnapshot

        switch (swapType) {
            case SwapType.SEll_CLICK:
            case SwapType.BUY_CLICK:
                return
            case SwapType.SELL_SELECTED:
                type = 'sell'
                break
            case SwapType.BUY_SELECTED:
                type = 'buy'
                break
            case SwapType.EXCHANGE_CLICK:
                myLog('Exchange Click')
                break
            default:
                break
        }

        // myLog('*******', tradeCalcData !== undefined, coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        // _tradeData !== undefined, type !== undefined, !tradeData, _tradeData)
        // myLog('tradeData:', tradeData, )

        if (tradeCalcData
            && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
            && type
            && _tradeData
            && (!tradeData || (tradeData[type]?.tradeValue !== _tradeData[type]?.tradeValue))) {
            throttleSetValue(type, _tradeData, _ammPoolSnapshot)
        } else {

            let _tradeFloat: Partial<TradeFloat> = {}
            let _tradeArray: Array<Partial<RawDataTradeItem>> | undefined = undefined

            const hasInitialPair = pair?.coinAInfo?.simpleName && pair?.coinBInfo?.simpleName

            let _tradeCalcData: Partial<TradeCalcData<C>> = {
                coinSell: hasInitialPair ? pair?.coinAInfo?.simpleName : 'LRC',
                coinBuy: hasInitialPair ? pair?.coinBInfo?.simpleName : 'ETH'
            }

            const sellSymbol = _tradeData?.sell.belong as string
            const buySymbol = _tradeData?.buy.belong as string
            // myLog('sellSymbol:', sellSymbol, ' buySymbol:', buySymbol )

            if (sellSymbol && buySymbol) {
                _tradeCalcData.coinSell = sellSymbol

                if (marketMap && marketMap[coinKey]) {
                    _tradeCalcData.coinBuy = buySymbol
                } else {
                    if (tokenMap && tokenMap[sellSymbol]) {
                        // myLog(' tradePairs:', tokenMap[sellSymbol].tradePairs )
                        if (tokenMap[sellSymbol].tradePairs.indexOf(buySymbol) >= 0) {
                            _tradeCalcData.coinBuy = buySymbol
                        } else {
                            const newBuy = tokenMap[sellSymbol].tradePairs[0]
                            if (newBuy) {
                                _tradeCalcData.coinBuy = newBuy
                            } else {
                                throw Error('no such symbol!')
                            }
                        }
                    } else {
                        // throw Error('no such symbol!')
                    }
                }

            }

            let {
                amm,
                market: market2,
                baseShow,
                quoteShow,
            } = getExistedMarket(marketArray, _tradeCalcData.coinSell as string, _tradeCalcData.coinBuy as string);

            if (market2) {

                setTradeCalcData({ ...tradeCalcData, fee: feeBips, ..._tradeCalcData } as TradeCalcData<C>);
                if (coinMap) {
                    setPair({
                        coinAInfo: coinMap[baseShow],
                        coinBInfo: coinMap[quoteShow],
                    })
                    setMarket(market2)
                }

                if (walletLayer2) {
                    const { walletMap } = makeWalletLayer2();
                    _tradeCalcData.walletMap = walletMap as WalletMap<any>;
                    getUserTrades(market)?.then((marketTrades) => {
                        let _myTradeArray = makeMarketArray(market, marketTrades) as RawDataTradeItem[]
                        setMyTradeArray(_myTradeArray ? _myTradeArray : [])
                    })
                }
                let apiList = [];
                //TODO wallet saga done
                if (marketArray && amm && market && ammMap) {
                    // let pairPromise =  usePairTitleBlock({market})
                    apiList = [
                        LoopringAPI.exchangeAPI?.getMarketTrades({ market }),
                        pairDetailBlock({ coinKey: market, ammKey: amm, ammMap })
                    ];
                    //HiGH: this need add websocket to update infr ticker ammpoolsbalace
                    // @ts-ignore
                    Promise.all([...apiList]).then(
                        ([{ marketTrades }, { ammPoolsBalance, tickMap }]: any[]) => {
                            setAmmPoolSnapshot(ammPoolsBalance)
                            if (tokenMap) {
                                let { _tradeCalcData: _td } = pairDetailDone({
                                    coinKey: `${_tradeCalcData.coinSell}-${_tradeCalcData.coinBuy}`,
                                    market,
                                    ammPoolsBalance,
                                    tickerData: tickMap[market] ? tickMap[market] : {},
                                    tokenMap,
                                    _tradeCalcData,
                                    coinMap,
                                    marketCoins,
                                    fee: feeBips,
                                })
                                _tradeCalcData = _td;
                                _tradeFloat = makeTickView(tickMap[market] ? tickMap[market] : {})
                                _tradeArray = makeMarketArray(market, marketTrades)
                                // @ts-ignore
                                setTradeCalcData(_tradeCalcData as TradeCalcData<C>);
                                // @ts-ignore
                                setTradeFloat(_tradeFloat);
                                setTradeArray(_tradeArray as RawDataTradeItem[])
                                setTradeData({
                                    sell: {
                                        belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinSell]?.simpleName : undefined,
                                        balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinSell]?.count : 0
                                    },
                                    // @ts-ignore
                                    buy: {
                                        belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinBuy]?.simpleName : undefined,
                                        balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinBuy]?.count : 0
                                    },
                                } as SwapTradeData<IBData<C>>)
                            }
                        }).catch((error) => {
                            myLog(error)
                        })
                }

            }
        }

    }

    return {
        swapToastOpen,
        setSwapToastOpen,
        swapAlertText,

        tradeCalcData,
        tradeFloat,
        tradeArray,
        myTradeArray,
        btnStatus,
        tradeData,
        pair,
        marketArray,
        onSwapClick,
        swapBtnI18nKey,
        handleSwapPanelEvent,
        updateDepth,
    }

}