import React, { useCallback, useEffect } from "react";

import {
  MarketBlockProps,
  QuoteTableRawDataItem,
} from "@loopring-web/component-lib";
import {
  AmmPoolActivityRule,
  TradingInterval,
  WsTopicType,
} from "@loopring-web/loopring-sdk";

import { myError, RowConfig, SagaStatus } from "@loopring-web/common-resources";
import _ from "lodash";
import {
  store,
  LoopringAPI,
  tickerService,
  favoriteMarket as favoriteMarketReducer,
  useAmmActivityMap,
  LAYOUT,
  TickerMap,
  useTicker,
  useSocket,
} from "@loopring-web/core";
import { useHistory } from "react-router-dom";
import { TableFilterParams } from "./index";

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
        return recommended;
      } catch (e: any) {
        myError(e);
      }
      return [] as string[];
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
      const marketPairs: string[] = (await getRecommendPairs()) ?? [];
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
              let _item: QuoteTableRawDataItem = {
                ...ticker,
                pair: {
                  coinA,
                  coinB,
                },
                coinAPriceDollar,
                coinAPriceYuan,
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

export const useQuotePage = ({ tableRef }: { tableRef: React.Ref<any> }) => {
  // const { t } = useTranslation("common");
  const [candlestickList, setCandlestickList] = React.useState<any[]>([]);
  const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([]);
  const [tableTabValue, setTableTabValue] = React.useState("all");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [swapRankingList, setSwapRankingList] = React.useState<
    AmmPoolActivityRule[]
  >([]);
  const [filteredData, setFilteredData] = React.useState<
    QuoteTableRawDataItem[]
  >([]);
  const [tableHeight, setTableHeight] = React.useState(0);

  const { favoriteMarket, removeMarket, addMarket } =
    favoriteMarketReducer.useFavoriteMarket();
  const { activityInProgressRules } = useAmmActivityMap();

  const getSwapRankingList = React.useCallback(async () => {
    if (LoopringAPI.ammpoolAPI) {
      const res = await LoopringAPI.ammpoolAPI.getAmmPoolActivityRules();
      if (
        res &&
        res.groupByRuleType &&
        res.groupByRuleType.SWAP_VOLUME_RANKING &&
        !!res.groupByRuleType.SWAP_VOLUME_RANKING.length
      ) {
        setSwapRankingList(res.groupByRuleType.SWAP_VOLUME_RANKING);
      }
    }
  }, []);

  const getMixCandlestick = React.useCallback(async (market: string) => {
    if (LoopringAPI.exchangeAPI) {
      const res = await LoopringAPI.exchangeAPI.getMixCandlestick({
        market: market,
        interval: TradingInterval.d1,
        limit: 30,
      });
      if (res && res.candlesticks && !!res.candlesticks.length) {
        const data = res.candlesticks.map((o) => ({
          timeStamp: o.timestamp,
          low: o.low,
          high: o.high,
          open: o.open,
          close: o.close,
          // volume: o.baseVol,
          volume: o.quoteVol,
          sign: o.close < o.open ? -1 : 1,
        }));
        setCandlestickList((prev) => [
          ...prev,
          {
            market: market,
            data: data,
          },
        ]);
      }
    }
  }, []);

  const { recommendations, tickList } = useQuote();
  const handleCurrentScroll = React.useCallback((currentTarget, tableRef) => {
    if (currentTarget && tableRef.current) {
      const calcHeight =
        tableRef.current?.offsetTop -
        LAYOUT.HEADER_HEIGHT -
        currentTarget.scrollY;
      if (calcHeight < 2) {
        tableRef.current.classList.add("fixed");
      } else {
        tableRef.current.classList.remove("fixed");
      }
    }
  }, []);
  const currentScroll = React.useCallback(
    (event) => {
      handleCurrentScroll(event.currentTarget, tableRef);
    },
    [tableRef]
  );
  const resetTableData = React.useCallback(
    (tableData) => {
      setFilteredData(tableData);
      setTableHeight(
        RowConfig.rowHeaderHeight + tableData.length * RowConfig.rowHeight
      );
    },
    [setFilteredData, setTableHeight]
  );
  React.useEffect(() => {
    window.addEventListener("scroll", currentScroll);
    return () => {
      window.removeEventListener("scroll", currentScroll);
    };
  }, []);

  React.useEffect(() => {
    const list = recommendations.map((item) => {
      return `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`;
    });
    if (!!list.length) {
      getMixCandlestick(list[0]);
      getMixCandlestick(list[1]);
      getMixCandlestick(list[2]);
      getMixCandlestick(list[3]);
    }
  }, [recommendations, getMixCandlestick]);

  const getAmmPoolBalances = useCallback(async () => {
    if (LoopringAPI.ammpoolAPI) {
      const ammRes = await LoopringAPI.ammpoolAPI?.getAmmPoolBalances<any[]>();
      const fomattedRes = ammRes?.raw_data.map((o: any) => ({
        ...o,
        poolName: o.poolName.replace("AMM-", ""),
      }));
      setAmmPoolBalances(fomattedRes);
    }
  }, []);

  React.useEffect(() => {
    getAmmPoolBalances();
  }, [getAmmPoolBalances]);

  React.useEffect(() => {
    getSwapRankingList();
  }, [getSwapRankingList]);

  let history = useHistory();

  // prevent amm risky pair
  const getFilteredTickList = useCallback(() => {
    if (!!ammPoolBalances.length && tickList && !!tickList.length) {
      return tickList.filter((o: any) => {
        const pair = `${o.pair.coinA}-${o.pair.coinB}`;
        if (ammPoolBalances.find((o) => o.poolName === pair)) {
          return !ammPoolBalances.find((o) => o.poolName === pair).risky;
        }
        return true;
      });
    }
    return [];
  }, [tickList, ammPoolBalances]);

  useEffect(() => {
    const data = getFilteredTickList();
    resetTableData(data);
  }, [getFilteredTickList]);

  const handleTableFilterChange = useCallback(
    ({
      type = TableFilterParams.all,
      keyword = "",
    }: {
      type?: TableFilterParams;
      keyword?: string;
    }) => {
      let data = _.cloneDeep(tickList);
      if (type === TableFilterParams.favourite) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`;
          return favoriteMarket?.includes(pair);
        });
      }
      if (type === TableFilterParams.ranking) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`;
          return swapRankingList.find((o) => o.market === pair);
        });
      }
      data = data.filter((o: any) => {
        const formattedKeyword = keyword?.toLocaleLowerCase();
        const coinA = o.pair.coinA.toLowerCase();
        const coinB = o.pair.coinB.toLowerCase();
        if (keyword === "") {
          return true;
        }
        return (
          coinA?.includes(formattedKeyword) || coinB?.includes(formattedKeyword)
        );
      });
      if (type === TableFilterParams.all && !keyword) {
        data = getFilteredTickList();
      }
      resetTableData(data);
    },
    [getFilteredTickList, favoriteMarket, swapRankingList, tickList]
  );

  const handleRowClick = useCallback(
    (row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair;
      const tradePair = `${coinA}-${coinB}`;
      history &&
        history.push({
          pathname: `/trade/lite/${tradePair}`,
        });
    },
    [history]
  );

  const handleTabChange = useCallback(
    (_event: any, newValue: string) => {
      setTableTabValue(newValue);
      handleTableFilterChange({
        type:
          newValue === "favourite"
            ? TableFilterParams.favourite
            : newValue === "tradeRanking"
            ? TableFilterParams.ranking
            : TableFilterParams.all,
        keyword: searchValue,
      });
    },
    [handleTableFilterChange, searchValue]
  );

  const handleSearchChange = React.useCallback(
    (value) => {
      setSearchValue(value);
      const type =
        tableTabValue === "favourite"
          ? TableFilterParams.favourite
          : tableTabValue === "tradeRanking"
          ? TableFilterParams.ranking
          : TableFilterParams.all;
      handleTableFilterChange({ keyword: value, type: type });
    },
    [handleTableFilterChange, tableTabValue]
  );

  const formattedRecommendations = recommendations.map((item) => {
    const market = `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`;
    return {
      ...item,
      market,
      chartData: candlestickList
        .find((o) => o.market === market)
        ?.data.sort((a: any, b: any) => a.timeStamp - b.timeStamp),
    };
  });

  const handleRecommendBoxClick = React.useCallback(
    (recommendation: any) => {
      if (recommendation && recommendation.market) {
        history &&
          history.push({
            pathname: `/trade/lite/${recommendation.market}`,
          });
      }
    },
    [history]
  );

  const getTradeFloatVolumeToCount = React.useCallback((tradeFloat: any) => {
    return {
      ...tradeFloat,
      volume: tradeFloat ? tradeFloat.volume : 0,
    };
  }, []);

  return {
    recommendations,
    formattedRecommendations,
    getTradeFloatVolumeToCount,
    handleRecommendBoxClick,
    tableTabValue,
    handleTabChange,
    searchValue,
    removeMarket,
    favoriteMarket,
    activityInProgressRules,
    handleSearchChange,
    addMarket,
    tickList,
    filteredData,
    tableHeight,
    handleRowClick,
  };
};
