import React, { useCallback } from "react";

import { QuoteTableRawDataItem } from "@loopring-web/component-lib";
import { WsTopicType } from "@loopring-web/loopring-sdk";

import { myLog, RowConfig, SagaStatus } from "@loopring-web/common-resources";
import _ from "lodash";
import {
  favoriteMarket as favoriteMarketReducer,
  LAYOUT,
  LoopringAPI,
  store,
  tickerService,
  useNotify,
  useSocket,
  useSystem,
  useTicker,
  useTokenMap,
  useTokenPrices,
} from "@loopring-web/core";
import { useHistory } from "react-router-dom";
import { useMarket } from "../ProTradePage/panel/spot/hookMarket";

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
            const coinApriceU =
              ticker.close * (tokenPrices[coinB] ?? 0) ??
              tokenPrices[coinB] ??
              0;
            let _item: QuoteTableRawDataItem = {
              ...ticker,
              pair: {
                coinA,
                coinB,
              },
              coinApriceU,
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
  const { tickList } = useTickList();
  const subject = React.useMemo(() => tickerService.onSocket(), []);

  React.useEffect(() => {
    const subscription = subject.subscribe(({ tickerMap }) => {});
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

export enum TableFilterParams {
  all = "all",
  favourite = "favourite",
}

export const useQuotePage = ({ tableRef }: { tableRef: React.Ref<any> }) => {
  const { status: tickerStatus } = useTicker();
  const { marketMap } = useTokenMap();
  const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([]);
  const [tableTabValue, setTableTabValue] = React.useState(
    TableFilterParams.all
  );
  const { campaignTagConfig } = useNotify().notifyMap ?? {};
  const [searchValue, setSearchValue] = React.useState<string>("");

  const [filteredData, setFilteredData] = React.useState<
    QuoteTableRawDataItem[]
  >([]);
  const [tableHeight, setTableHeight] = React.useState(0);

  const { favoriteMarket, removeMarket, addMarket } =
    favoriteMarketReducer.useFavoriteMarket();

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

  let history = useHistory();

  // prevent amm risky pair
  const getFilteredTickList = React.useCallback(() => {
    if (tickList && !!tickList.length) {
      return tickList.filter((o: any) => {
        const pair = `${o.pair.coinA}-${o.pair.coinB}`;
        const status = ("00" + marketMap[pair]?.status?.toString(2)).split("");
        if (status[status.length - 2] === "1") {
          return true;
        } else if (
          status[status.length - 1] === "1" &&
          ammPoolBalances.find((o) => o.poolName === pair)
        ) {
          return !ammPoolBalances.find((o) => o.poolName === pair).risky;
        }
      });
    }
    return [];
  }, [tickList, ammPoolBalances, marketMap]);

  React.useEffect(() => {
    if (tickerStatus === SagaStatus.UNSET && tickList.length) {
      // const data = getFilteredTickList();
      handleTableFilterChange({});
    }
  }, [ammPoolBalances, tickerStatus, tickList]);

  const handleTableFilterChange = React.useCallback(
    ({
      type = tableTabValue,
      keyword = searchValue,
    }: {
      type?: TableFilterParams;
      keyword?: string;
    }) => {
      let data = _.cloneDeep(tickList);
      // myLog("tickList", data);
      if (type === TableFilterParams.favourite) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`;
          return favoriteMarket?.includes(pair);
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
      tableTabValue,
      resetTableData,
      favoriteMarket,
      // swapRankingList,
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
    (_event: any, newValue: TableFilterParams) => {
      // if (tickList?.length) {
      setTableTabValue(newValue);
      handleTableFilterChange({
        keyword: searchValue,
        type: newValue,
      });
      // }
    },
    [handleTableFilterChange, searchValue]
  );

  const handleSearchChange = React.useCallback(
    (value) => {
      setSearchValue(value);
      handleTableFilterChange({ keyword: value, type: tableTabValue });
    },
    [handleTableFilterChange, tableTabValue]
  );

  return {
    campaignTagConfig,
    tableTabValue,
    handleTabChange,
    searchValue,
    removeMarket,
    favoriteMarket,
    handleSearchChange,
    addMarket,
    showLoading: !tickList?.length,
    tickList,
    filteredData,
    tableHeight,
    handleRowClick,
  };
};
