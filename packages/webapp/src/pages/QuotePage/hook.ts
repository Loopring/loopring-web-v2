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
  useTokenPrices,
  useTokenMap,
  useSystem,
} from "@loopring-web/core";
import { useHistory } from "react-router-dom";
import { TableFilterParams } from "./index";

export function useTickList<C extends { [key: string]: string }>() {
  const [tickList, setTickList] = React.useState<any>([]);
  const {
    marketArray,
    coinMap,
    marketMap,
    tokenMap,
    status: tokenMapStatus,
  } = useTokenMap();

  const { forexMap } = useSystem();
  const { tickerMap, status: tickerStatus } = useTicker();
  const { tokenPrices } = useTokenPrices();
  const updateRawData = React.useCallback(async () => {
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
            let _item: QuoteTableRawDataItem = {
              ...ticker,
              pair: {
                coinA,
                coinB,
              },
              coinAPriceDollar,
            } as QuoteTableRawDataItem;

            if (marketArray && marketArray.findIndex((m) => m === key) !== -1) {
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
    while (_recommendationsFloat.length < 4) {
      _recommendationsFloat.push(_.cloneDeep(_recommendationsFloat[0]));
    }
  }, [
    coinMap,
    forexMap,
    marketArray,
    marketMap,
    tokenMap,
    tokenPrices,
    tickerMap,
  ]);

  React.useEffect(() => {
    if (
      tickerStatus === SagaStatus.UNSET &&
      tokenMapStatus === SagaStatus.UNSET
    ) {
      updateRawData();
    }
  }, [tickerStatus, tokenMapStatus]);
  return {
    tickList,
    tickerMap,
    updateRawData,
  };
}

export function useQuote<C extends { [key: string]: string }>() {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { marketArray } = store.getState().tokenMap;
  const { tickList, tickerMap } = useTickList();
  const subject = React.useMemo(() => tickerService.onSocket(), []);

  const socketCallback = React.useCallback(() => {}, [tickerMap]);
  React.useEffect(() => {
    const subscription = subject.subscribe(({ tickerMap }) => {
      socketCallback();
    });
    return () => subscription.unsubscribe();
  }, [subject]);

  const socketSendTicker = React.useCallback(() => {
    sendSocketTopic({ [WsTopicType.ticker]: marketArray });
  }, [marketArray, sendSocketTopic]);

  React.useEffect(() => {
    socketSendTicker();
    return () => {
      socketEnd();
    };
  }, []);

  return {
    tickList,
  };
}

export const useQuotePage = ({ tableRef }: { tableRef: React.Ref<any> }) => {
  const { status: tickerStatus } = useTicker();
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

  const { tickList } = useQuote();
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
    [handleCurrentScroll, tableRef]
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
  }, [currentScroll]);

  // React.useEffect(() => {
  //   const list = recommendations.map((item) => {
  //     return `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`;
  //   });
  //   if (!!list.length) {
  //     getMixCandlestick(list[0]);
  //     getMixCandlestick(list[1]);
  //     getMixCandlestick(list[2]);
  //     getMixCandlestick(list[3]);
  //   }
  // }, [recommendations]);

  const getAmmPoolBalances = React.useCallback(async () => {
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
  }, []);

  React.useEffect(() => {
    getSwapRankingList();
  }, []);

  let history = useHistory();

  // prevent amm risky pair
  const getFilteredTickList = React.useCallback(() => {
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

  React.useEffect(() => {
    if (
      tickerStatus === SagaStatus.UNSET &&
      ammPoolBalances.length &&
      tickList.length
    ) {
      const data = getFilteredTickList();
      resetTableData(data);
    }
  }, [ammPoolBalances, tickerStatus, tickList]);

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
    [
      tickList,
      resetTableData,
      favoriteMarket,
      swapRankingList,
      getFilteredTickList,
    ]
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

  return {
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
