import React from "react";
import _ from "lodash";
import {
  AmmDetail,
  CustomError,
  ErrorMap,
  SagaStatus,
  TradeFloat,
  RowConfig,
} from "@loopring-web/common-resources";

import {
  store,
  makeTickView,
  useAmmMap,
  useTokenMap,
  useSocket,
  useTicker,
} from "@loopring-web/core";

import { WsTopicType } from "@loopring-web/loopring-sdk";

// import { tickerService } from 'services/tickerService';
type Row<R> = AmmDetail<R> & { tradeFloat: TradeFloat };
export function useAmmMapUI<
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>() {
  const [rawData, setRawData] = React.useState<Array<Row<R>> | []>([]);
  const [filteredData, setFilteredData] = React.useState<Array<Row<R>> | []>(
    []
  );
  const { coinMap, marketArray } = useTokenMap();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [filterValue, setFilterValue] = React.useState("");
  const [tableHeight, setTableHeight] = React.useState(0);
  const { ammMap } = useAmmMap();
  const { tokenPrices } = store.getState().tokenPrices;
  const { tickerMap, status: tickerStatus } = useTicker();
  const { sendSocketTopic, socketEnd } = useSocket();

  React.useEffect(() => {
    socketSendTicker();
    return () => {
      socketEnd();
    };
  }, []);
  const socketSendTicker = React.useCallback(() => {
    sendSocketTopic({ [WsTopicType.ticker]: marketArray });
  }, []);

  const resetTableData = React.useCallback(
    (tableData) => {
      if (tokenPrices) {
        setFilteredData(tableData);
        setTableHeight(
          RowConfig.rowHeaderHeight + tableData.length * RowConfig.rowHeight
        );
      }
    },
    [setFilteredData, setTableHeight, tokenPrices]
  );
  const updateRawData = React.useCallback(
    (tickerMap) => {
      try {
        const _ammMap: any = _.cloneDeep(ammMap);
        if (_ammMap) {
          for (let tickerMapKey in tickerMap) {
            if (_ammMap["AMM-" + tickerMapKey]) {
              _ammMap["AMM-" + tickerMapKey].tradeFloat = {
                ..._ammMap["AMM-" + tickerMapKey].tradeFloat,
                ...tickerMap[tickerMapKey],
                // APR: _ammMap['AMM-' + tickerMapKey ].APR
              };
            }
          }
          const rawData = Object.keys(_ammMap).map((ammKey: string) => {
            const [_, coinA, coinB] = ammKey.split("-");
            const realMarket = `${coinA}-${coinB}`;
            const _tickerMap = tickerMap[realMarket].__rawTicker__;
            const tickerFloat = makeTickView(_tickerMap ? _tickerMap : {});

            if (coinMap) {
              _ammMap[ammKey]["coinAInfo"] = coinMap[_ammMap[ammKey]["coinA"]];
              _ammMap[ammKey]["coinBInfo"] = coinMap[_ammMap[ammKey]["coinB"]];
            }
            return {
              ..._ammMap[ammKey],
              tradeFloat: {
                ..._ammMap[ammKey].tradtradeFloat,
                volume: tickerFloat?.volume || 0,
              },
            };
          });
          setRawData(rawData);
          resetTableData(rawData);
        }
      } catch (error: any) {
        throw new CustomError({ ...ErrorMap.NO_TOKEN_MAP, options: error });
      }
    },
    [ammMap]
  );
  const sortMethod = React.useCallback(
    (_sortedRows, sortColumn) => {
      let _rawData: Row<R>[] = [];
      switch (sortColumn) {
        case "pools":
          _rawData = filteredData.sort((a, b) => {
            const valueA = a.coinAInfo.simpleName;
            const valueB = b.coinAInfo.simpleName;
            return valueB.localeCompare(valueA);
          });
          break;
        case "liquidity":
          _rawData = filteredData.sort((a, b) => {
            const valueA = a.amountDollar;
            const valueB = b.amountDollar;
            if (valueA && valueB) {
              return valueB - valueA;
            }
            if (valueA && !valueB) {
              return -1;
            }
            if (!valueA && valueB) {
              return 1;
            }
            return 0;
          });
          break;
        case "volume24":
          _rawData = filteredData.sort((a, b) => {
            const priceDollarA = tokenPrices[a.coinAInfo.simpleName] || 0;
            const priceDollarB = tokenPrices[b.coinAInfo.simpleName] || 0;
            const valueA = (a.tradeFloat.volume || 0) * priceDollarA;
            const valueB = (b.tradeFloat.volume || 0) * priceDollarB;
            if (valueA && valueB) {
              return valueB - valueA;
            }
            if (valueA && !valueB) {
              return -1;
            }
            if (!valueA && valueB) {
              return 1;
            }
            return 0;
          });
          break;
        case "APR":
          _rawData = filteredData.sort((a, b) => {
            const valueA = a.APR || 0;
            const valueB = b.APR || 0;
            if (valueA && valueB) {
              return valueB - valueA;
            }
            if (valueA && !valueB) {
              return -1;
            }
            if (!valueA && valueB) {
              return 1;
            }
            return 0;
          });
          break;
        default:
          _rawData = rawData;
      }
      // resetTableData(_rawData)
      return _rawData;
    },
    [filteredData, rawData, tokenPrices]
  );

  React.useEffect(() => {
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    };
  }, [nodeTimer.current]);

  React.useEffect(() => {
    if (tickerStatus === SagaStatus.UNSET) {
      updateRawData(tickerMap);
    }
  }, [tickerStatus]);

  const getFilteredData = React.useCallback(
    (value: string) => {
      setFilterValue(value);
      if (value) {
        const _rawData = rawData.filter((o) => {
          const coinA = o.coinAInfo.name.toLowerCase();
          const coinB = o.coinBInfo.name.toLowerCase();
          const formattedValue = value.toLowerCase();
          return (
            coinA.includes(formattedValue) || coinB.includes(formattedValue)
          );
        });
        resetTableData(_rawData);
      } else {
        resetTableData(rawData);
      }
    },
    [rawData]
  );
  return {
    // page,
    rawData,
    filterValue,
    tableHeight,
    getFilteredData,
    filteredData,
    // updateTickersUI,
    sortMethod,
  };
}
