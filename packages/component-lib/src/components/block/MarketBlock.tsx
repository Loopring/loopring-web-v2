import { WithTranslation } from "react-i18next";
import {
  CoinKey,
  EmptyValueTag,
  PriceTag,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { Box, BoxProps, Grid } from "@mui/material";
import { Typography } from "@mui/material";
import styled from "@emotion/styled";
import React from "react";
import { floatTag, MarketBlockProps, useSettings } from "./../../index";
import { ScaleAreaChart } from "../charts";
import { ChartType } from "../charts";
import { Currency } from "@loopring-web/loopring-sdk";

type StyledProps = {
  custom: any;
};
const MarketBlockStyled = styled(Box)<StyledProps>`
  min-height: ${({ theme }) => theme.unit * 14.625}px;
  & {
    background: var(--color-box);

    border-radius: ${({ theme }) => theme.unit}px;
    border: 1px solid var(--color-box);
    cursor: pointer;
  }
  ${({ theme, custom }) => floatTag({ theme, custom })};

  .left-block {
    min-width: 76px;
  }

  .float-group span {
    display: flex;
    align-items: flex-end;
  }

  &:hover {
    box-shadow: var(--shadow-hover);
  }
` as (props: StyledProps & BoxProps) => JSX.Element;

export const MarketBlock = <C extends CoinKey<I>, I>({
  coinAInfo,
  t,
  coinBInfo,
  tradeFloat,
  chartData = [],
  handleBlockClick,
}: WithTranslation &
  MarketBlockProps<C> & { handleBlockClick: () => void }) => {
  const { upColor, currency } = useSettings();
  const isUSD = currency === Currency.usd;
  const {
    volume,
    coinAPriceDollar,
    coinAPriceYuan,
    marketPrecision,
    coinBPrecision,
  } = tradeFloat as any;
  const currencyUnit = isUSD ? PriceTag.Dollar : PriceTag.Yuan;
  const baseFaitPrice = getValuePrecisionThousand(
    isUSD ? coinAPriceDollar : coinAPriceYuan,
    undefined,
    undefined,
    undefined,
    true,
    {
      isFait: true,
    }
  );

  return (
    <MarketBlockStyled
      onClick={handleBlockClick}
      className={"MuiPaper-elevation2"}
      custom={{ chg: upColor }}
      padding={0.5 * 5}
      display={"flex"}
      justifyContent={"stretch"}
    >
      {coinAInfo && coinBInfo ? (
        <Grid container justifyContent={"space-around"} position={"relative"}>
          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            height={24}
          >
            <Typography variant={"h4"} component={"h3"}>
              <Typography
                variant={"h5"}
                component={"span"}
                title={"sell"}
                color={"textPrimary"}
              >
                {coinAInfo?.simpleName}
              </Typography>
              <Typography variant={"h5"} component={"i"}>
                {` / `}
              </Typography>
              <Typography
                variant={"h5"}
                component={"span"}
                title={"buy"}
                color={"textPrimary"}
              >
                {coinBInfo.simpleName}
              </Typography>
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-start"}
            alignItems={"stretch"}
            className={"float-group"}
            marginTop={1}
          >
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              justifyContent={"flex-end"}
              className={"left-block"}
            >
              {tradeFloat.close ? (
                <Box
                  height={24}
                  display={"flex"}
                  alignItems={"center"}
                  className={`float-tag float-${tradeFloat.floatTag}`}
                >
                  <Typography variant={"h4"}>
                    {getValuePrecisionThousand(
                      tradeFloat?.close,
                      undefined,
                      undefined,
                      marketPrecision,
                      true,
                      { isPrice: true }
                    )}
                  </Typography>
                  <Typography
                    color={"var(--color-text-secondary)"}
                    marginX={1 / 4}
                  >
                    &#8776;
                  </Typography>
                  <Typography
                    variant={"body2"}
                    color={"var(--color-text-secondary)"}
                  >
                    {currencyUnit} {baseFaitPrice}
                  </Typography>
                </Box>
              ) : (
                ""
              )}
              <Box display={"flex"} alignItems={"center"}>
                <Typography
                  variant={"body2"}
                  component={"span"}
                  marginTop={1 / 2}
                  marginRight={1}
                  className={`float-tag float-${tradeFloat.floatTag}`}
                >
                  {tradeFloat.change
                    ? `${
                        tradeFloat.change > 0 ? "+" : ""
                      }${getValuePrecisionThousand(
                        tradeFloat.change,
                        2,
                        2,
                        2,
                        true
                      )}%`
                    : EmptyValueTag + "%"}
                </Typography>
                <Typography
                  variant={"body2"}
                  color={"var(--color-text-secondary)"}
                  component={"div"}
                  textOverflow={"ellipsis"}
                  overflow={"hidden"}
                  whiteSpace={"nowrap"}
                  marginTop={1 / 2}
                >
                  {t("labelAmount") + " "} :
                  {getValuePrecisionThousand(
                    volume,
                    coinBPrecision,
                    coinBPrecision,
                    undefined,
                    true
                  )}
                  &nbsp;{coinBInfo.simpleName}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            position={"absolute"}
            top={0}
            right={0}
            width={90}
            height={36}
          >
            <ScaleAreaChart
              isHeadTailCompare
              showTooltip={false}
              showArea={false}
              type={ChartType.Trend}
              data={chartData}
            />
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </MarketBlockStyled>
  );
};
