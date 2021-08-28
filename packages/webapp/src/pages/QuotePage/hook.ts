import React, { useCallback, } from "react"
import store from '../../stores';
import { TickerMap, useTicker } from '../../stores/ticker';
import { MarketBlockProps, QuoteTableRawDataItem, } from '@loopring-web/component-lib';
import { deepClone } from '../../utils/obj_tools';
import { useSocket } from '../../stores/socket';
import { TradingInterval, WsTopicType } from 'loopring-sdk';
import { LoopringAPI } from 'api_wrapper'
import { tickerService } from 'services/socket';
import { myError, myLog } from "utils/log_tools";

const amtCol = 5
const OnePageSize = 16;
const rowHeight = 44;

// 0
function isNeedCallMore(currentStartIndex: number, to: number, marketArrayLength: number, currentListLength: number, pageSize: number = OnePageSize): boolean {
    const pageCurrent = currentStartIndex / OnePageSize
    if (to - pageCurrent > 1) {
        return false
    } else if (pageSize * to < marketArrayLength && currentListLength - 4 < pageSize * (to + 1)) {
        return true
    } else {
        return false
    }
}

export function useQuote<C extends { [ key: string ]: string }>() {


    const {
        tickerMap,
        status: tickerStatus,
        // errorMessage: errorTickerMap,
        statusUnset: tickerStatusUnset,
        updateTickers,
    } = useTicker();
    const {sendSocketTopic, socketEnd} = useSocket();
    const [recommendedPairs, setRecommendedPairs] = React.useState<string[]>([])
    const {marketArray, coinMap} = store.getState().tokenMap;
    // const recommendMarkets: string[] = marketArray && recommendedPairs.length === 4 ? recommendedPairs : []
    // const recommendMarkets: string[] = ['LRC-USDC', 'LRC-ETH', 'ETH-USDC', 'USDC-USDT']
    // const _marketArrayWithOutRecommend = marketArray ? marketArray.filter(item => recommendMarkets.findIndex(m => m === item) === -1) : [];
    // const _marketArrayWithOutRecommend = marketArray ? marketArray.filter(item => recommendedPairs.findIndex(m => m === item) === -1) : [];
    const [tickList, setTickList] = React.useState<any>([]);
    const [recommendations, setRecommendations] = React.useState<MarketBlockProps<C>[]>([]);
    // const [, setTickerKeys] = React.useState<string[]>([]);
    // const [focusRowFrom, setFocusRowFrom] = React.useState<[start: number, end: number]>([0, 2]);
    // const [startIndex, setStartIndex] = React.useState<number>(-1);
    // const recommendMarkets: string[] = marketArray ? marketArray.slice(0, 4) : ['LRC-ETH', 'LRC-ETH', 'LRC-ETH', 'LRC-ETH']

    const subject = React.useMemo(() => tickerService.onSocket(), []);

    const updateRecommendation = React.useCallback((recommendationIndex, ticker) => {
        if (recommendations.length) {
            //  let _recommendations = deepClone(recommendations)
            recommendations[ recommendationIndex ].tradeFloat = ticker
            setRecommendations(recommendations)
        }
    }, [recommendations]);

    React.useEffect(() => {
        const subscription = subject.subscribe(({tickerMap}) => {
            myLog('tickerMap:', tickerMap)
            if (tickerMap) {
                Reflect.ownKeys(tickerMap).forEach((key) => {
                    let recommendationIndex = recommendedPairs.findIndex(ele => ele === key)
                    if (recommendationIndex !== -1) {
                        // setRecommendations
                        updateRecommendation(recommendationIndex, tickerMap[ key as string ])
                    }
                    //TODO update related row. use socket return
                })
            }
        });
        return () => subscription.unsubscribe();
    }, [subject, recommendedPairs]);

    const getRecommandPairs = useCallback(async () => {
        if (LoopringAPI.exchangeAPI) {
            try {
                const {recommended} = await LoopringAPI.exchangeAPI.getRecommendedMarkets()
                setRecommendedPairs(recommended)
                return recommended || []
            } catch (e) {
                myError(e)
            }
            return []
            // const { recommended } = await LoopringAPI.exchangeAPI.getRecommendedMarkets()
            // console.log(recommended)
            // setRecommendedPairs(recommended)
            // return recommended
        }
    }, [])

    React.useEffect(() => {
        getRecommandPairs()
    }, [getRecommandPairs])


    //TODO if socket is error throw use recall will pending on it
    // React.useEffect(() => {
    //     switch (socketStatus) {
    //         case "ERROR":
    //             console.log("ERROR", 'open websocket error get moment value from api ');
    //             socketStatusUnset();
    //             updateTickers(tickerKeys);
    //             break;
    //         default:
    //             break;
    //     }
    // }, [socketStatus, socketStatusUnset]);
    React.useEffect(() => {
        // const [from, to] = focusRowFrom
        getTicker();
        socketSendTicker();
        return () => {
            socketEnd()
        }
    }, []);
    React.useEffect(() => {
        switch (tickerStatus) {
            case "ERROR":
                console.log("ERROR", 'get ticker error,ui');
                tickerStatusUnset()
                break;
            case "PENDING":
                break;
            case "DONE":
                tickerStatusUnset();
                updateRawData(tickerMap as TickerMap<C>);
                break;
            default:
                break;
        }
    }, [tickerStatus, tickerStatusUnset]);

    const getTicker = React.useCallback(() => {
        // if (_marketArrayWithOutRecommend) {
        // let array = _marketArrayWithOutRecommend.slice(from * OnePageSize, to * OnePageSize);
        // let array = _marketArrayWithOutRecommend; // 暂时获取全量数据
        //High: add recommendations market first time is 36个数据
        // if (from === 0) {
        //     array = recommendMarkets.concat(array)
        // }
        // updateTickers(array);
        // }
        updateTickers(marketArray || []);

    }, [marketArray, OnePageSize])

    const updateRawData = React.useCallback(async (tickerMap: TickerMap<C>) => {
        const marketPairs: string[] = await getRecommandPairs()
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
            } as QuoteTableRawDataItem;

            if (marketPairs.findIndex(m => m === key) !== -1) {
                _recommendationsFloat.push(deepClone(_item))
            }
            if (marketArray && marketArray.findIndex(m => m === key) !== -1) {
                defaultRecommendationsFloat.push(deepClone(_item))
            }
            prev.push(_item);
            return prev
        }, [] as QuoteTableRawDataItem[]) : []

        setTickList([...tickList, ..._tickList])
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
            _recommendationsFloat.push(deepClone(_recommendationsFloat[ 0 ]))
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

        setRecommendations(_recommendations)
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
