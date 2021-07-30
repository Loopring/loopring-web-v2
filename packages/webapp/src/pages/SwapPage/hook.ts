import { useRouteMatch } from 'react-router';
import {
    CoinInfo,
    CustomError,
    ErrorMap,
    globalSetup,
    IBData,
    TradeCalcData,
    TradeFloat,
    WalletMap
} from '@loopring-web/common-resources';
import React, { useCallback, useEffect, useState } from 'react';
import { LoopringAPI } from '../../stores/apis/api';
import { useTokenMap } from '../../stores/token';
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
import { RawDataTradeItem, SwapTradeData, SwapType, TradeBtnStatus } from '@loopring-web/component-lib';
import { useAccount } from '../../stores/account/hook';
import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';
import {
    accountStaticCallBack,
    bntLabel,
    btnClickMap,
    coinPairInit,
    fnType,
    getUserTrades,
    makeCache,
    makeMarketArray,
    makeTickView,
    makeWalletLayer2,
    pairDetailBlock,
    pairDetailDone
} from '../../hooks/help';
import * as _ from 'lodash'
import store from 'stores';
import { AccountStatus } from 'state_machine/account_machine_spec';
import { SwapData } from '@loopring-web/component-lib';
import { deepClone } from '../../utils/obj_tools';
import { myLog } from 'utils/log_tools';
import { useTranslation } from 'react-i18next';
import { REFRESH_RATE_SLOW } from 'defs/common_defs';

export const useSwapBtnStatusCheck = () => {

    const [btnStatus, setBtnStatus] = useState(TradeBtnStatus.DISABLED)
    
    const [isSwapLoading, setIsSwapLoading] = useState(false)

    const [isValidAmt, setIsValidAmt] = useState<boolean>(false)

    useEffect(() => {

        if (isSwapLoading) {
            setBtnStatus(TradeBtnStatus.LOADING)
        } else {
            if (isValidAmt) {
                setBtnStatus(TradeBtnStatus.AVAILABLE)
            } else {
                setBtnStatus(TradeBtnStatus.DISABLED)
            }
        }

    }, [isSwapLoading, isValidAmt])

    return {
        btnStatus,
        setIsSwapLoading,
        setIsValidAmt,
    }

}

export const useSwapPage = <C extends { [ key: string ]: any }>() => {
    /*** api prepare ***/
    const { t } = useTranslation('common')

    const [swapToastOpen, setSwapToastOpen] = useState<boolean>(false)
        
    const [swapAlertText, setSwapAlertText] = useState<string>()
    const wait = globalSetup.wait;
    const match: any = useRouteMatch(":symbol")
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap,} = useTokenMap()
    const {ammMap} = useAmmMap();
    
    const {account} = useAccount()
    const {delayAndUpdateWalletLayer2} = useWalletLayer2();

    const walletLayer2State = useWalletLayer2()
    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<TradeCalcData<C> | undefined>(undefined);
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    const [pair, setPair] = React.useState<{ coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined }>({
        coinAInfo: undefined,
        coinBInfo: undefined,
    });

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

        if (!LoopringAPI.userAPI || !base || !quote || !ammMap || !marketArray 
            || account.readyState !== AccountStatus.ACTIVATED || !account.accountId || !account.apiKey) {
            return
        }

        const {
            amm
        } = getExistedMarket(marketArray, base, quote)

        if (!amm) {
            return
        }

        const ammInfo = ammMap[amm]

        const feeBips = ammInfo.__rawConfig__.feeBips

        const req: GetMinimumTokenAmtRequest = {
            accountId: account?.accountId,
            market: amm,
        }

        const { amountMap } = await LoopringAPI.userAPI.getMinimumTokenAmt(req, account.apiKey)

        const baseMinAmtInfo = amountMap[base]
        const quoteMinAmtInfo = amountMap[quote]

        const takerRate = quoteMinAmtInfo.userOrderInfo.takerRate

        const totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()

        setBaseMinAmt(baseMinAmtInfo.userOrderInfo.minAmount)
        setQuoteMinAmt(quoteMinAmtInfo.userOrderInfo.minAmount)

        myLog('---------------------------- amountMap:', amountMap)

        myLog('totalFee:', totalFee)
        myLog('takerRate:', takerRate)

        setFeeBips(totalFee)
        setTakerRate(takerRate.toString())

        setTradeCalcData({...tradeCalcData, fee: totalFee} as TradeCalcData<C>)

    }, [tradeData?.sell.belong, tradeData?.buy.belong, marketArray, ammMap, 
        account.readyState, account.apiKey, account.accountId])

    //HIGH: get Router info
    // const symbol = match?.params.symbol ?? undefined;
    React.useEffect(() => {
        const symbol = match?.params.symbol ?? undefined;
        resetSwap(symbol, undefined, undefined, undefined);
        // const label: string | undefined = accountStaticCallBack(bntLabel)
        // setSwapBtnI18nKey(label);
    }, []);

        //HIGH: effect by wallet state update
    React.useEffect(() => {
        switch (walletLayer2State.status) {
            case "ERROR":
                walletLayer2State.statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                walletLayer2State.statusUnset();
                const {walletMap} = makeWalletLayer2();
                if (tradeCalcData) {
                    setTradeCalcData({...tradeCalcData, fee: feeBips, walletMap} as TradeCalcData<C>);
                    setTradeData({
                        sell: {
                            belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[ tradeCalcData.coinSell ]?.simpleName : undefined,
                            balance: walletMap ? walletMap[ tradeCalcData.coinSell ]?.count : 0
                        },
                        // @ts-ignore
                        buy: {
                            belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[ tradeCalcData.coinBuy ]?.simpleName : undefined,
                            balance: walletMap ? walletMap[ tradeCalcData.coinBuy ]?.count : 0
                        },
                    } as SwapTradeData<IBData<C>>)
                    const {
                        market
                    } = getExistedMarket(marketArray, tradeCalcData.coinSell as string, tradeCalcData.coinBuy as string);
                    getUserTrades(market).then((marketTrades) => {
                        let _myTradeArray = makeMarketArray(market, marketTrades) as RawDataTradeItem[]
                        setMyTradeArray(_myTradeArray ? _myTradeArray : [])
                    })
                }

                break;
            default:
                break;

        }
    }, [walletLayer2State.status, setMyTradeArray, marketArray, tradeCalcData])

    useCustomDCEffect(() => {
        const label: string | undefined = accountStaticCallBack(bntLabel)
        setSwapBtnI18nKey(label);
    }, [account.readyState]);

    const swapCalculatorCallback = useCallback(async({sell, buy, slippage, ...rest}: any) => {

        const {exchangeInfo} = store.getState().system
        setIsSwapLoading(true);
        if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !output
            || account.readyState !== AccountStatus.ACTIVATED) {

            setSwapAlertText(t('labelSwapFailed'))
            setSwapToastOpen(true)
            
            setIsSwapLoading(false)

            return
        }

        const baseToken = tokenMap[ sell.belong as string ]
        const quoteToken = tokenMap[ buy.belong as string ]

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

            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey, account.apiKey)

            myLog(response)

            await delayAndUpdateWalletLayer2()
            
            setTradeData({
                ...tradeData,
                ...{
                    sell: {...tradeData?.sell, tradeValue: 0},
                    buy: {...tradeData?.buy, tradeValue: 0},
                }
            } as SwapTradeData<IBData<C>>)

            setSwapAlertText(t('labelSwapSuccess'))
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
        
    },[tradeData, output, tokenMap])

    const swapBtnClickArray: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]:[swapCalculatorCallback]
    })

    const onSwapClick = React.useCallback(({sell, buy, slippage, ...rest}: SwapTradeData<IBData<C>>) => {
        accountStaticCallBack(swapBtnClickArray, [{sell, buy, slippage, ...rest}])
    }, [swapBtnClickArray])

    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, switchType: any): Promise<void> => {
        
        const {tradeData} = swapData
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
        
        const updateDepth = async() => {
            if (!pair || !LoopringAPI.exchangeAPI || !pair.coinAInfo) {
                return
            }
            const market = `${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}`
            const { depth } = await LoopringAPI.exchangeAPI?.getMixDepth({market})
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
    }, [pair])

    const calculateTradeData = async (type: 'sell' | 'buy', _tradeData: SwapTradeData<IBData<C>>, ammPoolSnapshot: AmmPoolSnapshot | undefined)
        : Promise<{ _tradeCalcData: TradeCalcData<C>, _tradeData: SwapTradeData<IBData<C>> }> => {
        
        const market = `${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}`
        if (!marketArray || !tokenMap || !marketMap || !depth || !ammMap || !tradeCalcData) {
            let _tradeCalcData = {...tradeCalcData} as TradeCalcData<C>
            return {_tradeData, _tradeCalcData}
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

        const ammMapRaw = {[ 'AMM-' + market ]: ammMap[ 'AMM-' + market ].__rawConfig__} as LoopringMap<AmmPoolInfoV3>

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
        let _tradeCalcData = {...tradeCalcData} as TradeCalcData<C>;

        return {_tradeData, _tradeCalcData}
        
    }

    // check output and min order amt
    useCustomDCEffect(() => {

        const validAmt = (output?.amountBOut && quoteMinAmt 
            && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false
        
        setIsValidAmt(validAmt)

        myLog(output, quoteMinAmt)

        myLog('.........validAmt:', validAmt)

    }, [output, quoteMinAmt])

    const throttleSetValue = React.useCallback(_.debounce(async (type, _tradeData, _ammPoolSnapshot) => {
      
        const {_tradeData: td, _tradeCalcData} = await calculateTradeData(type, _tradeData, _ammPoolSnapshot)//.then(()=>{
        setTradeData(td)
        setTradeCalcData({..._tradeCalcData, fee: feeBips})

    }, wait * 2), [setTradeData, setTradeCalcData, calculateTradeData, takerRate]);

    const resetSwap = async (coinKey: any, type: 'sell' | 'buy' | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined, _ammPoolSnapshot: AmmPoolSnapshot | undefined) => {
        if (tradeCalcData
            && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
            && _tradeData
            && type
            && (!tradeData || (tradeData[ type ].tradeValue !== _tradeData[ type ].tradeValue))) {
                
            throttleSetValue(type, _tradeData, _ammPoolSnapshot)

        } else {
            let _tradeFloat: Partial<TradeFloat> = {}
            let _tradeArray: Array<Partial<RawDataTradeItem>> | undefined = undefined;
            let _tradeCalcData: Partial<TradeCalcData<C>> = coinPairInit({
                coinKey,
                _tradeCalcData: {},
                tokenMap,
                coinMap
            })
            let {
                amm,
                market
            } = getExistedMarket(marketArray, _tradeCalcData.coinSell as string, _tradeCalcData.coinBuy as string);
            const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i)

            setTradeCalcData({...tradeCalcData, fee: feeBips, ..._tradeCalcData} as TradeCalcData<C>);
            if (coinMap) {
                setPair({
                    coinAInfo: coinMap[ coinA ],
                    coinBInfo: coinMap[ coinB ],
                })
            }
            if (walletLayer2State.walletLayer2) {
                const {walletMap} = makeWalletLayer2();
                _tradeCalcData.walletMap = walletMap as WalletMap<any>;
                getUserTrades(market).then((marketTrades) => {
                    let _myTradeArray = makeMarketArray(market, marketTrades) as RawDataTradeItem[]
                    setMyTradeArray(_myTradeArray ? _myTradeArray : [])
                })

            }
            let apiList = [];
            //TODO wallet saga done
            if (marketArray && amm && market && ammMap) {
                // let pairPromise =  usePairTitleBlock({market})
                apiList = [
                    LoopringAPI.exchangeAPI?.getMarketTrades({market}),
                    pairDetailBlock({coinKey: market, ammKey: amm, ammMap})
                ];
                //HiGH: this need add websocket to update infr ticker ammpoolsbalace
                // @ts-ignore
                Promise.all([...apiList]).then(
                    ([{marketTrades}, {ammPoolsBalance, tickMap}]: any[]) => {
                        setAmmPoolSnapshot(ammPoolsBalance)
                        if (tokenMap) {
                            let {_tradeCalcData: _td} = pairDetailDone({
                                coinKey: `${_tradeCalcData.coinSell}-${_tradeCalcData.coinBuy}`,
                                market,
                                ammPoolsBalance,
                                tickerData: tickMap[ market ] ? tickMap[ market ] : {},
                                tokenMap,
                                _tradeCalcData,
                                coinMap,
                                marketCoins,
                                fee: feeBips,
                            })
                            _tradeCalcData = _td;
                            _tradeFloat = makeTickView(tickMap[ market ] ? tickMap[ market ] : {})
                            _tradeArray = makeMarketArray(market, marketTrades)
                            // @ts-ignore
                            setTradeCalcData(_tradeCalcData as TradeCalcData<C>);
                            // @ts-ignore
                            setTradeFloat(_tradeFloat);
                            setTradeArray(_tradeArray as RawDataTradeItem[])
                            // setPair(_pair)
                            setTradeData({
                                sell: {
                                    belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[ _tradeCalcData.coinSell ]?.simpleName : undefined,
                                    balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[ _tradeCalcData.coinSell ]?.count : 0
                                },
                                // @ts-ignore
                                buy: {
                                    belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[ _tradeCalcData.coinBuy ]?.simpleName : undefined,
                                    balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[ _tradeCalcData.coinBuy ]?.count : 0
                                },
                            } as SwapTradeData<IBData<C>>)
                        }
                    }).catch((error) => {
                    throw new CustomError({...ErrorMap.TRADE_LITE_SET_PAIR_ERROR, options: error})
                    //TODO solve error
                })

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