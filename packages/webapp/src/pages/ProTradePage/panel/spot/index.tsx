import { Trans, WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import {
  AlertImpact,
  AlertLimitPrice,
  ConfirmImpact,
  LimitTrade,
  MarketTrade,
  PopoverPure,
  Toast,
  TradeProType,
  WrongNetworkGuide,
} from "@loopring-web/component-lib";
import { TOAST_TIME } from "@loopring-web/core";
import {
  getValuePrecisionThousand,
  HelpIcon,
  MarketType,
} from "@loopring-web/common-resources";
import { usePageTradePro, useTokenMap } from "@loopring-web/core";
import { useMarket } from "./hookMarket";
import { useLimit } from "./hookLimit";
import { Box, Divider, Tab, Tabs, Typography } from "@mui/material";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";

// const TabsStyle = styled(Tabs)`
//   flex: 1;
//   width: 100%;
// ` as typeof Tabs
export enum TabIndex {
  market = "market",
  limit = "limit",
}

export const SpotView = withTranslation("common")(
  ({
    t,
    market,
    resetTradeCalcData,
  }: // ,marketTicker
  {
    market: MarketType;
    resetTradeCalcData: (props: {
      tradeData?: any;
      market: MarketType | string;
    }) => void;
    // marketTicker:  MarketBlockProps<C>
  } & WithTranslation) => {
    const { pageTradePro } = usePageTradePro();
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.limit);
    const { marketMap, tokenMap } = useTokenMap();
    //@ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const {
      toastOpen: toastOpenL,
      closeToast: closeToastL,
      limitTradeData,
      onChangeLimitEvent,
      tradeLimitI18nKey,
      tradeLimitBtnStatus,
      tradeLimitBtnStyle,
      limitBtnClick,
      isLimitLoading,
      handlePriceError,
      resetLimitData,
      limitAlertOpen,
      limitSubmit,
    } = useLimit({ market, resetTradeCalcData });

    const {
      alertOpen,
      confirmOpen,
      toastOpen,
      closeToast,
      marketTradeData,
      onChangeMarketEvent,
      tradeMarketI18nKey,
      tradeMarketBtnStatus,
      tradeMarketBtnStyle,
      marketSubmit,
      resetMarketData,
      marketBtnClick,
      isMarketLoading,
    } = useMarket({ market, resetTradeCalcData });
    const onTabChange = React.useCallback(
      (_e, value) => {
        setTabIndex(value);
        //HIGH: Do not move the query
        resetLimitData();
        resetMarketData();
        resetTradeCalcData({ market });

        //HIGH: Do not move the query
      },
      [market]
    );

    const p = (getValuePrecisionThousand(
      parseFloat(pageTradePro.calcTradeParams?.priceImpact ?? "0") * 100,
      2
    ) + "%") as any;
    const popupLimitState = usePopupState({
      variant: "popover",
      popupId: `popupId-limit`,
    });
    const popupMarketState = usePopupState({
      variant: "popover",
      popupId: `popupId-market`,
    });

    const limitLabel = React.useMemo(() => {
      return (
        <>
          <Typography display={"inline-flex"} alignItems={"center"}>
            <Typography component={"span"} marginRight={1}>
              {" "}
              {t("labelProLimit")}{" "}
            </Typography>
            <HelpIcon
              {...bindHover(popupLimitState)}
              fontSize={"medium"}
              htmlColor={"var(--color-text-third)"}
            />
          </Typography>
          <PopoverPure
            className={"arrow-center"}
            {...bindPopper(popupLimitState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography
              padding={2}
              component={"p"}
              variant={"body2"}
              whiteSpace={"pre-line"}
              maxWidth={280}
            >
              <Trans i18nKey={"depositLimit"}>
                Limit orders set the maximum or minimum price at which you are
                willing to buy or sell.
              </Trans>
            </Typography>
          </PopoverPure>
        </>
      );
    }, [popupLimitState]);
    const marketLabel = React.useMemo(() => {
      return (
        <>
          <Typography display={"inline-flex"} alignItems={"center"}>
            <Typography component={"span"} marginRight={1}>
              {t("labelProMarket")}
            </Typography>
            <HelpIcon
              {...bindHover(popupMarketState)}
              fontSize={"medium"}
              htmlColor={"var(--color-text-third)"}
            />
          </Typography>
          <PopoverPure
            className={"arrow-center"}
            {...bindPopper(popupMarketState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography
              padding={2}
              component={"p"}
              variant={"body2"}
              whiteSpace={"pre-line"}
              maxWidth={280}
            >
              <Trans i18nKey={"depositMarket"}>
                Market orders are transactions meant to execute as quickly as
                possible at the current market price.
              </Trans>
            </Typography>
          </PopoverPure>
        </>
      );
    }, [popupMarketState]);

    const isMarketUnavailable =
      marketMap && marketMap.market && (marketMap.market.status || 0) % 3 !== 0;
    const marketUnavailableConent =
      isMarketUnavailable && (marketMap.market.status || 0) % 3 === 2
        ? "This pair doesn’t support limit order, please place a market order"
        : "";

    return (
      <>
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <Toast
          alertText={
            isMarketUnavailable
              ? marketUnavailableConent
              : toastOpenL?.content ?? ""
          }
          severity={toastOpenL?.type ?? "success"}
          open={toastOpenL?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToastL}
        />
        <AlertImpact handleClose={marketSubmit} open={alertOpen} value={p} />
        <ConfirmImpact
          handleClose={marketSubmit}
          open={confirmOpen}
          value={p}
        />
        <AlertLimitPrice
          handleClose={limitSubmit}
          open={limitAlertOpen}
          value={
            pageTradePro.tradeType === TradeProType.buy
              ? "labelPriceCompareGreat"
              : "labelPriceCompareLess"
          }
        />
        <Box display={"flex"} flexDirection={"column"} alignItems={"stretch"}>
          <Box component={"header"} width={"100%"}>
            <Tabs variant={"fullWidth"} value={tabIndex} onChange={onTabChange}>
              <Tab value={TabIndex.limit} label={limitLabel} />
              <Tab value={TabIndex.market} label={marketLabel} />
            </Tabs>
          </Box>

          <Divider style={{ marginTop: "-1px" }} />
          <Box flex={1} component={"section"}>
            {tabIndex === TabIndex.limit && (
              <LimitTrade
                // disabled={false}
                tokenPriceProps={{
                  handleError: handlePriceError as any,
                  decimalsLimit: marketMap[market]?.precisionForPrice,
                }}
                tradeType={pageTradePro.tradeType}
                tokenBaseProps={{
                  disabled: isLimitLoading,
                  decimalsLimit: tokenMap[baseSymbol].precision,
                }}
                tokenQuoteProps={{
                  disabled: isLimitLoading,
                  decimalsLimit: tokenMap[quoteSymbol].precision,
                }}
                tradeLimitI18nKey={tradeLimitI18nKey}
                tradeLimitBtnStyle={tradeLimitBtnStyle}
                tradeLimitBtnStatus={tradeLimitBtnStatus as any}
                handleSubmitEvent={limitBtnClick as any}
                tradeCalcProData={pageTradePro.tradeCalcProData}
                tradeData={limitTradeData}
                onChangeEvent={onChangeLimitEvent as any}
              />
            )}
            {tabIndex === TabIndex.market && (
              <MarketTrade
                // disabled={false}

                tokenBaseProps={{
                  disabled: isMarketLoading,
                  decimalsLimit: tokenMap[baseSymbol].precision,
                }}
                tokenQuoteProps={{
                  disabled: isMarketLoading,
                  decimalsLimit: tokenMap[quoteSymbol].precision,
                }}
                tradeMarketI18nKey={tradeMarketI18nKey}
                tradeMarketBtnStyle={tradeMarketBtnStyle}
                tradeType={pageTradePro.tradeType}
                tradeMarketBtnStatus={tradeMarketBtnStatus}
                handleSubmitEvent={marketBtnClick}
                tradeCalcProData={pageTradePro.tradeCalcProData}
                tradeData={marketTradeData}
                onChangeEvent={onChangeMarketEvent}
              />
            )}
          </Box>
        </Box>
      </>
    );
  }
);
