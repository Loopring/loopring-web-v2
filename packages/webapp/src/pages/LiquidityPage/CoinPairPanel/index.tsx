import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AmmRecordTable,
  ChartType,
  ScaleAreaChart,
  TradeTitle,
  useSettings,
} from "@loopring-web/component-lib";
import {
  abbreviateNumber,
  AvatarCoinStyled,
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
  RowConfig,
  SoursURL,
} from "@loopring-web/common-resources";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { AmmPanelView } from "../AmmPanel";
import styled from "@emotion/styled/";
import { useAmmPool, useCoinPair } from "./hooks";
import { StylePaper } from "pages/styled";
import { Currency } from "@loopring-web/loopring-sdk";
import { makeTickView, useAccount } from "@loopring-web/core";

//**************useAmmPool****** page code ************************//
const BoxWrapperStyled = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit * 2}px;
  width: var(--swap-box-width);
  box-sizing: border-box;
`;

const TabsStyled = styled(Tabs)`
  padding-left: ${({ theme }) => theme.unit}px;
`;

const applyProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
};

export const CoinPairPanel = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    ...rest
  }: WithTranslation) => {
    const {
      ammMarketArray,
      ammTotal,
      myAmmMarketArray,
      ammUserTotal,
      isMyAmmLoading,
      isRecentLoading,
      getUserAmmPoolTxs,
      getRecentAmmPoolTxs,
      activityInProgressRules,
      isMobile,
      tokenPrices,
      currency,
      coinJson,
      forex,
    } = useAmmPool();
    const {
      tradeFloat,
      snapShotData,
      pair,
      coinPairInfo,
      walletMap,
      pairHistory,
      stob,
      btos,
      tickerMap,
    } = useCoinPair();
    const { account } = useAccount();
    const [tabIndex, setTabIndex] = React.useState<0 | 1>(0);
    const realMarket = `${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}`;
    const _tickerMap = tickerMap[realMarket]?.__rawTicker__;
    const tickerFloat = makeTickView(_tickerMap ? _tickerMap : {});
    const coinAIcon: any = coinJson[coinPairInfo.myCoinA?.simpleName];
    const coinBIcon: any = coinJson[coinPairInfo.myCoinB?.simpleName];
    const precisionA = coinPairInfo["precisionA"] || undefined;
    const precisionB = coinPairInfo["precisionB"] || undefined;
    const container = React.useRef(null);
    const tableHeight =
      RowConfig.rowHeaderHeight +
      (tabIndex === 0 ? 15 : 14) * RowConfig.rowHeight;

    const handleTabsChange = React.useCallback((_: any, value: 0 | 1) => {
      setTabIndex(value);
    }, []);

    const priceCoinADollar =
      pair.coinAInfo?.simpleName && tokenPrices
        ? tokenPrices[pair.coinAInfo?.simpleName]
        : 0;
    const priceCoinAYuan = priceCoinADollar * (forex || 6.5);
    const totalAmountValueCoinA =
      (tickerFloat?.volume || 0) *
      (currency === Currency.usd ? priceCoinADollar : priceCoinAYuan);
    const render24hVolume =
      (currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan) +
      (totalAmountValueCoinA >= 1000000
        ? abbreviateNumber(totalAmountValueCoinA, 2)
        : getValuePrecisionThousand(
            totalAmountValueCoinA,
            undefined,
            undefined,
            undefined,
            true,
            { isFait: true, floor: false }
          ));

    return (
      <Box
        flex={1}
        display={"flex"}
        flexDirection={!isMobile ? "row" : "column"}
        alignItems={!isMobile ? "flex-start" : "center"}
      >
        {!isMobile && (
          <Box
            display={"flex"}
            flex={1}
            marginRight={3}
            alignContent={"stretch"}
            flexDirection={"column"}
            flexWrap={"nowrap"}
          >
            <Box marginTop={0}>
              <TradeTitle
                accoun={account}
                {...{
                  baseShow: coinPairInfo.myCoinA?.simpleName,
                  quoteShow: coinPairInfo.myCoinB?.simpleName,
                  t,
                  ...rest,
                  ...(pair as any),
                  tradeFloat,
                  isNew: false,
                  activityInProgressRules,
                }}
              />
            </Box>

            <Box
              marginTop={3}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"space-between"}
            >
              <Box
                width={"100%"}
                height={"var(--chart-height)"}
                maxHeight={420}
              >
                <ScaleAreaChart
                  type={ChartType.Trend}
                  data={pairHistory}
                  extraInfo={pair.coinBInfo?.simpleName}
                  showXAxis
                />
              </Box>

              <BoxWrapperStyled
                container
                className={"MuiPaper-elevation2"}
                display={"flex"}
                alignItems={"center"}
              >
                <Grid
                  item
                  paddingLeft={2}
                  paddingY={3}
                  xs={12}
                  sm={6}
                  lg={4} /* overflow={'scroll'} */
                  display={"flex"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Box>
                    <Typography
                      component={"span"}
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"flex-start"}
                      alignItems={"center"}
                      style={{ textTransform: "capitalize" }}
                      color={"textPrimary"}
                    >
                      <Box
                        component={"span"}
                        className={"logo-icon"}
                        display={"flex"}
                        height={"var(--list-menu-coin-size)"}
                        width={"var(--list-menu-coin-size)"}
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {coinAIcon ? (
                          <AvatarCoinStyled
                            imgx={coinAIcon.x}
                            imgy={coinAIcon.y}
                            imgheight={coinAIcon.h}
                            imgwidth={coinAIcon.w}
                            size={20}
                            variant="circular"
                            style={{ marginTop: 2 }}
                            alt={coinPairInfo?.myCoinA?.simpleName as string}
                            // src={sellData?.icon}
                            src={
                              "data:image/svg+xml;utf8," +
                              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                            }
                          />
                        ) : (
                          <Avatar
                            variant="circular"
                            alt={coinPairInfo?.myCoinA?.simpleName as string}
                            style={{
                              height: "var(--list-menu-coin-size)",
                              width: "var(--list-menu-coin-size)",
                            }}
                            // src={sellData?.icon}
                            src={SoursURL + "images/icon-default.png"}
                          />
                        )}
                      </Box>
                      <Typography
                        marginLeft={1 / 2}
                        justifyContent={"center"}
                        display={"flex"}
                      >
                        <Typography
                          component={"span"}
                          alignSelf={"right"}
                          variant={"h5"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {getValuePrecisionThousand(
                            coinPairInfo.totalA,
                            precisionA,
                            precisionA
                          )}
                        </Typography>
                        <Typography
                          component={"span"}
                          variant={"h5"}
                          marginLeft={1}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {/*<HiddenHidden>{t('labelLPTotal')}</Hidden>*/}
                          {coinPairInfo.myCoinA?.simpleName}
                        </Typography>
                      </Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"flex-start"}
                      alignItems={"center"}
                      marginTop={1}
                      style={{ textTransform: "capitalize" }}
                    >
                      <Box
                        component={"span"}
                        className={"logo-icon"}
                        display={"flex"}
                        height={"var(--list-menu-coin-size)"}
                        width={"var(--list-menu-coin-size)"}
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {coinBIcon ? (
                          <AvatarCoinStyled
                            style={{ marginTop: 2 }}
                            imgx={coinBIcon.x}
                            imgy={coinBIcon.y}
                            imgheight={coinBIcon.h}
                            imgwidth={coinBIcon.w}
                            size={20}
                            variant="circular"
                            alt={coinPairInfo?.myCoinB?.simpleName as string}
                            // src={sellData?.icon}
                            src={
                              "data:image/svg+xml;utf8," +
                              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                            }
                          />
                        ) : (
                          <Avatar
                            variant="circular"
                            alt={coinPairInfo?.myCoinB?.simpleName as string}
                            style={{
                              height: "var(--list-menu-coin-size)",
                              width: "var(--list-menu-coin-size)",
                            }}
                            src={SoursURL + "images/icon-default.png"}
                          />
                        )}
                      </Box>
                      <Typography
                        marginLeft={1 / 2}
                        justifyContent={"center"}
                        display={"flex"}
                      >
                        <Typography
                          variant={"h5"}
                          component={"span"}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {getValuePrecisionThousand(
                            coinPairInfo.totalB,
                            precisionB,
                            precisionB
                          )}
                        </Typography>
                        <Typography
                          variant={"h5"}
                          component={"span"}
                          marginLeft={1}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {/*<Hidden>{t('labelLPTotal')}</Hidden>*/}
                          {coinPairInfo.myCoinB?.simpleName}
                        </Typography>
                      </Typography>
                    </Typography>
                  </Box>
                  <Divider
                    style={{
                      height: "56px",
                      marginLeft: "8px",
                      borderRight: "1px solid var(--color-divide)",
                    }}
                    orientation={"vertical"}
                  />
                </Grid>

                <Grid item paddingX={2} paddingY={3} xs={4} sm={3} lg={3}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {typeof coinPairInfo.amountDollar === "undefined"
                        ? EmptyValueTag
                        : currency === Currency.usd
                        ? PriceTag.Dollar +
                          abbreviateNumber(coinPairInfo.amountDollar || 0, 2)
                        : PriceTag.Yuan +
                          abbreviateNumber(coinPairInfo.amountYuan || 0, 2)}
                    </Typography>

                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("labelTVL")}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item paddingX={2} paddingY={3} xs={4} sm={6} lg={3}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {render24hVolume}
                    </Typography>
                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("label24Volume")}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item paddingX={2} paddingY={3} xs={4} sm={6} lg={2}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {coinPairInfo.APR
                        ? getValuePrecisionThousand(
                            coinPairInfo.APR,
                            2,
                            2,
                            undefined,
                            true
                          )
                        : EmptyValueTag}
                      %
                    </Typography>
                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("labelAPR")}
                    </Typography>
                  </Box>
                </Grid>
              </BoxWrapperStyled>
            </Box>

            <StylePaper
              className={"MuiPaper-elevation2"}
              marginTop={3}
              paddingBottom={1}
              ref={container}
            >
              <TabsStyled
                value={tabIndex}
                onChange={handleTabsChange}
                aria-label="tabs switch"
              >
                <Tab label={t("labelAmmAllTransactions")} {...applyProps(0)} />
                <Tab label={t("labelAmmMyTransactions")} {...applyProps(1)} />
              </TabsStyled>
              <Divider style={{ marginTop: "-1px" }} />
              {/*ammRecordArray*/}
              {tabIndex === 0 ? (
                <AmmRecordTable
                  rawData={ammMarketArray}
                  rowHeight={RowConfig.rowHeight}
                  headerRowHeight={RowConfig.rowHeaderHeight}
                  currentheight={tableHeight}
                  showloading={isRecentLoading}
                  currency={currency}
                />
              ) : (
                <AmmRecordTable
                  rawData={myAmmMarketArray}
                  handlePageChange={getUserAmmPoolTxs}
                  pagination={{
                    pageSize: 14,
                    total: ammUserTotal,
                  }}
                  showloading={isMyAmmLoading}
                  rowHeight={RowConfig.rowHeight}
                  headerRowHeight={RowConfig.rowHeaderHeight}
                  currentheight={tableHeight}
                  currency={currency}
                />
              )}
            </StylePaper>
          </Box>
        )}
        {/*style={{ minWidth: "var(--swap-box-width)" }}*/}
        <Box
          display={"flex"}
          flexDirection={"column"}
          flex={isMobile ? 1 : "initial"}
        >
          <AmmPanelView
            pair={pair}
            stob={stob}
            btos={btos}
            getRecentAmmPoolTxs={getRecentAmmPoolTxs}
            walletMap={walletMap}
            snapShotData={snapShotData}
          />
          {isMobile && (
            <Box marginLeft={1}>
              <BoxWrapperStyled
                container
                marginY={2}
                padding={2}
                className={"MuiPaper-elevation2"}
                display={"flex"}
                alignItems={"center"}
                rowSpacing={4}
                columnSpacing={1}
              >
                <Grid item xs={6}>
                  <Box>
                    <Typography
                      component={"span"}
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"flex-start"}
                      alignItems={"center"}
                      style={{ textTransform: "capitalize" }}
                      color={"textPrimary"}
                    >
                      <Box
                        component={"span"}
                        className={"logo-icon"}
                        display={"flex"}
                        height={"var(--list-menu-coin-size)"}
                        width={"var(--list-menu-coin-size)"}
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {coinAIcon ? (
                          <AvatarCoinStyled
                            imgx={coinAIcon.x}
                            imgy={coinAIcon.y}
                            imgheight={coinAIcon.h}
                            imgwidth={coinAIcon.w}
                            size={20}
                            variant="circular"
                            style={{ marginTop: 2 }}
                            alt={coinPairInfo?.myCoinA?.simpleName as string}
                            // src={sellData?.icon}
                            src={
                              "data:image/svg+xml;utf8," +
                              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                            }
                          />
                        ) : (
                          <Avatar
                            variant="circular"
                            alt={coinPairInfo?.myCoinA?.simpleName as string}
                            style={{
                              height: "var(--list-menu-coin-size)",
                              width: "var(--list-menu-coin-size)",
                            }}
                            // src={sellData?.icon}
                            src={SoursURL + "images/icon-default.png"}
                          />
                        )}
                      </Box>
                      <Typography
                        marginLeft={1 / 2}
                        justifyContent={"center"}
                        display={"flex"}
                      >
                        <Typography
                          component={"span"}
                          alignSelf={"right"}
                          variant={"h5"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {getValuePrecisionThousand(
                            coinPairInfo.totalA,
                            precisionA,
                            precisionA
                          )}
                        </Typography>
                        <Typography
                          component={"span"}
                          variant={"h5"}
                          marginLeft={1}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {/*<HiddenHidden>{t('labelLPTotal')}</Hidden>*/}
                          {coinPairInfo.myCoinA?.simpleName}
                        </Typography>
                      </Typography>
                    </Typography>
                    <Typography
                      component={"span"}
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"flex-start"}
                      alignItems={"center"}
                      marginTop={1}
                      style={{ textTransform: "capitalize" }}
                    >
                      <Box
                        component={"span"}
                        className={"logo-icon"}
                        display={"flex"}
                        height={"var(--list-menu-coin-size)"}
                        width={"var(--list-menu-coin-size)"}
                        alignItems={"center"}
                        justifyContent={"center"}
                      >
                        {coinBIcon ? (
                          <AvatarCoinStyled
                            style={{ marginTop: 2 }}
                            imgx={coinBIcon.x}
                            imgy={coinBIcon.y}
                            imgheight={coinBIcon.h}
                            imgwidth={coinBIcon.w}
                            size={20}
                            variant="circular"
                            alt={coinPairInfo?.myCoinB?.simpleName as string}
                            // src={sellData?.icon}
                            src={
                              "data:image/svg+xml;utf8," +
                              '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                            }
                          />
                        ) : (
                          <Avatar
                            variant="circular"
                            alt={coinPairInfo?.myCoinB?.simpleName as string}
                            style={{
                              height: "var(--list-menu-coin-size)",
                              width: "var(--list-menu-coin-size)",
                            }}
                            src={SoursURL + "images/icon-default.png"}
                          />
                        )}
                      </Box>
                      <Typography
                        marginLeft={1 / 2}
                        justifyContent={"center"}
                        display={"flex"}
                      >
                        <Typography
                          variant={"h5"}
                          component={"span"}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {getValuePrecisionThousand(
                            coinPairInfo.totalB,
                            precisionB,
                            precisionB
                          )}
                        </Typography>
                        <Typography
                          variant={"h5"}
                          component={"span"}
                          marginLeft={1}
                          alignSelf={"right"}
                          height={24}
                          lineHeight={"24px"}
                        >
                          {/*<Hidden>{t('labelLPTotal')}</Hidden>*/}
                          {coinPairInfo.myCoinB?.simpleName}
                        </Typography>
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {typeof coinPairInfo.amountDollar === "undefined"
                        ? EmptyValueTag
                        : currency === Currency.usd
                        ? PriceTag.Dollar +
                          abbreviateNumber(coinPairInfo.amountDollar || 0, 2)
                        : PriceTag.Yuan +
                          abbreviateNumber(coinPairInfo.amountYuan || 0, 2)}
                    </Typography>

                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("labelTVL")}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {render24hVolume}
                    </Typography>
                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("label24Volume")}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Typography variant={"h3"} component={"span"}>
                      {coinPairInfo.APR
                        ? getValuePrecisionThousand(
                            coinPairInfo.APR,
                            2,
                            2,
                            undefined,
                            true
                          )
                        : EmptyValueTag}
                      %
                    </Typography>
                    <Typography
                      component={"p"}
                      color={"textSecondary"}
                      display={"flex"}
                    >
                      {t("labelAPR")}
                    </Typography>
                  </Box>
                </Grid>
              </BoxWrapperStyled>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
