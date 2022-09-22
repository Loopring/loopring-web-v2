import React from "react";
import styled from "@emotion/styled";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useDualHook } from "./hook";
import {
  Button,
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
  getValuePrecisionThousand,
  HelpIcon,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";

const StyleDual = styled(Box)`
  position: relative;

  .dualInvestCard {
    .MuiCardContent-root {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => (3 / 2) * theme.unit}px 0;
    box-shadow: none;
    transition: none;
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: "var(--field-opacity)",
        d_R: 0.5,
      })};

    &.selected {
      ${({ theme }) =>
        theme.border.defaultFrame({
          c_key: "var(--color-border-select)",
          d_R: 0.5,
        })};
    }

    &:hover {
      ${({ theme }) =>
        theme.border.defaultFrame({
          c_key: "var(--color-border-hover)",
          d_R: 0.5,
        })};
    }
  }
` as typeof Box;
const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const DualListPanel: any = withTranslation("common")(
  ({
    t,
    setConfirmDualInvest,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void;
  }) => {
    const { coinJson } = useSettings();
    const { forexMap } = useSystem();
    const theme = useTheme();
    const { tradeMap, marketArray } = useDualMap();
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
      marketBase,
      marketQuote,
      priceObj,
      handleOnPairChange,
    } = useDualHook({ setConfirmDualInvest });

    const { dualTradeProps, dualToastOpen, closeDualToast } = useDualTrade();
    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const history = useHistory();
    const dualType = new RegExp(pair).test(market ?? "")
      ? sdk.DUAL_TYPE.DUAL_BASE
      : sdk.DUAL_TYPE.DUAL_CURRENCY;

    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={() => history.push("/invest/overview")}
          >
            {t("labelInvestDualTitle")}
          </Button>
          <Box display={"flex"} flexDirection={"row"}>
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
                      <Card
                        className={
                          item.toString().toLowerCase() ===
                          pairASymbol.toLowerCase()
                            ? "dualInvestCard selected"
                            : "dualInvestCard "
                        }
                        sx={{ height: "100%" }}
                        onClick={() =>
                          handleOnPairChange({ pairA: item.toString() })
                        }
                      >
                        <CardContent>
                          <CoinIcon symbol={item.toString()} size={24} />
                          <Typography variant={"h5"} paddingLeft={1}>
                            {t("labelDualInvest", { symbol: item.toString() })}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
          </Grid>

          <Box marginTop={1}>
            <Tabs
              value={pairBSymbol}
              onChange={(_e, value) => handleOnPairChange({ pairB: value })}
              aria-label="disabled tabs example"
              variant={"scrollable"}
            >
              {pairASymbol &&
                tradeMap[pairASymbol]?.tokenList?.map((item, index) => {
                  const _index = marketArray.findIndex((_item) =>
                    new RegExp(pairASymbol + "-" + item.toString(), "ig").test(
                      _item
                    )
                  );
                  return (
                    <Tab
                      label={
                        _index !== -1
                          ? t("labelDualBase", { symbol: item.toString() })
                          : t("labelDualQuote", { symbol: item.toString() })
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
                      type={"dual"}
                      size={32}
                      tokenIcon={[coinJson[pairASymbol], coinJson[pairBSymbol]]}
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
                  display={"inline-flex"}
                  color={"textSecondary"}
                  variant={"body2"}
                  alignItems={"center"}
                >
                  {currentPrice && (
                    <Trans
                      i18nKey={"labelDualCurrentPrice"}
                      tOptions={{
                        price:
                          // PriceTag[CurrencyToTag[currency]] +
                          getValuePrecisionThousand(
                            currentPrice.currentPrice,
                            currentPrice.precisionForPrice ??
                              tokenMap[currentPrice.quote].precisionForOrder,
                            currentPrice.precisionForPrice ??
                              tokenMap[currentPrice.quote].precisionForOrder,
                            currentPrice.precisionForPrice ??
                              tokenMap[currentPrice.quote].precisionForOrder,
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
                      </Typography>
                    </Trans>
                  )}
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
        <ModalDualPanel
          dualTradeProps={dualTradeProps}
          dualToastOpen={dualToastOpen}
          closeDualToast={closeDualToast}
        />
      </Box>
    );
  }
);
