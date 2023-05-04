import React from "react";
import styled from "@emotion/styled";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Switch,
  Tab,
  Tabs,
  Typography,
  Tooltip,
  TooltipProps,
  tooltipClasses,
  IconButton,
} from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useDualHook } from "./hook";
import {
  Button,
  CardStyleItem,
  CoinIcon,
  CoinIcons,
  DualTable,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import {
  ModalDualPanel,
  useDualMap,
  useDualTrade,
  useSystem,
  useTokenMap,
} from "@loopring-web/core";
import { useHistory } from "react-router-dom";
import {
  BackIcon,
  CloseIcon,
  getValuePrecisionThousand,
  HelpIcon,
  Info2Icon,
  SoursURL,
  TokenType,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";
import { BeginnerMode } from "./BeginnerMode";

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const StyleDual = styled(Box)`
  position: relative;
` as typeof Box;
const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const TopRightButton = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.unit * 0.5}px;
  right: ${({ theme }) => theme.unit * 0.5}px;
`;

export const DualListPanel: any = withTranslation("common")(
  ({
    t,
    setConfirmDualInvest,
    showBeginnerModeHelp,
    onShowBeginnerModeHelp,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void;
    showBeginnerModeHelp: boolean;
    onShowBeginnerModeHelp: (show: boolean) => void;
  }) => {
    const { coinJson } = useSettings();
    const { forexMap } = useSystem();
    const theme = useTheme();
    const { tradeMap, marketArray, status, getDualMap } = useDualMap();
    const { tokenMap } = useTokenMap();
    const { setShowDual } = useOpenModals();
    const {
      pairASymbol,
      pairBSymbol,
      isLoading,
      dualProducts,
      currentPrice,
      pair,
      market,
      beginnerMode,
      handleOnPairChange,
      onToggleBeginnerMode,
    } = useDualHook({ setConfirmDualInvest });

    const { dualTradeProps, dualToastOpen, closeDualToast } = useDualTrade();
    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const history = useHistory();
    const dualType = new RegExp(pair).test(market ?? "")
      ? sdk.DUAL_TYPE.DUAL_BASE
      : sdk.DUAL_TYPE.DUAL_CURRENCY;
    const marketsIsLoading = status === "PENDING"
    // console.log('status111111', status)

    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={isMobile ? "left" : "center"}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={
              isMobile
                ? {
                    color: "var(--color-text-secondary)",
                    justifyContent: "left",
                  }
                : { color: "var(--color-text-secondary)" }
            }
            color={"inherit"}
            onClick={() => history.push("/invest/overview")}
          >
            {t("labelInvestDualTitle")}
          </Button>
          <Box
            display={"flex"}
            flexDirection={"row"}
            marginTop={isMobile ? 2 : "inherit"}
            width={isMobile ? "100%" : "initial"}
            justifyContent={"space-between"}
          >
            {!isMobile && (
              <NoMaxWidthTooltip
                open={showBeginnerModeHelp}
                componentsProps={{
                  arrow: { style: { color: theme.colorBase.popBg } },
                }}
                title={
                  <Box
                    marginX={4}
                    marginY={2.5}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <Box marginRight={2.5}>
                      <HelpIcon fontSize={"large"} />
                    </Box>
                    <Box>
                      <Typography color={theme.colorBase.textSecondary}>
                        {t("labelInvestDualBeginerModeDesLine1")}
                      </Typography>
                      <Typography color={theme.colorBase.textSecondary}>
                        {t("labelInvestDualBeginerModeDesLine2")}
                      </Typography>
                    </Box>
                    <TopRightButton
                      size={"large"}
                      aria-label={t("labelClose")}
                      color={"inherit"}
                      onClick={() => {
                        onShowBeginnerModeHelp(false);
                      }}
                    >
                      <CloseIcon />
                    </TopRightButton>
                  </Box>
                }
                arrow
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={beginnerMode}
                      onChange={onToggleBeginnerMode}
                    />
                  }
                  label={
                    <Typography variant={"h6"} marginLeft={1}>
                      {t("labelInvestDualBeginerMode")}
                    </Typography>
                  }
                />
              </NoMaxWidthTooltip>
            )}
            <Button
              startIcon={<HelpIcon fontSize={"large"} />}
              variant={"text"}
              onClick={() => {
                window.open(
                  `https://loopring.io/#/document/dual_investment_tutorial_en.md`,
                  "_blank"
                );
                window.opener = null;
              }}
              sx={{ color: "var(--color-text-secondary)" }}
            >
              {t("labelInvestDualTutorial")}
            </Button>
            <Button
              variant={"outlined"}
              sx={{ marginLeft: 2 }}
              onClick={() => history.push("/invest/balance/dual")}
            >
              {t("labelInvestMyDual")}
            </Button>
          </Box>
        </Box>
        {beginnerMode ? (
          <BeginnerMode setConfirmDualInvest={setConfirmDualInvest} />
        ) : (
          marketsIsLoading ? (
            <Box key={"loading"} flexDirection={"column"} display={"flex"} justifyContent={"center"} height={"100%"} alignItems={"center"}>
              <img 
                alt={"loading"}
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </Box>
          // ) : false  ? (
          ) : !!marketArray?.length ? (
            <>
              <StyleDual flexDirection={"column"} display={"flex"} flex={1}>
                <Grid container spacing={2}>
                  {tradeMap &&
                    Reflect.ownKeys(tradeMap)
                      .sort((a, b) => a.toString().localeCompare(b.toString()))
                      .map((item, index) => {
                        // const item = tradeMap[key.toString()];
                        return (
                          <Grid
                            item
                            xs={6}
                            md={3}
                            lg={2}
                            key={item.toString() + index.toString()}
                          >
                            <CardStyleItem
                              className={
                                item.toString().toLowerCase() ===
                                pairASymbol.toLowerCase()
                                  ? "btnCard dualInvestCard selected"
                                  : "btnCard dualInvestCard "
                              }
                              sx={{ height: "100%" }}
                              onClick={() =>
                                handleOnPairChange({ pairA: item.toString() })
                              }
                            >
                              <CardContent sx={{ alignItems: "center" }}>
                                <Typography
                                  component={"span"}
                                  display={"inline-flex"}
                                >
                                  <CoinIcon
                                    symbol={item.toString()}
                                    size={28}
                                  />
                                </Typography>
                                <Typography variant={"h5"} paddingLeft={1}>
                                  {t("labelDualInvest", {
                                    symbol: item.toString(),
                                  })}
                                </Typography>
                              </CardContent>
                            </CardStyleItem>
                          </Grid>
                        );
                      })}
                </Grid>

                <Box marginTop={1}>
                  <Tabs
                    value={pairBSymbol}
                    onChange={(_e, value) =>
                      handleOnPairChange({ pairB: value })
                    }
                    aria-label="Dual Quote Tab"
                    variant={"scrollable"}
                  >
                    {pairASymbol &&
                      tradeMap[pairASymbol]?.tokenList?.map((item, index) => {
                        const _index = marketArray.findIndex((_item) =>
                          new RegExp(
                            pairASymbol + "-" + item.toString(),
                            "ig"
                          ).test(_item)
                        );
                        return (
                          <Tab
                            label={
                              _index !== -1
                                ? t("labelDualBase", {
                                    symbol: item.toString(),
                                  })
                                : t("labelDualQuote", {
                                    symbol: item.toString(),
                                  })
                            }
                            value={item.toString()}
                            key={item.toString() + index.toString()}
                          />
                        );
                      })}
                  </Tabs>
                </Box>

                <WrapperStyled marginTop={1} flex={1} flexDirection={"column"}>
                  {pairASymbol && pairBSymbol && market && (
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      paddingTop={3}
                      paddingX={3}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Box
                        component={"h3"}
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                      >
                        <Typography component={"span"} display={"inline-flex"}>
                          {/* eslint-disable-next-line react/jsx-no-undef */}
                          <CoinIcons
                            type={TokenType.dual}
                            size={32}
                            tokenIcon={[
                              coinJson[pairASymbol],
                              coinJson[pairBSymbol],
                            ]}
                          />
                        </Typography>
                        <Typography
                          component={"span"}
                          flexDirection={"column"}
                          display={"flex"}
                        >
                          <Typography
                            component={"span"}
                            display={"inline-flex"}
                            color={"textPrimary"}
                          >
                            {t(
                              dualType === DUAL_TYPE.DUAL_BASE
                                ? "labelDualInvestBaseTitle"
                                : "labelDualInvestQuoteTitle",
                              {
                                symbolA: pairASymbol,
                                symbolB: pairBSymbol,
                              }
                            )}
                          </Typography>
                          <Typography
                            component={"span"}
                            display={"inline-flex"}
                            color={"textSecondary"}
                            variant={"body2"}
                          >
                            {t("labelDualInvestDes", {
                              symbolA: pairASymbol,
                              symbolB: pairBSymbol,
                            })}
                          </Typography>
                        </Typography>
                      </Box>
                      <Typography
                        component={"span"}
                        display={isMobile ? "flex" : "inline-flex"}
                        color={"textSecondary"}
                        variant={"body2"}
                        flexDirection={isMobile ? "column" : "row"}
                        alignItems={"center"}
                        whiteSpace={"pre-wrap"}
                      >
                        {currentPrice &&
                          (!isMobile ? (
                            <>
                              <Tooltip
                                title={<>{t("labelDualCurrentPriceTip")}</>}
                                placement={"top"}
                              >
                                <Typography
                                  component={"p"}
                                  variant="body2"
                                  color={"textSecondary"}
                                  display={"inline-flex"}
                                  alignItems={"center"}
                                >
                                  <Info2Icon
                                    fontSize={"small"}
                                    color={"inherit"}
                                    sx={{ marginX: 1 / 2 }}
                                  />
                                </Typography>
                              </Tooltip>
                            <Trans
                              i18nKey={"labelDualCurrentPrice"}
                              tOptions={{
                                price:
                                  // PriceTag[CurrencyToTag[currency]] +
                                  getValuePrecisionThousand(
                                    currentPrice.currentPrice,
                                    currentPrice.precisionForPrice
                                      ? currentPrice.precisionForPrice
                                      : tokenMap[currentPrice.quote]
                                          .precisionForOrder,
                                    currentPrice.precisionForPrice
                                      ? currentPrice.precisionForPrice
                                      : tokenMap[currentPrice.quote]
                                          .precisionForOrder,
                                    currentPrice.precisionForPrice
                                      ? currentPrice.precisionForPrice
                                      : tokenMap[currentPrice.quote]
                                          .precisionForOrder,
                                    true,
                                    { floor: true }
                                  ),
                                symbol: currentPrice.base,
                              }}
                            >
                              LRC Current price:
                              <Typography
                                component={"span"}
                                display={"inline-flex"}
                                color={"textPrimary"}
                                paddingLeft={1}
                              >
                                price
                              </Typography>{" "}
                              :
                            </Trans>
                            </>
                            
                          ) : (
                            <>
                              <Typography
                                component={"span"}
                                color={"textSecondary"}
                                variant={"body2"}
                                textAlign={"right"}
                              >
                                {t("labelDualMobilePrice", {
                                  symbol: currentPrice.base,
                                })}
                              </Typography>
                              <Typography
                                textAlign={"right"}
                                component={"span"}
                                display={"inline-flex"}
                                color={"textPrimary"}
                                paddingLeft={1}
                              >
                                {getValuePrecisionThousand(
                                  currentPrice.currentPrice,
                                  currentPrice.precisionForPrice
                                    ? currentPrice.precisionForPrice
                                    : tokenMap[currentPrice.quote]
                                        .precisionForOrder,
                                  currentPrice.precisionForPrice
                                    ? currentPrice.precisionForPrice
                                    : tokenMap[currentPrice.quote]
                                        .precisionForOrder,
                                  currentPrice.precisionForPrice
                                    ? currentPrice.precisionForPrice
                                    : tokenMap[currentPrice.quote]
                                        .precisionForOrder,
                                  true,
                                  { floor: true }
                                )}
                              </Typography>
                            </>
                          ))}
                      </Typography>
                    </Box>
                  )}
                  <Box flex={1}>
                    <DualTable
                      rawData={dualProducts ?? []}
                      showloading={isLoading}
                      forexMap={forexMap as any}
                      onItemClick={(item) => {
                        setShowDual({
                          isShow: true,
                          dualInfo: {
                            ...item,
                            sellSymbol: pairASymbol,
                            buySymbol: pairBSymbol,
                          },
                        });
                      }}
                    />
                  </Box>
                </WrapperStyled>
              </StyleDual>
            </>
          ) : (
            <Box key={"empty"} flexDirection={"column"} display={"flex"} justifyContent={"center"} height={"100%"} alignItems={"center"}>
              <img src={SoursURL + '/svg/dual-empty.svg'}/>
              <Button onClick={getDualMap} variant={"contained"}>
                {t("labelDualRefresh")}
              </Button>
            </Box>
          )
        )}
        <ModalDualPanel
          dualTradeProps={dualTradeProps}
          dualToastOpen={dualToastOpen}
          closeDualToast={closeDualToast}
          isBeginnerMode={beginnerMode}
        />
      </Box>
    );
  }
);
