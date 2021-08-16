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
    VALID_UNTIL
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
    coinPairInit,
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
import { REFRESH_RATE_SLOW } from 'defs/common_defs';
import { usePairMatch } from 'hooks/usePairMatch';
import { VolToNumberWithPrecision } from '../../utils/formatter_tool';

export const useSwapBtnStatusCheck = () => {

    const [btnStatus, setBtnStatus] = useState(TradeBtnStatus.AVAILABLE)

    const [isSwapLoading, setIsSwapLoading] = useState(false)

    const [isValidAmt, setIsValidAmt] = useState<boolean>(false)

    const { account } = useAccount()

    useEffect(() => {

        if (account.readyState !== AccountStatus.ACTIVATED) {
            setBtnStatus(TradeBtnStatus.AVAILABLE)
        } else {

            if (isSwapLoading) {
                setBtnStatus(TradeBtnStatus.LOADING)
            } else {
                if (isValidAmt) {
                    setBtnStatus(TradeBtnStatus.AVAILABLE)
                } else {
                    setBtnStatus(TradeBtnStatus.DISABLED)
                }
            }

        }

    }, [isSwapLoading, isValidAmt, account.readyState])

    return {
        btnStatus,
        setIsSwapLoading,
        setIsValidAmt,
    }

}

export const useSwapPage = <C extends { [key: string]: any }>() => {
    /*** api prepare ***/
    const { t } = useTranslation('common')

    const [swapToastOpen, setSwapToastOpen] = useState<boolean>(false)

    const [swapAlertText, setSwapAlertText] = useState<string>()
    const wait = globalSetup.wait;
    const { coinMap, tokenMap, marketArray, marketCoins, marketMap, } = useTokenMap()
    const { ammMap } = useAmmMap();

    const { account, status: accountStatus } = useAccount()
    const { delayAndUpdateWalletLayer2, walletLayer2, status: walletLayer2Status } = useWalletLayer2();

    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<Partial<TradeCalcData<C>>>({});
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    
    
    const { pair, setPair, market, } = usePairMatch('/trading/lite')

    //HIGH: get Router info
    
    useCustomDCEffect(() => {
        if (!market) {
            return
        }
        resetSwap(market, undefined, undefined, undefined);
        getUserTrades(market)?.then((marketTrades) => {
            let _myTradeArray = makeMarketArray(market, marketTrades) as RawDataTradeItem[]
            setMyTradeArray(_myTradeArray ? _myTradeArray : [])
        })
    }, [market]);

    const [ammPoolSnapshot, setAmmPoolSnapshot] = React.useState<AmmPoolSnapshot | undefined>(undefined);

    const [swapBtnI18nKey, setSwapBtnI18nKey] = React.useState<string | undefined>(undefined);

    const [output, setOutput] = useState<any>()

    const [takerRate, setTakerRate] = useState<string>('0')

    const [feeBips, setFeeBips] = useState<string>('0')

    const [baseMinAmt, setBaseMinAmt] = useState<string>()

    const [quoteMinAmt, setQuoteMinAmt] = useState<string>()

    // --- btn status check
    const {
        btnStatus,
        setIsSwapLoading,
        setIsValidAmt,
    } = useSwapBtnStatusCheck()
    // --- end of btn status check.

    useCustomDCEffect(async() => {

        const base = tradeData?.sell.belong
        const quote = tradeData?.buy.belong

        if (!LoopringAPI.userAPI || !base || !quote || !marketArray
            || account.readyState !== AccountStatus.ACTIVATED || !ammMap || !market || !account.accountId || !account.apiKey) {
            return
        }

        const {
            amm
        } = getExistedMarket(marketArray, base, quote)

        let feeBips = 0

        if (amm && ammMap[amm]) {
            feeBips = ammMap[amm].__rawConfig__.feeBips
        }

        const req: GetMinimumTokenAmtRequest = {
            accountId: account?.accountId,
            market,
        }

        const { amountMap } = await LoopringAPI.userAPI.getMinimumTokenAmt(req, account.apiKey)

        const baseMinAmtInfo = amountMap[base]
        const quoteMinAmtInfo = amountMap[quote]

        if (!baseMinAmtInfo || !quoteMinAmtInfo) {
            return
        }

        const takerRate = quoteMinAmtInfo.userOrderInfo.takerRate

        const totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()

        setBaseMinAmt(baseMinAmtInfo.userOrderInfo.minAmount)
        setQuoteMinAmt(quoteMinAmtInfo.userOrderInfo.minAmount)

        myLog('---------------------------- amountMap:', amountMap)

        myLog('totalFee:', totalFee)
        myLog('takerRate:', takerRate)

        setFeeBips(totalFee)
        setTakerRate(takerRate.toString())

        setTradeCalcData({ ...tradeCalcData, fee: totalFee } as TradeCalcData<C>)

    }, [tradeData?.sell.belong, tradeData?.buy.belong, marketArray, ammMap,
    account.readyState, account.apiKey, account.accountId])

    //HIGH: effect by wallet state update
    React.useEffect(() => {
        if (walletLayer2Status === SagaStatus.UNSET) {
            const { walletMap } = makeWalletLayer2();
            // if (tradeCalcData) {
            setTradeCalcData({ ...tradeCalcData, walletMap } as TradeCalcData<C>);
            setTradeData({
                sell: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinSell]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinSell as string]?.count : 0
                },
                // @ts-ignore
                buy: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinBuy]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinBuy as string]?.count : 0
                },
            } as SwapTradeData<IBData<C>>)
            // }
        }
    }, [walletLayer2Status])

    React.useEffect(() => {
        const label: string | undefined = accountStaticCallBack(btnLabel)
        setSwapBtnI18nKey(label);
    }, [accountStatus]);

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
                orderType: OrderType.ClassAmm,
                eddsaSignature: '',
            }

            myLog(request)

            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

            myLog(response)

            if (response?.hash) {
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

    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, switchType: any): Promise<void> => {

        const { tradeData } = swapData
        return new Promise((resolve) => {
            switch (switchType) {
                case SwapType.SEll_CLICK:
                    break
                case SwapType.BUY_CLICK:
                    break
                case SwapType.SELL_SELECTED:
                    resetSwap(`${tradeData.sell.belong}-${tradeData.buy.belong}`, 'sell', tradeData, ammPoolSnapshot)
                    break
                case SwapType.BUY_SELECTED:
                    resetSwap(`${tradeData.sell.belong}-${tradeData.buy.belong}`, 'buy', tradeData, ammPoolSnapshot)
                    break
                case SwapType.EXCHANGE_CLICK:
                    resetSwap(`${tradeData.sell.belong}-${tradeData.buy.belong}`, undefined, undefined, ammPoolSnapshot)
                    break
                default:
                    break
            }

            resolve(undefined)
        })

    }

    const [depth, setDepth] = useState<DepthData>()

    useEffect(() => {

        const updateDepth = async () => {
            if (!market || !LoopringAPI.exchangeAPI) {
                return
            }

            const { depth } = await LoopringAPI.exchangeAPI.getMixDepth({ market })
            setDepth(depth)
        }

        updateDepth()

        const handler = setInterval(() => {
            updateDepth()
        }, REFRESH_RATE_SLOW)

        return () => {
            if (handler) {
                clearInterval(handler)
            }
        }
    }, [market])

    const calculateTradeData = async (type: 'sell' | 'buy', _tradeData: SwapTradeData<IBData<C>>, ammPoolSnapshot: AmmPoolSnapshot | undefined)
        : Promise<{ _tradeCalcData: TradeCalcData<C>, _tradeData: SwapTradeData<IBData<C>> }> => {

        if (!marketArray || !tokenMap || !marketMap || !depth || !ammMap || !tradeCalcData || !market) {
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

        const base = _tradeData.sell.belong as string
        const quote = _tradeData.buy.belong as string

        let slippage = _tradeData.slippage

        if (slippage === undefined) {
            slippage = 0.5
        }

        slippage = sdk.toBig(slippage).times(100).toString()

        const ammMapRaw = { ['AMM-' + market]: ammMap['AMM-' + market].__rawConfig__ } as LoopringMap<AmmPoolInfoV3>

        myLog(input)

        const output = sdk.getOutputAmount(input, base, quote, isAtoB, marketArray, tokenMap,
            marketMap, depth, ammMapRaw, ammPoolSnapshot, takerRate, slippage)

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

    // check output and min order amt
    useCustomDCEffect(() => {

        const validAmt = (output?.amountBOut && quoteMinAmt
            && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false

        setIsValidAmt(validAmt)
        
        if(validAmt || quoteMinAmt === undefined || tradeData === undefined) {
            setSwapBtnI18nKey(undefined)
        } else {
            setSwapBtnI18nKey(`labelLimitMin, ${VolToNumberWithPrecision(quoteMinAmt,tradeData?.buy.belong) + ' ' + tradeData?.buy.belong}`)
        }

        myLog('output:', output, ' quoteMinAmt:', quoteMinAmt, ' validAmt:', validAmt)

    }, [output, quoteMinAmt, tradeData?.sell.belong])

    const throttleSetValue = React.useCallback(_.debounce(async (type, _tradeData, _ammPoolSnapshot) => {

        const { _tradeData: td, _tradeCalcData } = await calculateTradeData(type, _tradeData, _ammPoolSnapshot)//.then(()=>{
        setTradeData(td)
        setTradeCalcData({ ..._tradeCalcData, fee: feeBips })

    }, wait * 2), [setTradeData, setTradeCalcData, calculateTradeData, takerRate]);

    const resetSwap = (coinKey: any, type: 'sell' | 'buy' | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined, _ammPoolSnapshot: AmmPoolSnapshot | undefined) => {
        
        if (tradeCalcData
            && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
            && _tradeData
            && type
            && (!tradeData || (tradeData[type].tradeValue !== _tradeData[type].tradeValue))) {

            throttleSetValue(type, _tradeData, _ammPoolSnapshot)

        } else {
            let _tradeFloat: Partial<TradeFloat> = {}
            let _tradeArray: Array<Partial<RawDataTradeItem>> | undefined = undefined;
            let _tradeCalcData: Partial<TradeCalcData<C>> = coinPairInit({
                coinKey,
                _tradeCalcData: {coinSell: pair?.coinAInfo?.simpleName, coinBuy: pair?.coinBInfo?.simpleName },
                tokenMap,
                coinMap
            })
            let {
                amm,
                market: market2
            } = getExistedMarket(marketArray, _tradeCalcData.coinSell as string, _tradeCalcData.coinBuy as string);
            myLog('_tradeCalcData:', _tradeCalcData, market, market2)

            const marketTemp = market2 ?? market

            if (marketTemp) {
                const [, coinA, coinB] = marketTemp.match(/(\w+)-(\w+)/i)
    
                setTradeCalcData({ ...tradeCalcData, fee: feeBips, ..._tradeCalcData } as TradeCalcData<C>);
                if (coinMap) {
                    setPair({
                        coinAInfo: coinMap[coinA],
                        coinBInfo: coinMap[coinB],
                    })
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
        handleSwapPanelEvent
    }

}