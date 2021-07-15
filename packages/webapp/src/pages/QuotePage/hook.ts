import React from "react"
import store from '../../stores';
import { TickerMap, useTicker } from '../../stores/ticker';
import { MarketBlockProps, QuoteTableRawDataItem, } from '@loopring-web/component-lib';
import { deepClone } from '../../utils/obj_tools';
import { useSocket } from '../../stores/socket';
import { TradingInterval, WsTopicType } from 'loopring-sdk';
import { LoopringAPI } from 'stores/apis/api'
import { tickerService } from '../../services/tickerService';
import { debounce } from "lodash"
import { globalSetup } from '@loopring-web/common-resources';

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
    const {marketArray, coinMap} = store.getState().tokenMap;
    const recommendMarkets: string[] = marketArray ? marketArray.slice(0, 4) : ['LRC-ETH', 'LRC-ETH', 'LRC-ETH', 'LRC-ETH']
    const _marketArrayWithOutRecommend = marketArray ? marketArray.filter(item => recommendMarkets.findIndex(m => m === item) === -1) : [];
    const [tickList, setTickList] = React.useState<any>([]);
    const [recommendations, setRecommendations] = React.useState<MarketBlockProps<C>[]>([]);
    const [, setTickerKeys] = React.useState<string[]>([]);
    const [focusRowFrom, setFocusRowFrom] = React.useState<[start: number, end: number]>([0, 2]);
    const [startIndex, setStartIndex] = React.useState<number>(-1);

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
            if (tickerMap) {
                Reflect.ownKeys(tickerMap).forEach((key) => {
                    let recommendationIndex = recommendMarkets.findIndex(ele => ele === key)
                    if (recommendationIndex !== -1) {
                        // setRecommendations
                        updateRecommendation(recommendationIndex, tickerMap[ key as string ])
                    }
                    //TODO update related row. use socket return
                })
            }
        });
        return () => subscription.unsubscribe();
    }, [subject,recommendations]);


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
        const [from, to] = focusRowFrom
        getTicker(from, to);
        socketSendTicker(from*OnePageSize);
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
                updateRawData(tickerMap as TickerMap<C>)
                break;
            default:
                break;
        }
    }, [tickerStatus, tickerStatusUnset]);
    const getTicker = React.useCallback((from: number, to: number) => {
        if (_marketArrayWithOutRecommend) {
            let array = _marketArrayWithOutRecommend.slice(from * OnePageSize, to * OnePageSize);
            //High: add recommendations market first time is 36个数据
            if (from === 0) {
                array = recommendMarkets.concat(array)
            }
            updateTickers(array);
        }


    }, [marketArray, OnePageSize, recommendMarkets])

    const updateRawData = React.useCallback((tickerMap: TickerMap<C>) => {
        let _recommendationsFloat: QuoteTableRawDataItem[] = [];
        const _tickList = Reflect.ownKeys(tickerMap).reduce((prev, key) => {
            // @ts-ignore
            const [, coinA, coinB] = key.match(/(\w+)-(\w+)/i);
            let _item = {
                ...tickerMap[ key as string ],
                pair: {
                    coinA,
                    coinB,
                },
            } as QuoteTableRawDataItem;

            if (recommendMarkets.findIndex(m => m === key) !== -1) {
                _recommendationsFloat.push(deepClone(_item))
            }
            prev.push(_item);
            return prev
        }, [] as QuoteTableRawDataItem[])
        setTickList([...tickList, ..._tickList])
        //setTickList
        if (focusRowFrom[ 0 ] === 0 && _recommendationsFloat.length > 0) {
            //FIX: fix in uat env not enough pair_recommendations
            while (_recommendationsFloat.length < 4) {
                _recommendationsFloat.push(deepClone(_recommendationsFloat[ 0 ]));
            }

            const _recommendations = _recommendationsFloat.reduce((prev, item) => {
                if (coinMap) {
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
        }
    }, [tickList, focusRowFrom])


    // const  = (startIndex: number) => {
    //     console.log(startIndex)
    // }
    const debounceGetTicker = React.useCallback(debounce((from, to) => {
        getTicker(from, to)
    }, globalSetup.wait), [])
    const socketSendTicker = React.useCallback(debounce((_startIndex: number, pageSize = OnePageSize) => {
        if(_startIndex !== startIndex)  {
            let marketArray: string[] = _marketArrayWithOutRecommend.slice(_startIndex, _startIndex + pageSize);
            marketArray = [...recommendMarkets, ...marketArray];
            setTickerKeys(marketArray);
            //High:
            sendSocketTopic({[ WsTopicType.ticker ]: marketArray});
        }
    }, globalSetup.wait * 2), [startIndex])
    const onVisibleRowsChange = React.useCallback(async (startIndex: number) => {
        //TODO isBottom and is On prev tickerCall
        // if (!isAtBottom(startIndex,focusRowFrom[1],_marketArrayWithOutRecommend.length,OnePageSize)
        //     && tickerStatus !== 'PENDING'){
        // }
        //TODO load more
        const [, to] = focusRowFrom
        if (isNeedCallMore(startIndex, to, _marketArrayWithOutRecommend.length, tickList.length, OnePageSize)) {
            console.log('getNextPage.......')
            setFocusRowFrom([to, to + 1]);
            debounceGetTicker(to, to + 1);
        }
        setStartIndex(startIndex);
        socketSendTicker(startIndex, OnePageSize)
    }, [focusRowFrom, OnePageSize, tickerStatus, marketArray, tickList])

    return {
        tickList,
        recommendations,
        // handleScroll,
        onVisibleRowsChange
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
