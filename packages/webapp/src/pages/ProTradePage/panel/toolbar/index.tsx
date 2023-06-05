import React from "react";
import { TFunction, withTranslation } from "react-i18next";
import * as _ from "lodash";
import {
  CoinInfo,
  ConfigLayout,
  CurrencyToTag,
  DropDownIcon,
  EmptyValueTag,
  getValuePrecisionThousand,
  layoutConfigs as _layoutConfigs,
  MarketType,
  PriceTag,
  SagaStatus,
  SCENARIO,
} from "@loopring-web/common-resources";
import {
  Button,
  InputSearch,
  InputSearchWrapperStyled,
  MarketBlockProps,
  PopoverPure,
  QuoteTable,
  QuoteTableRawDataItem,
  TagIconList,
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
  favoriteMarket as favoriteMarketRD,
  TableProWrapStyled,
  useAccount,
  useNotify,
  useSystem,
  useTicker,
  useTokenMap,
  useTokenPrices,
  volumeToCount,
} from "@loopring-web/core";
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
    layoutConfigs = _layoutConfigs,
    // ,marketTicker
    t,
  }: {
    t: TFunction<"translation">;
    market: MarketType;
    layoutConfigs?: Array<ConfigLayout>;
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
    const { campaignTagConfig } = useNotify().notifyMap ?? {};
    const { ammPoolBalances } = useToolbar();
    const { tickList } = useTickList();
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
    const { forexMap } = useSystem();
    const { tokenPrices } = useTokenPrices();
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

        const basepriceU =
          ticker.close * (tokenPrices[quote] ?? 0) ?? tokenPrices[base] ?? 0;
        setMarketTicker((state: any) => {
          return {
            ...state,
            tradeFloat: ticker,
            base,
            quote,
            isRise,
            baseVol,
            quoteVol,
            basepriceU,
          };
        });
      }
    }, [coinMap, tickerMap, tokenPrices, market]);
    React.useEffect(() => {
      if (tickerStatus === SagaStatus.UNSET && market !== undefined) {
        setDefaultData();
      }
    }, [tickerStatus, market, setDefaultData]);
    const getFilteredTickList = React.useCallback(() => {
      if (tickList && !!tickList.length) {
        return tickList.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`;
          const status = ("00" + marketMap[pair]?.status?.toString(2)).split(
            ""
          );
          return status[status.length - 2] === "1";
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
    }, [tickerStatus, tickList]);

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
                    aria-label="Market Switch Tab"
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
                    forexMap={forexMap as any}
                    campaignTagConfig={campaignTagConfig ?? ({} as any)}
                    account={account}
                    rawData={filteredData}
                    favoriteMarket={favoriteMarket}
                    addFavoriteMarket={addMarket}
                    removeFavoriteMarket={removeMarket}
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
          {campaignTagConfig && (
            <TagIconList
              scenario={SCENARIO.ORDERBOOK}
              campaignTagConfig={campaignTagConfig}
              symbol={market}
            />
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
                {PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (marketTicker.basepriceU || 0) * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    {
                      isFait: true,
                      floor: false,
                      isAbbreviate: true,
                      abbreviate: 6,
                    }
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
