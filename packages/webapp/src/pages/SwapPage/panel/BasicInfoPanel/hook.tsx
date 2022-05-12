import React, { useCallback, useState } from "react";
import moment from "moment";

import {
  Candlestick,
  GetDepthRequest,
  getExistedMarket,
  TradingInterval,
} from "@loopring-web/loopring-sdk";

import { ChartUnit, myLog } from "@loopring-web/common-resources";

import {
  ChartType,
  IGetDepthDataParams,
  TGItemData,
  TGItemJSXInterface,
} from "@loopring-web/component-lib";
import { LoopringAPI } from "@loopring-web/core";

const toggleData: TGItemData[] = [
  {
    value: ChartType.Trend,
    key: ChartType.Trend,
    label: "label" + ChartType.Trend,
  },
  {
    value: ChartType.Depth,
    key: ChartType.Depth,
    label: "label" + ChartType.Depth,
  },
];

export function useBasicInfo(
  props: any,
  coinAInfo: any,
  coinBInfo: any,
  marketArray: any[],
  t: any
) {
  const tgItemJSXs: TGItemJSXInterface[] = toggleData.map(
    ({ value, label, key }) => {
      return { value, tlabel: t(label), key, JSX: <>{t(label)}</> };
    }
  );

  const { market, amm, baseShow, quoteShow } = getExistedMarket(
    marketArray,
    coinAInfo?.name,
    coinBInfo?.name
  );

  const [chartType, setChartType] = useState<ChartType>(ChartType.Trend);

  const [chartUnit, setChartUnit] = useState(ChartUnit.D1);

  const [originData, setOriginData] = useState<any>(undefined);

  const handleChange = useCallback(
    (_e: React.MouseEvent, value: any) => {
      if (value === null) return;
      // Settings.setChartType(value)
      // console.log('useBasicInfo handleChange:', value)
      setOriginData(undefined);
      setChartType(value === "Trend" ? ChartType.Trend : ChartType.Depth);
    },
    [setOriginData, setChartType]
  );

  const handleChartUnitChange = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    newValue: string
  ) => {
    const mappedValue =
      newValue === "1H"
        ? ChartUnit.H1
        : newValue === "1W"
        ? ChartUnit.W1
        : ChartUnit.D1;
    setChartUnit(mappedValue);
  };

  const tgItemJSXsPriceChart: TGItemJSXInterface[] = Object.keys(
    ChartUnit
  ).reduce((pre, item) => {
    // @ts-ignore
    const tGItemData: TGItemData = {
      value: ChartUnit[item],
      key: ChartUnit[item],
      label: "label" + ChartUnit[item],
    };
    pre.push({
      value: tGItemData.value,
      tlabel: t(tGItemData.label ? tGItemData.label : tGItemData.key),
      key: tGItemData.key,
      JSX: <>{t(tGItemData.label ? tGItemData.label : tGItemData.key)}</>,
    });
    return pre;
  }, [] as TGItemJSXInterface[]);
  const updateChartData = React.useCallback(async () => {
    if (!LoopringAPI.exchangeAPI || !market || !amm) {
      return;
    }
    if (chartType === ChartType.Trend) {
      try {
        const candlesticks = await LoopringAPI.exchangeAPI.getMixCandlestick({
          market,
          interval: TradingInterval.d1,
          limit: 30,
        });
        const originData = candlesticks.candlesticks.map(
          (item: Candlestick) => {
            return {
              timeStamp: item.timestamp,
              low: item.low,
              high: item.high,
              open: item.open,
              close: item.close,
              volume: item.quoteVol,
              change: (item.close - item.open) / item.open,
              date: moment(item.timestamp).format("MMM DD"),
            };
          }
        );
        setOriginData(originData);
      } catch (reason: any) {
        myLog(reason);
      }
    } else {
      const request: GetDepthRequest = {
        market,
      };
      try {
        const { depth } = await LoopringAPI.exchangeAPI.getMixDepth(request);
        const originData: IGetDepthDataParams = {
          bidsPrices: depth.bids_prices,
          bidsAmtTotals: depth.bids_amtTotals as any,
          asksPrices: depth.asks_prices,
          asksAmtTotals: depth.asks_amtTotals as any,
        };
        setOriginData(originData);
      } catch (reason: any) {
        myLog(reason);
      }
    }
  }, [market, amm, chartType]);
  React.useEffect(() => {
    updateChartData();
  }, [market, chartType]);
  return {
    baseShow,
    quoteShow,
    chartUnit,
    chartType,
    tgItemJSXs,
    tgItemJSXsPriceChart,
    handleChange,
    originData,
    handleChartUnitChange,
  };
}
