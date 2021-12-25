import React from "react";
import store from "stores";
import {
  MarketBlockProps,
  QuoteTableRawDataItem,
} from "@loopring-web/component-lib";
import { TradingInterval, WsTopicType } from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "api_wrapper";
import { tickerService } from "services/socket";
import {
  getValuePrecisionThousand,
  myError,
  SagaStatus,
} from "@loopring-web/common-resources";
import _ from "lodash";
import { TickerMap, useTicker } from "stores/ticker";
import { useSocket } from "../../stores/socket";

export function useTickList<C extends { [key: string]: string }>() {
  const [tickList, setTickList] = React.useState<any>([]);
  const [recommendedPairs, setRecommendedPairs] = React.useState<string[]>([]);
  const { marketArray, coinMap, marketMap, tokenMap } =
    store.getState().tokenMap;
  const [recommendations, setRecommendations] = React.useState<
    MarketBlockProps<C>[]
  >([]);
  const { tickerMap, status: tickerStatus } = useTicker();
  const { forex } = store.getState().system;
  const { tokenPrices } = store.getState().tokenPrices;
  const getRecommendPairs = React.useCallback(async () => {
    if (LoopringAPI.exchangeAPI) {
      try {
        const { recommended } =
          await LoopringAPI.exchangeAPI.getRecommendedMarkets();
        setRecommendedPairs(recommended);
        return recommended || [];
      } catch (e) {
        myError(e);
      }
      return [];
    }
  }, [setRecommendedPairs]);
  const updateRecommendation = React.useCallback(
    (recommendationIndex, ticker) => {
      if (recommendations.length) {
        recommendations[recommendationIndex].tradeFloat = ticker;
        setRecommendations(recommendations);
      }
    },
    [recommendations, setRecommendations]
  );
  const updateRawData = React.useCallback(
    async (tickerMap: TickerMap<C>) => {
      const marketPairs: string[] = await getRecommendPairs();
      let _recommendationsFloat: QuoteTableRawDataItem[] = [];
      let defaultRecommendationsFloat: QuoteTableRawDataItem[] = [];
      const _tickList =
        tickerMap && Object.keys(tickerMap)
          ? Reflect.ownKeys(tickerMap).reduce((prev, key) => {
              // @ts-ignore
              const [, coinA, coinB] = key.match(/(\w+)-(\w+)/i);
              const ticker = tickerMap[key as string];
              const coinAPriceDollar =
                ticker.close * (tokenPrices[coinB] ?? 0) ??
                tokenPrices[coinB] ??
                0;
              const coinAPriceYuan = coinAPriceDollar * forex;
              let _item = {
                ...ticker,
                pair: {
                  coinA,
                  coinB,
                },
                coinAPriceDollar:
                  getValuePrecisionThousand(
                    coinAPriceDollar,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    { isFait: true }
                  ) || 0,
                coinAPriceYuan:
                  getValuePrecisionThousand(
                    coinAPriceYuan,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    { isFait: true }
                  ) || 0,
              } as QuoteTableRawDataItem;

              if (marketPairs.findIndex((m) => m === key) !== -1) {
                _recommendationsFloat.push(_.cloneDeep(_item));
              }
              if (
                marketArray &&
                marketArray.findIndex((m) => m === key) !== -1
              ) {
                defaultRecommendationsFloat.push(_.cloneDeep(_item));
              }
              prev.push(_item);
              return prev;
            }, [] as QuoteTableRawDataItem[])
          : [];

      const newTickListWithPrecision = _tickList.map((o: any) => {
        const pair = o.__rawTicker__.symbol;
        const precision = marketMap
          ? marketMap[pair]?.precisionForPrice
          : undefined;
        return {
          ...o,
          precision,
        };
      });

      setTickList(newTickListWithPrecision);
      _recommendationsFloat = _recommendationsFloat.filter((o) => {
        const { coinA, coinB } = o.pair;
        return coinMap && coinMap[coinA] && coinMap[coinB];
      });

      if (_recommendationsFloat.length < 4) {
        const filteredFloat = defaultRecommendationsFloat.filter((o) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`;
          return !marketPairs.includes(pair);
        });
        _recommendationsFloat = _recommendationsFloat.concat(
          filteredFloat.slice(0, 4 - _recommendationsFloat.length)
        );
      }

      while (_recommendationsFloat.length < 4) {
        _recommendationsFloat.push(_.cloneDeep(_recommendationsFloat[0]));
      }

      const _recommendations = _recommendationsFloat.reduce((prev, item) => {
        if (coinMap && item) {
          const { coinA, coinB } = item.pair;
          const _item: MarketBlockProps<C> = {
            tradeFloat: item as any,
            // @ts-ignore
            coinAInfo: coinMap[coinA],
            // @ts-ignore
            coinBInfo: coinMap[coinB],
          } as MarketBlockProps<C>;
          prev.push(_item);
        }
        return prev;
      }, [] as MarketBlockProps<C>[]);

      const _recommendationsWithPrecision = _recommendations.map((o) => {
        const pair = o.tradeFloat["__rawTicker__"]?.symbol;
        const coinB = o.tradeFloat["pair"]?.coinB;
        const marketPrecision = marketMap
          ? marketMap[pair]?.precisionForPrice
          : undefined;
        const coinBPrecision = tokenMap
          ? tokenMap[coinB]?.precision
          : undefined;
        return {
          ...o,
          tradeFloat: {
            ...o.tradeFloat,
            marketPrecision,
            coinBPrecision,
          },
        };
      });

      setRecommendations(_recommendationsWithPrecision);
    },
    [
      coinMap,
      forex,
      getRecommendPairs,
      marketArray,
      marketMap,
      tokenMap,
      tokenPrices,
    ]
  );

  React.useEffect(() => {
    if (tickerStatus === SagaStatus.UNSET) {
      updateRawData(tickerMap as TickerMap<C>);
    }
  }, [tickerStatus]);
  return {
    recommendedPairs,
    tickList,
    tickerMap,
    updateRecommendation,
    recommendations,
    updateRawData,
    getRecommendPairs,
  };
}

export function useQuote<C extends { [key: string]: string }>() {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { marketArray } = store.getState().tokenMap;
  const {
    recommendedPairs,
    tickList,
    recommendations,
    tickerMap,
    getRecommendPairs,
    updateRecommendation,
  } = useTickList();
  const subject = React.useMemo(() => tickerService.onSocket(), []);

  React.useEffect(() => {
    const subscription = subject.subscribe(({ tickerMap }) => {
      socketCallback();
    });
    return () => subscription.unsubscribe();
  }, [subject]);

  const socketCallback = React.useCallback(() => {
    if (tickerMap && recommendedPairs) {
      Reflect.ownKeys(tickerMap).forEach((key) => {
        let recommendationIndex = recommendedPairs.findIndex(
          (ele) => ele === key
        );
        if (recommendationIndex !== -1) {
          updateRecommendation(recommendationIndex, tickerMap[key as string]);
        }
        //TODO update related row. use socket return
      });
    }
  }, [recommendedPairs, updateRecommendation, tickerMap]);

  React.useEffect(() => {
    getRecommendPairs();
  }, [getRecommendPairs]);

  React.useEffect(() => {
    socketSendTicker();
    return () => {
      socketEnd();
    };
  }, []);

  const socketSendTicker = React.useCallback(() => {
    sendSocketTopic({ [WsTopicType.ticker]: marketArray });
  }, [marketArray, sendSocketTopic]);

  return {
    tickList,
    recommendations,
  };
}

export type CandlestickItem = {
  close: number;
  timeStamp: number;
};

export const useCandlestickList = (market: string) => {
  const [candlestickList, setCandlestickList] = React.useState<
    CandlestickItem[]
  >([]);
  const getCandlestick = React.useCallback(async (market: string) => {
    if (LoopringAPI.exchangeAPI) {
      const res = await LoopringAPI.exchangeAPI.getMixCandlestick({
        market: market,
        interval: TradingInterval.d1,
        limit: 7,
      });
      if (res && res.candlesticks && !!res.candlesticks.length) {
        const data = res.candlesticks.map((o) => ({
          close: o.close,
          timeStamp: o.timestamp,
        }));
        setCandlestickList(data);
      }
      setCandlestickList([]);
    }
    setCandlestickList([]);
  }, []);

  React.useEffect(() => {
    getCandlestick(market);
  }, [getCandlestick, market]);

  return candlestickList;
};
