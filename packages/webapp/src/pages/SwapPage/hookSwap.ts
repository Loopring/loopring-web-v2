import * as sdk from 'loopring-sdk';
import { OrderStatus, sleep } from 'loopring-sdk';
import React from 'react';
import { useSocket } from '../../stores/socket';
import { useAccount } from '../../stores/account';
import { usePairMatch } from '../../hooks/common/usePairMatch';
import { useAmount } from '../../stores/amount';
import { useTokenMap } from '../../stores/token';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useWalletLayer2 } from '../../stores/walletLayer2';
import { useSystem } from '../../stores/system';
import {
    AccountStatus,
    CoinMap,
    fnType,
    IBData,
    SagaStatus,
    TradeCalcData,
    TradeFloat,
    WalletMap
} from '@loopring-web/common-resources';
import { RawDataTradeItem, SwapData, SwapTradeData, SwapType, TradeBtnStatus } from '@loopring-web/component-lib';
import { useTranslation } from 'react-i18next';
import { useWalletLayer2Socket, walletLayer2Service } from '../../services/socket';
import { VolToNumberWithPrecision } from '../../utils/formatter_tool';

import { getShowStr } from '@loopring-web/common-resources'

import { useToast } from '../../hooks/common/useToast';
import {
    accountStaticCallBack,
    btnClickMap,
    btnLabel,
    makeMarketArray,
    makeTickView,
    makeWalletLayer2,
} from '../../hooks/help';
import { LoopringAPI } from '../../api_wrapper';
import * as _ from 'lodash'
import { PairFormat, usePageTradeLite } from '../../stores/router';
import { DAYS } from '../../defs/common_defs';
import { getTimestampDaysLater } from '../../utils/dt_tools';
import { myLog } from '@loopring-web/common-resources/static-resources/src/utils/log_tools';
import { calcPriceByAmmTickMapDepth, marketInitCheck, swapDependAsync } from './help';

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

enum PriceLevel {
    Normal,
    Lv1,
    Lv2,
}

const getPriceImpactInfo = (calcTradeParams: any) => {
    let priceImpact: any = calcTradeParams?.priceImpact ? parseFloat(calcTradeParams?.priceImpact) * 100 : undefined
    let priceImpactColor = 'var(--color-success)'

    let priceLevel = PriceLevel.Normal

    if (priceImpact) {

        if (priceImpact > 0.1 && priceImpact <= 1) {
            priceImpactColor = 'var(--color-success)'
        } else if (priceImpact > 1 && priceImpact <= 3) {
            priceImpactColor = 'textPrimary'
        } else if (priceImpact > 3 && priceImpact <= 5) {
            priceImpactColor = 'var(--color-warning)'
        } else if (priceImpact > 5 && priceImpact <= 10) {
            priceImpactColor = 'var(--color-error)'
            priceLevel = PriceLevel.Lv1
        } else if (priceImpact > 10) {
            priceImpactColor = 'var(--color-error)'
            priceLevel = PriceLevel.Lv2
        }

        priceImpact = getShowStr(priceImpact)

    } else {
        priceImpactColor = 'var(--color-text-primary)'
    }

    return {
        value: priceImpact,
        priceImpactColor,
        priceLevel,
    }
}

export const useSwap = <C extends { [ key: string ]: any }>() => {

    //High: No not Move!!!!!!
    const {realPair, realMarket} = usePairMatch('/trading/lite');
    /** get store value **/
    const {amountMap, getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {toastOpen, setToastOpen, closeToast,} = useToast();
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap} = useTokenMap()
    const {ammMap} = useAmmMap();
    const {exchangeInfo} = useSystem();
    const {
        pageTradeLite,
        updatePageTradeLite,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradeLite();
    const {status: walletLayer2Status} = useWalletLayer2();
    /*** api prepare ***/
    const {t} = useTranslation('common')
    const refreshRef = React.createRef();
    const [pair, setPair] = React.useState(realPair);
    const [market, setMarket] = React.useState<PairFormat>(realMarket as PairFormat);
    const [swapBtnI18nKey, setSwapBtnI18nKey] = React.useState<string | undefined>(undefined)
    const [swapBtnStatus, setSwapBtnStatus] = React.useState(TradeBtnStatus.AVAILABLE)
    const [isSwapLoading, setIsSwapLoading] = React.useState(false)
    const [sellMinAmt, setSellMinAmt] = React.useState<string>()
    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<Partial<TradeCalcData<C>>>({
        coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
            return {...prev, [ item ]: coinMap ? coinMap[ item ] : {}}
        }, {} as CoinMap<C>)
    });
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    // const [tickMap, setTickMap] = React.useState<sdk.LoopringMap<sdk.TickerData> | undefined>(undefined)
    // const [ammPoolSnapshot, setAmmPoolSnapshot] = React.useState<sdk.AmmPoolSnapshot | undefined>(undefined);
    const [alertOpen, setAlertOpen] = React.useState<boolean>(false)
    const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false)
    // const [depth, setDepth] = React.useState<sdk.DepthData>()
    // const [priceImpact, setPriceImpact] = React.useState<number>(0)

    /*** Btn related function ***/
    const swapFunc = React.useCallback(async (event: MouseEvent, isAgree?: boolean) => {
        let {calcTradeParams, tradeChannel, orderType, totalFee} = pageTradeLite;
        setAlertOpen(false)
        setConfirmOpen(false)

        if (isAgree) {

            setIsSwapLoading(true);
            if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !calcTradeParams
                || account.readyState !== AccountStatus.ACTIVATED) {

                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                setIsSwapLoading(false)

                return
            }

            const sell = tradeData?.sell.belong as string
            const buy = tradeData?.buy.belong as string

            const baseToken = tokenMap[ sell ]
            const quoteToken = tokenMap[ buy ]

            const request: sdk.GetNextStorageIdRequest = {
                accountId: account.accountId,
                sellTokenId: baseToken.tokenId
            }

            const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)

            try {


                const request: sdk.SubmitOrderRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    accountId: account.accountId,
                    storageId: storageId.orderId,
                    sellToken: {
                        tokenId: baseToken.tokenId,
                        volume: calcTradeParams.amountS as string
                    },
                    buyToken: {
                        tokenId: quoteToken.tokenId,
                        volume: calcTradeParams.amountBOutSlip.minReceived as string
                    },
                    allOrNone: false,
                    validUntil: getTimestampDaysLater(DAYS),
                    maxFeeBips: parseInt(totalFee as string),
                    fillAmountBOrS: false, // amm only false
                    orderType,
                    tradeChannel,
                    eddsaSignature: '',
                }

                myLog(request)

                const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

                myLog(response)

                if (!response?.hash) {
                    setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                    myLog(response?.resultInfo)
                } else {
                    await sleep(__TOAST_AUTO_CLOSE_TIMER__)

                    const resp = await LoopringAPI.userAPI.getOrderDetails({
                        accountId: account.accountId,
                        orderHash: response.hash
                    }, account.apiKey)

                    myLog('-----> resp:', resp)

                    if (resp.orderDetail?.status !== undefined) {
                        switch (resp.orderDetail?.status) {
                            case OrderStatus.cancelled:
                                setToastOpen({open: true, type: 'warning', content: t('labelSwapCancelled')})
                                break
                            case OrderStatus.processed:
                                setToastOpen({open: true, type: 'success', content: t('labelSwapSuccess')})
                                break
                            default:
                                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                        }
                    }
                    walletLayer2Service.sendUserUpdate()
                    setTradeData((state) => {
                        return {
                            ...state,
                            sell: {...state?.sell, tradeValue: 0},
                            buy: {...state?.buy, tradeValue: 0},
                        } as SwapTradeData<IBData<C>>
                    });
                    setTradeCalcData((state) => {
                        return {
                            ...state,
                            minimumReceived: undefined,
                            priceImpact: undefined,
                            fee: undefined
                        }
                    })
                }
            } catch (reason) {
                sdk.dumpError400(reason)
                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})

            }

            // setOutput(undefined)

            await sleep(__SUBMIT_LOCK_TIMER__)

            setIsSwapLoading(false)

        }

    }, [account.readyState, pageTradeLite, tokenMap, tradeData, setIsSwapLoading, setToastOpen, setTradeData])
    const btnLabelAccountActive = React.useCallback((): string | undefined => {
        let {calcTradeParams} = pageTradeLite;
        const validAmt = !!(calcTradeParams?.amountBOut && sellMinAmt
            && sdk.toBig(calcTradeParams?.amountBOut).gte(sdk.toBig(sellMinAmt)));
        if (isSwapLoading) {
            setSwapBtnStatus(TradeBtnStatus.LOADING)
            return undefined
        } else {
            if (account.readyState === AccountStatus.ACTIVATED) {
                if (tradeData === undefined
                    || tradeData?.sell.tradeValue === undefined
                    || tradeData?.buy.tradeValue === undefined
                    || tradeData?.sell.tradeValue === 0
                    || tradeData?.buy.tradeValue === 0) {
                    setSwapBtnStatus(TradeBtnStatus.DISABLED)
                    return 'labelEnterAmount';
                } else if (validAmt || sellMinAmt === undefined) {
                    setSwapBtnStatus(TradeBtnStatus.AVAILABLE)
                    return undefined

                } else {
                    const quote = tradeData?.buy.belong;
                    const minOrderSize = VolToNumberWithPrecision(sellMinAmt, quote as any) + ' ' + tradeData?.buy.belong;
                    setSwapBtnStatus(TradeBtnStatus.DISABLED)
                    return `labelLimitMin, ${minOrderSize}`

                }

            } else {
                setSwapBtnStatus(TradeBtnStatus.AVAILABLE)
            }

        }
    }, [account.readyState, pageTradeLite, tradeData, isSwapLoading, setSwapBtnStatus])
    const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
        [ fnType.ACTIVATED ]: [
            btnLabelAccountActive
        ]
    });
    const swapCalculatorCallback = React.useCallback(async () => {


        const {priceLevel} = getPriceImpactInfo(pageTradeLite.calcTradeParams)

        switch (priceLevel) {
            case PriceLevel.Lv1:
                setAlertOpen(true)
                break
            case PriceLevel.Lv2:
                setConfirmOpen(true)
                break
            default:
                swapFunc(undefined as any, true);
                break
        }

        myLog('swap directly')

    }, [pageTradeLite])
    const swapBtnClickArray = Object.assign(_.cloneDeep(btnClickMap), {
        [ fnType.ACTIVATED ]: [swapCalculatorCallback]
    })
    const onSwapClick = React.useCallback(({sell, buy, slippage, ...rest}: SwapTradeData<IBData<C>>) => {
        accountStaticCallBack(swapBtnClickArray, [{sell, buy, slippage, ...rest}])
    }, [swapBtnClickArray])
    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET) {
            setSwapBtnStatus(TradeBtnStatus.AVAILABLE)
            setSwapBtnI18nKey(accountStaticCallBack(_btnLabel));
        }
    }, [accountStatus, isSwapLoading, tradeData?.sell.tradeValue])
    /*** Btn related end ***/

    /*** table related function ***/
    const myTradeTableCallback = React.useCallback(async () => {
        if (market && account.accountId && account.apiKey && LoopringAPI.userAPI) {
            const {userTrades} = await LoopringAPI.userAPI.getUserTrades({
                accountId: account.accountId,
                market,
                limit:100,
            }, account.apiKey);
            let _myTradeArray = makeMarketArray(market, userTrades) as RawDataTradeItem[]
            setMyTradeArray(_myTradeArray ? _myTradeArray : [])
        } else {
            setMyTradeArray([])
        }
    }, [market, account.accountId, account.apiKey, setMyTradeArray])
    React.useEffect(() => {
        if (market && accountStatus === SagaStatus.UNSET && walletLayer2Status === SagaStatus.UNSET) {
            myTradeTableCallback();
        }

    }, [market, accountStatus, walletLayer2Status]);


    const marketTradeTableCallback = React.useCallback(async () => {
        if (LoopringAPI.exchangeAPI && market) {
            const {marketTrades} = await LoopringAPI.exchangeAPI.getMarketTrades({market,limit:15});
            const _tradeArray = makeMarketArray(market, marketTrades)
            setTradeArray(_tradeArray as RawDataTradeItem[])
        } else {
            setTradeArray([])
        }

    }, [market, setTradeArray])

    const should15sRefresh = React.useCallback(() => {
        myLog('should15sRefresh', market);
        if (market) {
            // updateDepth()
            callPairDetailInfoAPIs()
            marketTradeTableCallback();
        }
    }, [market, ammMap])
    /*** table related end ***/

    /*** account related function ***/
    React.useEffect(() => {
        if (account.readyState === AccountStatus.ACTIVATED && accountStatus === SagaStatus.UNSET) {
            getAmount({market})
        }
    }, [accountStatus])
    React.useEffect(() => {
        if (accountStatus === SagaStatus.UNSET && tradeCalcData?.coinSell && tradeCalcData?.coinBuy) {
            walletLayer2Callback()
        }
    }, [account.readyState, accountStatus, market, tradeCalcData?.coinSell, tradeCalcData?.coinBuy])


    const walletLayer2Callback = React.useCallback(async () => {

        let walletMap: WalletMap<any> | undefined = undefined
        if (account.readyState === AccountStatus.ACTIVATED) {
            walletMap = makeWalletLayer2().walletMap;
            myLog('--ACTIVATED tradeCalcData:', tradeCalcData)
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
            setTradeCalcData((tradeCalcData) => {
                return {...tradeCalcData, walletMap} as TradeCalcData<C>
            })
        } else {
            if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
                setTradeData((state) => {
                    return {
                        ...state,
                        sell: {belong: tradeCalcData.coinSell},
                        buy: {belong: tradeCalcData.coinBuy},
                    } as SwapTradeData<IBData<C>>
                })
            }
            updatePageTradeLite({
                market: market as PairFormat,
                feeBips: 0,
                totalFee: 0,
                takerRate: 0,
                priceImpactObj: undefined
            })
            // setFeeBips('0')
            // setTotalFee('0')
            // setTakerRate('0')
            setTradeCalcData((state) => {
                return {
                    ...state,
                    minimumReceived: undefined,
                    priceImpact: undefined,
                    fee: undefined
                }
            })
        }


    }, [tradeData, market, tradeCalcData, marketArray, ammMap, account.readyState])

    useSwapSocket()
    useWalletLayer2Socket({walletLayer2Callback})
    /*** account related end ***/

    /*** user Action function ***/
        //HIGH: effect by wallet state update
    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, swapType: any): Promise<void> => {

            // myLog('handleSwapPanelEvent...')

            const {tradeData} = swapData
            resetSwap(swapType, tradeData)

        }

    React.useEffect(() => {
        if (pageTradeLite.depth) {
            refreshAmmPoolSnapshot()
            setIsSwapLoading(false);

        }
    }, [pageTradeLite.depth, tradeCalcData.coinBuy])

    React.useEffect(() => {
        if (market) {
            //@ts-ignore
            myLog('refreshRef', market, refreshRef.current, refreshRef.current.firstElementChild);
            if (refreshRef.current) {
                // @ts-ignore
                refreshRef.current.firstElementChild.click();
            }
            if ((tradeData && tradeData.sell.belong == undefined) || tradeData === undefined) {
                resetSwap(undefined, undefined)
            }
        }

    }, [market]);
    const refreshAmmPoolSnapshot = React.useCallback(() => {
        const {tickMap, ammPoolSnapshot, depth, lastStepAt,tradePair} = pageTradeLite;
        //@ts-ignore
        //(tickMap || ammPoolSnapshot) &&
        if (pageTradeLite.market && (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market
            || `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
        ) {
            let {stob, close} = calcPriceByAmmTickMapDepth({
                market: market as any, tradePair: `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
                dependencyData: {tickMap, ammPoolSnapshot, depth}
            })

            // myLog('refreshAmmPoolSnapshot ---stob:', close, stob)

            close = Number(getShowStr(close))

            let _tradeFloat = makeTickView(tickMap && tickMap[ pageTradeLite.market ] ? tickMap[ pageTradeLite.market ] : {})
            setTradeFloat({
                ..._tradeFloat,
                close: close
            } as TradeFloat);
            setTradeCalcData((state) => {
                state.StoB = getShowStr(stob)
                state.BtoS = getShowStr(stob ? 1 / stob : 0)
                return state
            })
        }
        if( tradeData
            && lastStepAt
            && tradeCalcData.coinSell === tradeData['sell'].belong
            && tradeCalcData.coinBuy === tradeData['buy'].belong
            && tradeData[lastStepAt].tradeValue && tradeData[lastStepAt].tradeValue !== 0) {
            reCalculateDataWhenValueChange(tradeData,tradePair,lastStepAt);
        }


    }, [market, pageTradeLite, tradeData, tradeCalcData, setTradeCalcData])

    const resetTradeCalcData = React.useCallback((_tradeData, _market?, type?: 'sell' | 'buy') => {
        if (coinMap && tokenMap && marketMap && marketArray && ammMap) {
            const {tradePair} = marketInitCheck(_market, type);
            // @ts-ignore
            const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i);
            let walletMap: WalletMap<any> | undefined;
            if (account.readyState === AccountStatus.ACTIVATED && walletLayer2Status === SagaStatus.UNSET) {
                if (!Object.keys(tradeCalcData.walletMap ?? {}).length) {
                    walletMap = makeWalletLayer2().walletMap as WalletMap<any>;
                }
                walletMap = tradeCalcData.walletMap as WalletMap<any>;
            }
            const tradeDataTmp: any = {
                sell: {
                    belong: coinA,
                    tradeValue: _tradeData?.tradeValue ?? 0,
                    balance: walletMap ? walletMap[ coinA ]?.count : 0
                },
                buy: {
                    belong: coinB,
                    tradeValue: _tradeData?.tradeValue ?? 0,
                    balance: walletMap ? walletMap[ coinB ]?.count : 0
                }
            }

            const sellCoinInfoMap = tokenMap[ coinB ].tradePairs?.reduce((prev: any, item: string | number) => {
                return {...prev, [ item ]: coinMap[ item ]}
            }, {} as CoinMap<C>)

            const buyCoinInfoMap = tokenMap[ coinA ].tradePairs?.reduce((prev: any, item: string | number) => {
                return {...prev, [ item ]: coinMap[ item ]}
            }, {} as CoinMap<C>)

            setTradeCalcData((state) => {
                return {
                    ...state,
                    walletMap,
                    coinSell: coinA,
                    coinBuy: coinB,
                    sellCoinInfoMap,
                    buyCoinInfoMap,
                    priceImpact: '',
                    priceImpactColor: 'inherit',
                    minimumReceived: '',
                    StoB: undefined,
                    BtoS: undefined,
                    fee: undefined,
                }
            })
            setTradeData({...tradeDataTmp})

            let {market: market} = sdk.getExistedMarket(marketArray, coinA, coinB);
            setMarket(market);
            updatePageTradeLite({market, tradePair})
            
            myLog('Market change getAmount', market)
            if (account.readyState === AccountStatus.ACTIVATED) {
                getAmount({market})
            }
            setIsSwapLoading(true);
            setPair({coinAInfo: coinMap[ coinA ], coinBInfo: coinMap[ coinB ]})
        }

    }, [tradeCalcData, tradeData, coinMap, tokenMap, marketMap, marketArray, ammMap, setTradeCalcData, setTradeData, setMarket, setPair])


    const callPairDetailInfoAPIs = React.useCallback(async () => {
        if (market && ammMap && LoopringAPI.exchangeAPI) {
            try {
                const {depth, ammPoolSnapshot, tickMap} = await swapDependAsync(market);
                updatePageTradeLite({market, depth, ammPoolSnapshot, tickMap})
            } catch (error) {
                myLog(error, 'go to LER-ETH');
                resetTradeCalcData(undefined, market)
            }
        }

    }, [market, ammMap])
    const reCalculateDataWhenValueChange = React.useCallback((_tradeData, _tradePair?, type?) => {
        const {ammPoolSnapshot, depth, tradePair} = pageTradeLite;

        // @ts-ignore
        myLog('reCalculateDataWhenValueChange depth:_tradePair,market', pageTradeLite, _tradePair, market)
        //checkMarketDataValid(ammPoolSnapshot, tickMap, market, depth) &&
        if (depth && market && _tradePair === tradePair) {

            const coinA = _tradeData.sell.belong
            const coinB = _tradeData.buy.belong

            const isAtoB = type === 'sell'

            let input: any = (isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue)
            input = input === undefined || isNaN(Number(input)) ? 0 : Number(input);
            let slippage = sdk.toBig(_tradeData.slippage && !isNaN(_tradeData.slippage) ? _tradeData.slippage : '0.5').times(100).toString();
            let totalFee = undefined;
            let feeBips = undefined;
            let takerRate = undefined;
            let buyMinAmtInfo = undefined;
            let sellMinAmtInfo = undefined;
            if (amountMap && amountMap[ market as string ] && ammMap) {
                const ammMarket = `AMM-${market}`
                const amount = ammMap[ ammMarket ] ? amountMap[ ammMarket ] : amountMap[ market as string ]

                buyMinAmtInfo = amount[ _tradeData[ 'buy' ].belong as string ];
                sellMinAmtInfo = amount[ _tradeData[ 'sell' ].belong as string ];
                myLog(`buyMinAmtInfo,sellMinAmtInfo: AMM-${market}, ${_tradeData[ 'buy' ].belong}`, buyMinAmtInfo, sellMinAmtInfo)

                takerRate = buyMinAmtInfo ? buyMinAmtInfo.userOrderInfo.takerRate : 0
                feeBips = ammMap[ ammMarket ] ? ammMap[ ammMarket ].__rawConfig__.feeBips : 0
                totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString();
                setSellMinAmt(buyMinAmtInfo?.userOrderInfo.minAmount)
                myLog(`${realMarket} feeBips:${feeBips} takerRate:${takerRate} totalFee: ${totalFee}`)
            }
            const calcTradeParams = sdk.getOutputAmount({
                input: input.toString(),
                sell: coinA,
                buy: coinB,
                isAtoB,
                marketArr: marketArray as string[],
                tokenMap: tokenMap as any,
                marketMap: marketMap as any,
                depth,
                ammPoolSnapshot: ammPoolSnapshot,
                feeBips: feeBips ? feeBips.toString() : '0',
                takerRate: takerRate ? takerRate : '0',
                slipBips: slippage
            })

            const priceImpactObj = getPriceImpactInfo(calcTradeParams)
            // setPriceImpact(priceImpactObj.value ?? 0)
            const _tradeCalcData = {
                priceImpact: priceImpactObj.value,
                priceImpactColor: priceImpactObj.priceImpactColor,
                minimumReceived: getShowStr(calcTradeParams?.amountBOutSlip.minReceivedVal),
                fee: totalFee,
            }

            _tradeData[ isAtoB ? 'buy' : 'sell' ].tradeValue = getShowStr(calcTradeParams?.output)
            updatePageTradeLite({
                market,
                calcTradeParams: {
                    ...calcTradeParams,
                    feeBips: feeBips ? feeBips : 0,
                    takerRate: takerRate ? takerRate : 0,
                } as any,
                priceImpactObj,
                lastStepAt:type,
                feeBips, totalFee, takerRate, sellMinAmtInfo, buyMinAmtInfo
            })
            //setOutput(calcTradeParams)
            setTradeCalcData({...tradeCalcData, ..._tradeCalcData});
            setTradeData({...tradeData, ..._tradeData});

        }


    }, [amountMap, pageTradeLite, tradeCalcData, tradeData, coinMap, tokenMap, marketMap, marketArray])

    const resetSwap = (swapType: SwapType | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined) => {
        switch (swapType) {
            case SwapType.SEll_CLICK:
            case SwapType.BUY_CLICK:
                return
            case SwapType.SELL_SELECTED:
                //type = 'sell'
                if (_tradeData?.sell.belong !== tradeData?.sell.belong) {
                    resetTradeCalcData(_tradeData, `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`, 'sell')
                } else {
                    reCalculateDataWhenValueChange(_tradeData, `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`, 'sell')
                }
                // throttleSetValue('sell', _tradeData)
                break
            case SwapType.BUY_SELECTED:
                //type = 'buy'
                if (_tradeData?.buy.belong !== tradeData?.buy.belong) {
                    resetTradeCalcData(_tradeData, `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`, 'buy')
                } else {
                    reCalculateDataWhenValueChange(_tradeData, `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`, 'buy')
                }
                break
            case SwapType.EXCHANGE_CLICK:

                const _tradeCalcData = {
                    ...tradeCalcData,
                    coinSell: tradeCalcData.coinBuy,
                    coinBuy: tradeCalcData.coinSell,
                    sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
                    buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
                    StoB: tradeCalcData.BtoS,
                    BtoS: tradeCalcData.StoB,
                    priceImpact: undefined,
                    priceImpactColor: 'inherit',
                    minimumReceived: undefined,
                    fee:undefined,
                }

                myLog('Exchange,tradeCalcData', tradeCalcData);
                myLog('Exchange,_tradeCalcData', _tradeCalcData);
                callPairDetailInfoAPIs()
                updatePageTradeLite({market, tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`})
                setTradeCalcData({..._tradeCalcData})
                break;
            default:
                myLog('resetSwap default')
                resetTradeCalcData(undefined, market)
                should15sRefresh()
                break
        }


    }
    // const debugInfo = process.env.NODE_ENV !== 'production' ? {
    //     tradeData,
    //     tradeCalcData: {coinBuy: tradeCalcData?.coinBuy, coinSell: tradeCalcData?.coinSell},
    //     priceImpact: calcTradeParams?.priceImpact,
    //     exceedDepth: calcTradeParams?.exceedDepth ?? false,
    //     amountBOutSlip: calcTradeParams?.amountBOutSlip ? JSON.stringify(calcTradeParams.amountBOutSlip) : '',
    //     market,
    // } : ''
    return {
        toastOpen,
        closeToast,
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
        should15sRefresh,
        refreshRef,
        alertOpen,
        confirmOpen,
        swapFunc,
        pageTradeLite,
        // priceImpact,
        //DEBUG:
        // debugInfo,
        isSwapLoading,
    }

}