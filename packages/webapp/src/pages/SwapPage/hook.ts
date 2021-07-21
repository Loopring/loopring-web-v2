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
import React, { useState } from 'react';
import { LoopringAPI } from '../../stores/apis/api';
import { useTokenMap } from '../../stores/token';
import * as fm from 'loopring-sdk';
import {
    AmmPoolInfoV3,
    AmmPoolSnapshot,
    dumpError400,
    getExistedMarket,
    GetNextStorageIdRequest,
    LoopringMap,
    OrderType,
    SubmitOrderRequestV3,
    VALID_UNTIL
} from 'loopring-sdk';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useWalletLayer2 } from '../../stores/walletLayer2';
import { RawDataTradeItem, SwapTradeData, SwapType } from '@loopring-web/component-lib';
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
import { debug } from 'console';
import { myLog } from 'utils/log_tools';

export const useSwapPage = <C extends { [ key: string ]: any }>() => {
    /*** api prepare ***/
        // const exchangeApi = exchangeAPI();
    const wait = globalSetup.wait;
    const match: any = useRouteMatch(":symbol")
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap,} = useTokenMap()
    const {ammMap} = useAmmMap();
    // const {setShowConnect, setShowAccountInfo} = useOpenModals();
    // const {ShowDeposit} = useModals()
    const {account} = useAccount()
    const {delayAndUpdateWalletLayer2} = useWalletLayer2();

    const walletLayer2State = useWalletLayer2();
    const [isSwapLoading, setIsSwapLoading] = useState(false)
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

    const feeBips = '60'

    //HIGH: get Router info
    // const symbol = match?.params.symbol ?? undefined;
    React.useEffect(() => {
        const symbol = match?.params.symbol ?? undefined;
        resetSwap(symbol, undefined, undefined, undefined);
        // const label: string | undefined = accountStaticCallBack(bntLabel)
        // setSwapBtnI18nKey(label);
    }, []);
    //TODO tickMap
    // React.useEffect(() => {
    // }, [])

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
                    let {
                        amm,
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

    // React.useEffect(() => {
    //    // const label: string | undefined = accountStaticCallBack(bntLabel)
    //     // setSwapBtnI18nKey(label);
    // }, [])

    // console.log(account.status)

    useCustomDCEffect(() => {
        const label: string | undefined = accountStaticCallBack(bntLabel)
        setSwapBtnI18nKey(label);
    }, [account.status]);
    const swapCalculatorCallback = React.useCallback(async function ({sell, buy, slippage, ...rest}: any) {

        debugger
        const {exchangeInfo} = store.getState().system
        setIsSwapLoading(true);
        if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo
            || account.status !== AccountStatus.ACTIVATED) {
            setIsSwapLoading(false);
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
            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey, account.apiKey)

            myLog(response)

            await delayAndUpdateWalletLayer2()

            setIsSwapLoading(false)
            
            setTradeData({
                ...tradeData,
                ...{
                    sell: {...tradeData?.sell, tradeValue: 0},
                    buy: {...tradeData?.buy, tradeValue: 0},
                }
            } as SwapTradeData<IBData<C>>)

        } catch (reason) {
            setIsSwapLoading(false);
            dumpError400(reason)
        }

        if (rest.__cache__) {
            makeCache(rest.__cache__)
        }
    },[tradeData])
    const swapBtnClickArray: typeof btnClickMap = Object.assign(deepClone(btnClickMap), {
        [ fnType.ACTIVATED ]:[swapCalculatorCallback]
    })
    const onSwapClick = React.useCallback(({sell, buy, slippage, ...rest}: SwapTradeData<IBData<C>>) => {
        debugger
        accountStaticCallBack(swapBtnClickArray, [{sell, buy, slippage, ...rest}])
    }, [swapBtnClickArray])
    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, switchType: any): Promise<void> => {
        //TODO setMarket(market);
        // _.throttle(()=>{
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
        // },wait)

    }

    const calculateTradeData = async (type: 'sell' | 'buy', _tradeData: SwapTradeData<IBData<C>>, ammPoolSnapshot: AmmPoolSnapshot | undefined): Promise<{ _tradeCalcData: TradeCalcData<C>, _tradeData: SwapTradeData<IBData<C>> }> => {
        //if(`${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}` === coinKey)
        if (_tradeData[ type ].tradeValue && tradeCalcData) {
            type === 'sell' ? _tradeData[ 'buy' ].tradeValue = fm.toBig(_tradeData[ 'sell' ].tradeValue).times(tradeCalcData.StoB).toNumber()
                : _tradeData[ 'sell' ].tradeValue = fm.toBig(_tradeData[ 'buy' ].tradeValue).times(tradeCalcData.BtoS).toNumber()
        }
        const market = `${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}`
        const depth = await LoopringAPI.exchangeAPI?.getMixDepth({market})
        if (!marketArray || !tokenMap || !marketMap || !depth || !ammMap || !tradeCalcData) {
            let _tradeCalcData = {...tradeCalcData} as TradeCalcData<C>;
            return {_tradeData, _tradeCalcData}
        }

        const isAtoB = type === 'sell'
        let input: any = (isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue)

        if (input) {
            input = input.toString()
        } else {
            input = '0'
        }

        const base = _tradeData.sell.belong as string
        const quote = _tradeData.buy.belong as string

        let _tradeCalcData = {...tradeCalcData} as TradeCalcData<C>;

        return {_tradeData, _tradeCalcData}
/*
        const output = fm.getOutputAmount(input, base, quote, isAtoB, marketArray, tokenMap,
            marketMap, depth?.depth, {[ 'AMM-' + market ]: ammMap[ 'AMM-' + market ].__rawConfig__} as LoopringMap<AmmPoolInfoV3>,
            ammPoolSnapshot, '6', '200')

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
        */
    }

    const throttleSetValue = React.useCallback(_.debounce(async (type, _tradeData, _ammPoolSnapshot) => {
        const {_tradeData: td, _tradeCalcData} = await calculateTradeData(type, _tradeData, _ammPoolSnapshot)//.then(()=>{
        setTradeData(td)
        setTradeCalcData({..._tradeCalcData, fee: feeBips})

    }, wait * 2), [setTradeData, setTradeCalcData, calculateTradeData]);

    const resetSwap = async (coinKey: any, type: 'sell' | 'buy' | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined, _ammPoolSnapshot: AmmPoolSnapshot | undefined) => {
        if (tradeCalcData
            && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
            && _tradeData
            && type
            && (!tradeData || (tradeData[ type ].tradeValue !== _tradeData[ type ].tradeValue))) {
            // calculateTradeData(type,_tradeData,_ammPoolSnapshot)
            throttleSetValue(type, _tradeData, _ammPoolSnapshot)
            //throttleSetValue(td,_tradeCalcData);

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
        tradeCalcData,
        tradeFloat,
        tradeArray,
        myTradeArray,
        isSwapLoading,
        tradeData,
        pair,
        marketArray,
        onSwapClick,
        swapBtnI18nKey,
        handleSwapPanelEvent
    }

}