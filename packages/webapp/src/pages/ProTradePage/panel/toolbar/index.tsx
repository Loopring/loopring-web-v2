import React from "react";
import { TFunction, withTranslation } from "react-i18next";
import * as _ from "lodash";
import {
  AmmRankIcon,
  CoinInfo,
  DropDownIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  layoutConfigs,
  MarketType,
  PriceTag,
  SagaStatus,
  TrophyIcon,
} from "@loopring-web/common-resources";
import {
  Button,
  InputSearch,
  MarketBlockProps,
  PopoverPure,
  QuoteTable,
  QuoteTableRawDataItem,
  useSettings,
} from "@loopring-web/component-lib";

import {
  Box,
  ClickAwayListener,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { bindTrigger } from "material-ui-popup-state/es";

import styled from "@emotion/styled";
import { Currency } from "@loopring-web/loopring-sdk";
import { Layout, Layouts } from "react-grid-layout";
import {
  useTicker,
  useTokenMap,
  volumeToCount,
  useTokenPrices,
  useSystem,
  favoriteMarket as favoriteMarketRD,
  useAmmActivityMap,
  useAccount,
} from "@loopring-web/core";
import { TableProWrapStyled } from "pages/styled";
import { useToolbar } from "./hook";
import { useHistory } from "react-router-dom";
import { useTickList } from "../../../QuotePage/hook";

const PriceTitleStyled = styled(Typography)`
  color: var(--color-text-third);
  font-size: 1.2rem;
`;

const PriceValueStyled = styled(Typography)`
  font-size: 1.2rem;
`;

const InputSearchWrapperStyled = styled(Box)`
  padding: ${({ theme }) => theme.unit * 2}px;
  padding-bottom: 0;
`;

export enum TableFilterParams {
  all = "all",
  favourite = "favourite",
  ranking = "ranking",
}

export const Toolbar = withTranslation("common")(
  <C extends { [key: string]: any }>({
    market,
    handleLayoutChange,
    handleOnMarketChange,
    // ,marketTicker
    t,
  }: {
    t: TFunction<"translation">;
    market: MarketType;
    handleLayoutChange: (
      currentLayout: Layout[],
      allLayouts?: Layouts,
      layouts?: Layouts
    ) => void;

    handleOnMarketChange: (newMarket: MarketType) => void;
  }) => {
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    const { coinMap, marketMap, tokenMap } = useTokenMap();
    const { tickerMap, status: tickerStatus } = useTicker();
    const { favoriteMarket, removeMarket, addMarket } =
      favoriteMarketRD.useFavoriteMarket();
    const { ammPoolBalances } = useToolbar();
    const { tickList } = useTickList();
    const { activityInProgressRules } = useAmmActivityMap();
    const { account } = useAccount();
    const [filteredData, setFilteredData] = React.useState<
      QuoteTableRawDataItem[]
    >([]);
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [tableTabValue, setTableTabValue] = React.useState("all");
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [marketTicker, setMarketTicker] = React.useState<
      (MarketBlockProps<C> & any) | undefined
    >({
      coinAInfo: coinMap[coinA] as CoinInfo<C>,
      coinBInfo: coinMap[coinB] as CoinInfo<C>,
      tradeFloat: tickerMap[market],
    });
    const { currency } = useSettings();
    const { forex } = useSystem();
    const { tokenPrices } = useTokenPrices();
    const history = useHistory();

    const isUSD = currency === Currency.usd;

    const getMarketPrecision = React.useCallback(
      (market: string) => {
        if (marketMap) {
          return marketMap[market]?.precisionForPrice;
        }
        return undefined;
      },
      [marketMap]
    );

    const getTokenPrecision = React.useCallback(
      (token: string) => {
        if (tokenMap) {
          return tokenMap[token]?.precision;
        }
        return undefined;
      },
      [tokenMap]
    );
    React.useEffect(() => {
      if (tickerStatus === SagaStatus.UNSET) {
        setDefaultData();
      }
    }, [tickerStatus, market]);
    const setDefaultData = React.useCallback(() => {
      if (
        coinMap &&
        tickerMap &&
        tokenPrices &&
        tickerMap[market] &&
        tickerMap[market].__rawTicker__
      ) {
        const ticker = tickerMap[market];
        const base: string = ticker.__rawTicker__?.base ?? "";
        const quote: string = ticker.__rawTicker__?.quote ?? "";
        const baseVol = volumeToCount(
          base,
          ticker.__rawTicker__?.base_token_volume || 0
        );

        const quoteVol = volumeToCount(
          quote,
          ticker.__rawTicker__?.quote_token_volume || 0
        );
        const isRise = ticker.floatTag === "increase";

        const basePriceDollar =
          ticker.close * (tokenPrices[quote] ?? 0) ?? tokenPrices[base] ?? 0;
        const basePriceYuan = basePriceDollar * forex;
        setMarketTicker((state: any) => {
          return {
            ...state,
            tradeFloat: ticker,
            base,
            quote,
            isRise,
            baseVol,
            quoteVol,
            basePriceDollar: getValuePrecisionThousand(
              basePriceDollar,
              undefined,
              undefined,
              undefined,
              true,
              { isFait: true }
            ),
            basePriceYuan: getValuePrecisionThousand(
              basePriceYuan,
              undefined,
              undefined,
              undefined,
              true,
              { isFait: true }
            ),
          };
        });
      }
    }, [coinMap, tickerMap, tokenPrices, market, forex]);

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
    const { isMobile } = useSettings();
    const resetTableData = React.useCallback(
      (tableData) => {
        setFilteredData(tableData);
      },
      [setFilteredData]
    );

    React.useEffect(() => {
      const data = getFilteredTickList();
      resetTableData(data);
    }, [getFilteredTickList, resetTableData]);

    const handleTableFilterChange = React.useCallback(
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
        data = data.filter((o: any) => {
          const formattedKeyword = keyword?.toLocaleLowerCase();
          const coinA = o.pair.coinA.toLowerCase();
          const coinB = o.pair.coinB.toLowerCase();
          if (keyword === "") {
            return true;
          }
          return (
            coinA?.includes(formattedKeyword) ||
            coinB?.includes(formattedKeyword)
          );
        });
        if (type === TableFilterParams.all && !keyword) {
          data = getFilteredTickList();
        }
        resetTableData(data);
      },
      [tickList, resetTableData, favoriteMarket, getFilteredTickList]
    );

    const handleTabChange = React.useCallback(
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

    const handleSearchChange = React.useCallback((value) => {
      setSearchValue(value);
    }, []);

    React.useEffect(() => {
      const type =
        tableTabValue === "favourite"
          ? TableFilterParams.favourite
          : tableTabValue === "tradeRanking"
          ? TableFilterParams.ranking
          : TableFilterParams.all;
      handleTableFilterChange({ keyword: searchValue, type: type });
    }, [
      searchValue,
      handleSearchChange,
      tableTabValue,
      handleTableFilterChange,
    ]);

    const popState = usePopupState({
      variant: "popover",
      popupId: `popup-pro-toolbar-markets`,
    });

    const handleClickAway = React.useCallback(() => {
      popState.setOpen(false);
      setIsDropdownOpen(false);
      setSearchValue("");
    }, [popState]);

    return (
      <Box
        display={"flex"}
        alignItems={"center"}
        height={"100%"}
        paddingX={2}
        justifyContent={"space-between"}
      >
        <Box alignItems={"center"} display={"flex"}>
          <Box
            display={"flex"}
            alignItems={"center"}
            fontSize={"1.6rem"}
            {...bindTrigger(popState)}
            onClick={(e: any) => {
              bindTrigger(popState).onClick(e);
              setIsDropdownOpen(true);
              if (tableTabValue === "favourite") {
                handleTabChange(_, "favourite");
              }
            }}
            style={{ cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {market}
            <DropDownIcon
              htmlColor={"var(--color-text-third)"}
              style={{
                marginBottom: 2,
                transform: isDropdownOpen ? "rotate(0.5turn)" : "rotate(0)",
              }}
            />
          </Box>

          <PopoverPure
            className={"arrow-center no-arrow"}
            {...bindPopper(popState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box>
                <InputSearchWrapperStyled>
                  <InputSearch
                    fullWidth
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </InputSearchWrapperStyled>
                <Box
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
                    <Tab
                      label={t("labelQuotePageFavourite")}
                      value="favourite"
                    />
                    <Tab label={t("labelAll")} value="all" />
                  </Tabs>
                </Box>
                <Divider style={{ marginTop: "-1px" }} />
                <TableProWrapStyled width={isMobile ? "360px" : "580px"}>
                  <QuoteTable
                    isPro
                    account={account}
                    rawData={filteredData}
                    favoriteMarket={favoriteMarket}
                    addFavoriteMarket={addMarket}
                    removeFavoriteMarket={removeMarket}
                    activityInProgressRules={activityInProgressRules}
                    onRowClick={(_: any, row: any) => {
                      handleOnMarketChange(
                        `${row.pair.coinA}-${row.pair.coinB}` as MarketType
                      );
                      popState.setOpen(false);
                      setIsDropdownOpen(false);
                      setSearchValue("");
                    }}
                  />
                </TableProWrapStyled>
              </Box>
            </ClickAwayListener>
          </PopoverPure>
          {activityInProgressRules &&
            activityInProgressRules[market] &&
            activityInProgressRules[market].ruleType.map(
              (ruleType: any, index: number) => (
                <Box
                  key={ruleType.toString() + index}
                  style={{ cursor: "pointer", paddingTop: 4 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    const date = new Date(
                      activityInProgressRules[market].rangeFrom
                    );
                    const year = date.getFullYear();
                    const month = (
                      "0" + (date.getMonth() + 1).toString()
                    ).slice(-2);
                    const day = ("0" + date.getDate().toString()).slice(-2);
                    const current_event_date = `${year}-${month}-${day}`;

                    history.push(
                      `/race-event/${current_event_date}?pair=${market}&type=${ruleType}&owner=${account?.accAddress}`
                    );
                  }}
                >
                  <TrophyIcon />
                </Box>
              )
            )}
          {activityInProgressRules && activityInProgressRules[`AMM-${market}`] && (
            <Box
              marginLeft={1 / 2}
              style={{ cursor: "pointer", paddingTop: 4 }}
              onClick={(event) => {
                event.stopPropagation();
                const date = new Date(
                  activityInProgressRules[`AMM-${market}`].rangeFrom
                );
                const year = date.getFullYear();
                const month = ("0" + (date.getMonth() + 1).toString()).slice(
                  -2
                );
                const day = ("0" + date.getDate().toString()).slice(-2);
                const current_event_date = `${year}-${month}-${day}`;
                history.push(
                  `/race-event/${current_event_date}?pair=${market}&type=${
                    activityInProgressRules[`AMM-${market}`].ruleType[0]
                  }&owner=${account?.accAddress}`
                );
              }}
            >
              <AmmRankIcon style={{ marginBottom: 5 }} />
            </Box>
          )}
          <Grid
            container
            spacing={3}
            marginLeft={0}
            display={"flex"}
            alignItems={"center"}
          >
            <Grid item>
              <Typography
                fontWeight={500}
                color={
                  !marketTicker?.tradeFloat?.close
                    ? "var(--color-text-primary)"
                    : marketTicker.isRise
                    ? "var(--color-success)"
                    : "var(--color-error)"
                }
              >
                {marketTicker?.tradeFloat?.close ?? EmptyValueTag}
              </Typography>
              <PriceValueStyled>
                {isUSD ? PriceTag.Dollar : PriceTag.Yuan}
                {getValuePrecisionThousand(
                  isUSD
                    ? marketTicker.basePriceDollar
                    : marketTicker.basePriceYuan,
                  undefined,
                  undefined,
                  undefined,
                  true,
                  { isFait: true }
                )}
              </PriceValueStyled>
            </Grid>
            <Grid item>
              <PriceTitleStyled>
                {t("labelProToolbar24hChange")}
              </PriceTitleStyled>
              <PriceValueStyled
                color={
                  marketTicker.isRise
                    ? "var(--color-success)"
                    : "var(--color-error)"
                }
              >
                {`${marketTicker.isRise ? "+" : ""} ${getValuePrecisionThousand(
                  marketTicker?.tradeFloat?.change,
                  undefined,
                  undefined,
                  2,
                  true
                )}%`}
              </PriceValueStyled>
            </Grid>
            {!isMobile && (
              <Grid item>
                <PriceTitleStyled>
                  {t("labelProToolbar24hHigh")}
                </PriceTitleStyled>
                <PriceValueStyled>
                  {getValuePrecisionThousand(
                    marketTicker?.tradeFloat?.high,
                    undefined,
                    undefined,
                    getMarketPrecision(market),
                    true,
                    { isPrice: true }
                  )}
                </PriceValueStyled>
              </Grid>
            )}
            {!isMobile && (
              <Grid item>
                <PriceTitleStyled>
                  {t("labelProToolbar24hLow")}
                </PriceTitleStyled>
                <PriceValueStyled>
                  {getValuePrecisionThousand(
                    marketTicker?.tradeFloat?.low,
                    undefined,
                    undefined,
                    getMarketPrecision(market),
                    true,
                    { isPrice: true }
                  )}
                </PriceValueStyled>
              </Grid>
            )}
            {!isMobile && (
              <Grid item>
                <PriceTitleStyled>
                  {t("labelProToolbar24hBaseVol", {
                    symbol: marketTicker.base,
                  })}
                </PriceTitleStyled>
                <PriceValueStyled>
                  {getValuePrecisionThousand(
                    marketTicker.baseVol,
                    undefined,
                    undefined,
                    getTokenPrecision(marketTicker.base),
                    true,
                    { isPrice: true }
                  )}
                </PriceValueStyled>
              </Grid>
            )}
            {!isMobile && (
              <Grid item>
                <PriceTitleStyled>
                  {t("labelProToolbar24hQuoteVol", {
                    symbol: marketTicker.quote,
                  })}
                </PriceTitleStyled>
                <PriceValueStyled>
                  {getValuePrecisionThousand(
                    marketTicker.quoteVol,
                    undefined,
                    undefined,
                    getTokenPrecision(marketTicker.quote),
                    true,
                    { isPrice: true }
                  )}
                </PriceValueStyled>
              </Grid>
            )}
          </Grid>
        </Box>
        <Box>
          <Button
            onClick={() => {
              handleLayoutChange([], undefined, layoutConfigs[0].layouts);
            }}
          >
            {isMobile ? t("labelResetMobileLayout") : t("labelResetLayout")}
          </Button>
        </Box>
      </Box>
    );
  }
);
