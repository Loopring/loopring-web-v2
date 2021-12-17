import React, { useCallback, useEffect } from "react";
import styled from "@emotion/styled/macro";

import {
  InputSearch,
  MarketBlock,
  MarketBlockProps,
  QuoteTable,
  QuoteTableRawDataItem,
} from "@loopring-web/component-lib";
import { WithTranslation, withTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import * as _ from "lodash";
import { RowConfig } from "@loopring-web/common-resources";
import { Box, Container, Divider, Grid, Tab, Tabs } from "@mui/material";
import { useQuote } from "./hook";
import { LoopringAPI } from "api_wrapper";
import {
  AmmPoolActivityRule,
  TradingInterval,
} from "@loopring-web/loopring-sdk";
import { TableWrapStyled } from "pages/styled";
import { useFavoriteMarket } from "stores/localStore/favoriteMarket";
import { useAmmActivityMap } from "stores/Amm/AmmActivityMap";
import { LAYOUT } from "../../defs/common_defs";

const RowStyled = styled(Grid)`
  & .MuiGrid-root:not(:last-of-type) > div {
    // margin-right: ${({ theme }) => theme.unit * 2}px;
  }
` as typeof Grid;

export enum TableFilterParams {
  all = "all",
  favourite = "favourite",
  ranking = "ranking",
}

export const QuotePage = withTranslation("common")((rest: WithTranslation) => {
  const [candlestickList, setCandlestickList] = React.useState<any[]>([]);
  const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([]);
  const [tableTabValue, setTableTabValue] = React.useState("all");
  const [filteredData, setFilteredData] = React.useState<
    QuoteTableRawDataItem[]
  >([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [swapRankingList, setSwapRankingList] = React.useState<
    AmmPoolActivityRule[]
  >([]);
  const [tableHeight, setTableHeight] = React.useState(0);
  const { favoriteMarket, removeMarket, addMarket } = useFavoriteMarket();
  const { t } = rest;
  const tableRef = React.useRef<HTMLDivElement>();
  const { ammActivityMap } = useAmmActivityMap();
  const tradeRaceList = (
    ammActivityMap?.SWAP_VOLUME_RANKING?.InProgress || []
  ).map((o) => o.market);

  const resetTableData = React.useCallback(
    (tableData) => {
      setFilteredData(tableData);
      setTableHeight(
        RowConfig.rowHeaderHeight + tableData.length * RowConfig.rowHeight
      );
    },
    [setFilteredData, setTableHeight]
  );

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

  const getCandlestick = React.useCallback(async (market: string) => {
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

  const { recommendations, tickList /* onVisibleRowsChange */ } = useQuote();
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
  React.useEffect(() => {
    window.addEventListener("scroll", currentScroll);
    return () => {
      window.removeEventListener("scroll", currentScroll);
    };
  }, []);

  React.useEffect(() => {
    const list = recommendations.map((item) => {
      const market = `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`;
      return market;
    });
    if (!!list.length) {
      getCandlestick(list[0]);
      getCandlestick(list[1]);
      getCandlestick(list[2]);
      getCandlestick(list[3]);
    }
  }, [recommendations, getCandlestick]);

  const getAmmPoolBalances = useCallback(async () => {
    if (LoopringAPI.ammpoolAPI) {
      const ammRes = await LoopringAPI.ammpoolAPI?.getAmmPoolBalances();
      const fomattedRes = ammRes.raw_data.map((o: any) => ({
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

  // const handleRecommendationJump = React.useCallback((market: string) => {
  //   if (!market) {
  //     return
  //   }
  //   history && history.push({
  //     pathname: `/trade/lite/${market}`
  //   })
  // }, [history])
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

  return (
    <Box display={"flex"} flexDirection={"column"} flex={1}>
      <RowStyled container spacing={2}>
        {/* give default value to have empty block render */}
        {(!!recommendations.length
          ? recommendations
          : ([
              {
                coinAInfo: {
                  simpleName: "",
                },
                coinBInfo: {
                  simpleName: "",
                },
              },
              {
                coinAInfo: {
                  simpleName: "",
                },
                coinBInfo: {
                  simpleName: "",
                },
              },
              {
                coinAInfo: {
                  simpleName: "",
                },
                coinBInfo: {
                  simpleName: "",
                },
              },
              {
                coinAInfo: {
                  simpleName: "",
                },
                coinBInfo: {
                  simpleName: "",
                },
              },
            ] as MarketBlockProps<{
              [key: string]: string;
            }>[])
        ).map((item, index) => (
          <Grid
            key={`${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}-${index}`}
            item
            xs={12}
            sm={6}
            lg={3}
          >
            <MarketBlock
              {...{
                ...formattedRecommendations[index],
                tradeFloat: getTradeFloatVolumeToCount(
                  formattedRecommendations[index]?.tradeFloat
                ),
                chartData: formattedRecommendations[index]
                  ? formattedRecommendations[index].chartData
                  : [],
                handleBlockClick: () =>
                  handleRecommendBoxClick(formattedRecommendations[index]),
                ...rest,
              }}
            ></MarketBlock>
          </Grid>
        ))}
      </RowStyled>
      <TableWrapStyled
        ref={tableRef as any}
        marginY={3}
        paddingBottom={1}
        flex={1}
        className={"MuiPaper-elevation2"}
      >
        <Box display={"flex"} flexDirection={"column"}>
          <Container className={"toolbar"}>
            <Box
              paddingLeft={1}
              paddingRight={2}
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Tabs
                value={tableTabValue}
                onChange={handleTabChange}
                aria-label="disabled tabs example"
              >
                <Tab label={t("labelQuotePageFavourite")} value="favourite" />
                <Tab label={t("labelAll")} value="all" />
                {/* <Tab label={t('labelQuotePageTradeRanking')} value="tradeRanking"/> */}
              </Tabs>
              <InputSearch value={searchValue} onChange={handleSearchChange} />
            </Box>
            <Divider style={{ marginTop: "-1px" }} />
          </Container>

          <QuoteTable /* onVisibleRowsChange={onVisibleRowsChange} */
            onRowClick={(index: any, row: any, col: any) => handleRowClick(row)}
            rawData={filteredData}
            favoriteMarket={favoriteMarket}
            addFavoriteMarket={addMarket}
            removeFavoriteMarket={removeMarket}
            currentheight={tableHeight}
            rowHeight={RowConfig.rowHeight}
            headerRowHeight={RowConfig.rowHeaderHeight}
            tradeRaceList={tradeRaceList}
            {...{ showLoading: tickList && !tickList.length, ...rest }}
          />
        </Box>
      </TableWrapStyled>
    </Box>
  );
});

// export default QuotePage
