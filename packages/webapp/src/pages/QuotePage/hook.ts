import React, { useCallback, } from "react"
import store from 'stores';
import { MarketBlockProps, QuoteTableRawDataItem, } from '@loopring-web/component-lib';
import { useSocket } from 'stores/socket';
import { TradingInterval, WsTopicType } from 'loopring-sdk';
import { LoopringAPI } from 'api_wrapper'
import { tickerService } from 'services/socket';
import { myError, SagaStatus, } from "@loopring-web/common-resources";
import _ from 'lodash'
import { TickerMap, useTicker } from 'stores/ticker';

// const OnePageSize = 16;

export function useQuote<C extends { [ key: string ]: string }>() {



    const {sendSocketTopic, socketEnd} = useSocket();
    const [recommendedPairs, setRecommendedPairs] = React.useState<string[]>([])
    const {marketArray, coinMap, marketMap, tokenMap} = store.getState().tokenMap;
    const {forex} = store.getState().system
    const {tokenPrices} = store.getState().tokenPrices
    const {tickerMap,status:tickerStatus} = useTicker();
    const [tickList, setTickList] = React.useState<any>([]);
    const [recommendations, setRecommendations] = React.useState<MarketBlockProps<C>[]>([]);
    const subject = React.useMemo(() => tickerService.onSocket(), []);

    const updateRecommendation = React.useCallback((recommendationIndex, ticker) => {
        if (recommendations.length) {
            //  let _recommendations = deepClone(recommendations)
            // console.log('updateRecommendation ticker:', ticker)
            recommendations[ recommendationIndex ].tradeFloat = ticker
            setRecommendations(recommendations)
        }
    }, [recommendations, setRecommendations]);

    React.useEffect(() => {
        const subscription = subject.subscribe(({tickerMap}) => {
            socketCallback()
        });
        return () => subscription.unsubscribe();
    }, [subject]);
    
    const socketCallback= React.useCallback(()=>{
        if (tickerMap && recommendedPairs) {
            Reflect.ownKeys(tickerMap).forEach((key) => {
                let recommendationIndex = recommendedPairs.findIndex(ele => ele === key)
                if (recommendationIndex !== -1) {
                    // setRecommendations
                    updateRecommendation(recommendationIndex, tickerMap[ key as string ])
                }
                //TODO update related row. use socket return
            })
        }
    },[recommendedPairs,updateRecommendation,tickerMap])

    const getRecommendPairs = useCallback(async () => {
        if (LoopringAPI.exchangeAPI) {
            try {
                const {recommended} = await LoopringAPI.exchangeAPI.getRecommendedMarkets()
                setRecommendedPairs(recommended)
                return recommended || []
            } catch (e) {
                myError(e)
            }
            return []

        }
    }, [setRecommendedPairs])

    React.useEffect(() => {
        getRecommendPairs()
    }, [getRecommendPairs])

    React.useEffect(() => {
        socketSendTicker();
        return () => {
            socketEnd()
        }
    }, []);

    React.useEffect(() => {
        if(tickerStatus === SagaStatus.UNSET) {
            updateRawData(tickerMap as TickerMap<C>);
        }
    }, [tickerStatus]);




    const updateRawData = React.useCallback(async (tickerMap: TickerMap<C>) => {
        const marketPairs: string[] = await getRecommendPairs()
        let _recommendationsFloat: QuoteTableRawDataItem[] = [];
        let defaultRecommendationsFloat: QuoteTableRawDataItem[] = []
        const _tickList = tickerMap && Object.keys(tickerMap) ? Reflect.ownKeys(tickerMap).reduce((prev, key) => {
            // @ts-ignore
            const [, coinA, coinB] = key.match(/(\w+)-(\w+)/i);
            let _item = {
                ...tickerMap[ key as string ],
                pair: {
                    coinA,
                    coinB,
                },
                // precision: marketMap ? marketMap[] : undefined,
                coinAPriceDollar: tokenPrices[coinA] || 0,
                coinAPriceYuan: (tokenPrices[coinA] || 0) * (forex || 6.5),
            } as QuoteTableRawDataItem;

            if (marketPairs.findIndex(m => m === key) !== -1) {
                _recommendationsFloat.push(_.cloneDeep(_item))
            }
            if (marketArray && marketArray.findIndex(m => m === key) !== -1) {
                defaultRecommendationsFloat.push(_.cloneDeep(_item))
            }
            prev.push(_item);
            return prev
        }, [] as QuoteTableRawDataItem[]) : []
        // const newTickList = [...tickList, ..._tickList]
        // const newTickList = _tickList
        const newTickListWithPrecision = _tickList.map((o: any) => {
            const pair = o.__rawTicker__.symbol
            const precision = marketMap ? marketMap[pair]?.precisionForPrice : undefined
            return ({
                ...o,
                precision,
            })
        })

        setTickList(newTickListWithPrecision)
        //setTickList
        // if (focusRowFrom[ 0 ] === 0 && _recommendationsFloat.length > 0) {
        // if (focusRowFrom[ 0 ] === 0) {
        _recommendationsFloat = _recommendationsFloat.filter(o => {
            const {coinA, coinB} = o.pair
            return (coinMap && coinMap[ coinA ] && coinMap[ coinB ])
        })

        //FIX: fix in uat env not enough pair_recommendations
        if (_recommendationsFloat.length < 4) {
            const filteredFloat = defaultRecommendationsFloat.filter(o => {
                const pair = `${o.pair.coinA}-${o.pair.coinB}`
                return !marketPairs.includes(pair)
            })
            _recommendationsFloat = _recommendationsFloat.concat(filteredFloat.slice(0, 4 - _recommendationsFloat.length));
        }

        // case uat only
        while (_recommendationsFloat.length < 4) {
            _recommendationsFloat.push(_.cloneDeep(_recommendationsFloat[ 0 ]))
        }

        const _recommendations = _recommendationsFloat.reduce((prev, item) => {
            if (coinMap && item) {
                const {coinA, coinB} = item.pair;
                const _item: MarketBlockProps<C> = {
                    tradeFloat: item as any,
                    // @ts-ignore
                    coinAInfo: coinMap[ coinA ],
                    // @ts-ignore
                    coinBInfo: coinMap[ coinB ]
                } as MarketBlockProps<C>
                prev.push(_item)
            }
            return prev
        }, [] as MarketBlockProps<C>[])

        // let _recommendationsWithPrecision = _.cloneDeep(_recommendations)
        const _recommendationsWithPrecision = _recommendations.map(o => {
            const pair = o.tradeFloat['__rawTicker__']?.symbol
            const coinB = o.tradeFloat['pair']?.coinB
            const marketPrecision = marketMap ? marketMap[pair]?.precisionForPrice : undefined
            const coinBPrecision = tokenMap ? tokenMap[coinB]?.precision : undefined
            return ({
                ...o,
                tradeFloat: {
                    ...o.tradeFloat,
                    marketPrecision,
                    coinBPrecision,
                }
            })
        } )


        setRecommendations(_recommendationsWithPrecision)
        // }
    }, [tickList])


    // const  = (startIndex: number) => {
    //     console.log(startIndex)
    // }

    // const debounceGetTicker = React.useCallback(debounce((from, to) => {
    //     getTicker(from, to)
    // }, globalSetup.wait), [])

    const socketSendTicker = React.useCallback(() => {
        sendSocketTopic({[ WsTopicType.ticker ]: marketArray});
    }, [])

    return {
        tickList,
        recommendations,
        // tableRef,
        // handleScroll,
        // onVisibleRowsChange
    }

}

export type CandlestickItem = {
    close: number;
    timeStamp: number;
}

export const useCandlestickList = (market: string) => {
    const [candlestickList, setCandlestickList] = React.useState<CandlestickItem[]>([])
    const getCandlestick = React.useCallback(async (market: string) => {
        if (LoopringAPI.exchangeAPI) {
            const res = await LoopringAPI.exchangeAPI.getMixCandlestick({
                market: market,
                interval: TradingInterval.d1,
                // start?: number;
                // end?: number;
                limit: 7
            })
            if (res && res.candlesticks && !!res.candlesticks.length) {
                const data = res.candlesticks.map(o => ({
                    close: o.close,
                    timeStamp: o.timestamp
                }))
                setCandlestickList(data)
            }
            setCandlestickList([])
        }
        setCandlestickList([])
    }, [])

    React.useEffect(() => {
        getCandlestick(market)
    }, [getCandlestick, market])

    return candlestickList
}
