import React from "react";
import styled from "@emotion/styled";
import {
  Avatar,
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
  boxLiner,
  Button,
  CoinIcon,
  CoinIcons,
  DualTable,
  Toast,
  useSettings,
} from "@loopring-web/component-lib";
import {
  confirmation,
  useDefiMap,
  useDualMap,
  useSystem,
  useTicker,
  useTokenPrices,
} from "@loopring-web/core";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  BackIcon,
  CurrencyToTag,
  getValuePrecisionThousand,
  PriceTag,
  TOAST_TIME,
} from "@loopring-web/common-resources";

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
    border-radius: ${({ theme }) => theme.unit}px;

    &.selected {
      background: var(--color-success);
    }
  }
` as typeof Box;
const WrapperStyled = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .logo-icon.dual:last-child {
    transform: scale(0.6) translate(6px, 6px);
  }
`;

export const DualPanel: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    setConfirmDualInvest,
  }: WithTranslation & {
    setConfirmDualInvest: (state: any) => void;
  }) => {
    const { coinJson } = useSettings();
    const { currency } = useSettings();
    const { forexMap } = useSystem();

    const {
      pairASymbol,
      pairBSymbol,
      market,
      isLoading,
      dualProducts,
      marketBase,
      marketQuote,
      priceObj,
      handleOnPairChange,
    } = useDualHook({ setConfirmDualInvest });

    // if (token.type === "lp" && middle && tail) {
    //   tokenIcon =
    //     [middle] && coinJson[tail]
    //       ? [coinJson[middle], coinJson[tail]]
    //       : [undefined, undefined];
    // }
    // if (token.type !== "lp" && head && head !== "lp") {
    //   tokenIcon = coinJson[head]
    //     ? [coinJson[head], undefined]
    //     : [undefined, undefined];
    // }

    // const [mainTab, setMainTab] = React.useState(pairASymbol);
    // const [secondTab, setSecondTab] = React.useState(pairBSymbol);
    const { tradeMap } = useDualMap();

    // const { marketArray } = useDefiMap();
    // const {
    //   confirmation: { confirmedDefiInvest },
    // } = confirmation.useConfirmation();
    // setConfirmDefiInvest(!confirmedDefiInvest);
    // const match: any = useRouteMatch("/invest/defi/:market?/:isJoin?");
    // const history = useHistory();
    // const _market: MarketType = [...(marketArray ? marketArray : [])].find(
    //   (_item) => {
    //     const value = match?.params?.market
    //       ?.replace(/null|-/gi, "")
    //       ?.toUpperCase();
    //     return new RegExp(value, "ig").test(_item);
    //   }
    // ) as MarketType;

    // const isJoin =
    //   match?.params?.isJoin?.toUpperCase() !== "Redeem".toUpperCase();
    // {
    //   market: _market ?? ("WSTETH-ETH" as MarketType),
    //     isJoin,
    // }

    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const history = useHistory();
    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box marginBottom={2}>
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            {t("labelInvestDualTitle")}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
        </Box>
        <StyleDual flexDirection={"column"} display={"flex"} flex={1}>
          <Grid container spacing={2}>
            {Reflect.ownKeys(tradeMap).map((item, index) => {
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
                  return (
                    <Tab
                      label={t("labelDualBase", { symbol: item.toString() })}
                      value={item.toString()}
                      key={item.toString() + index.toString()}
                    />
                  );
                })}
            </Tabs>
          </Box>

          <WrapperStyled marginTop={1} flex={1} flexDirection={"column"}>
            {pairASymbol && pairBSymbol && (
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
                      {t("labelDualInvestTitle", {
                        symbolA: pairASymbol,
                        symbolB: pairBSymbol,
                      })}
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
                  <Trans
                    i18nKey={"labelDualCurrentPrice"}
                    tOptions={{
                      price:
                        PriceTag[CurrencyToTag[currency]] +
                        getValuePrecisionThousand(
                          (priceObj.price || 0) * (forexMap[currency] ?? 0),
                          undefined,
                          undefined,
                          2,
                          true,
                          { isFait: true }
                        ),
                      symbol: priceObj.symbol,
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
                </Typography>
              </Box>
            )}
            <Box flex={1}>
              <DualTable rawData={dualProducts ?? []} showloading={isLoading} />
            </Box>
            {/*{isLoading ? (*/}
            {/*  <Box*/}
            {/*    flex={1}*/}
            {/*    height={"100%"}*/}
            {/*    display={"flex"}*/}
            {/*    alignItems={"center"}*/}
            {/*    justifyContent={"center"}*/}
            {/*  >*/}
            {/*    <img*/}
            {/*      className="loading-gif"*/}
            {/*      width="36"*/}
            {/*      src={`${SoursURL}images/loading-line.gif`}*/}
            {/*    />*/}
            {/*  </Box>*/}
            {/*) : (*/}
            {/*  */}
            {/*)}*/}
          </WrapperStyled>
        </StyleDual>
      </Box>
    );
  }
);
