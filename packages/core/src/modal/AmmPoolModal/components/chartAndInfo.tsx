import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import {
  ChartType,
  floatTag,
  PopoverPure,
  ScaleAreaChart,
  StyledProps,
  useSettings,
  AmmPairDetail,
  AvatarCoin,
} from "@loopring-web/component-lib";
import {
  CurrencyToTag,
  EmptyValueTag,
  FloatTag,
  getValuePrecisionThousand,
  PriceTag,
  SoursURL,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { useTokenMap } from "../../../stores";
import { BoxWrapperStyled } from "./ammPanel";
import { bindHover, bindPopper } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import styled from "@emotion/styled";

const BoxStyle = styled(Box)<StyledProps & BoxProps>`
  ${({ theme, custom }) => floatTag({ theme, custom })};
` as (props: StyledProps & BoxProps) => JSX.Element;

export const ChartAndInfoPanel = ({
  pairHistory,
  pair,
  currency,
  coinAIcon,
  coinBIcon,
  tradeFloat,
  coinPairInfo,
  render24hVolume,
  myAmm,
  forexMap,
}: any) => {
  const { t } = useTranslation("common");
  const { tokenMap } = useTokenMap();

  const popState = usePopupState({
    variant: "popover",
    popupId: `popup-My-LP`,
  });
  const { upColor } = useSettings();

  const precisionA = tokenMap[coinPairInfo.coinA]?.precision;
  const precisionB = tokenMap[coinPairInfo.coinB]?.precision;
  const {
    // totalAmmValueDollar,
    balanceA: myBalanceA,
    balanceB: myBalanceB,
    balanceDollar: myBalanceDollar,
    // totalAmmValueDollar,
    // ammDetail: { coinAInfo, coinBInfo },
  } = myAmm as any;
  const tradeFloatType =
    tradeFloat?.changeDollar === 0
      ? FloatTag.none
      : tradeFloat && tradeFloat.changeDollar && tradeFloat.changeDollar < 0
      ? FloatTag.decrease
      : FloatTag.increase;
  const change =
    tradeFloat?.change &&
    tradeFloat.change.toFixed &&
    !Number.isNaN(tradeFloat?.change)
      ? tradeFloat.change.toFixed(2) + "%"
      : "0.00%";

  return (
    <BoxStyle
      custom={{ chg: upColor as Uppercase<any> }}
      flex={1}
      marginTop={3}
      display={"flex"}
      flexDirection={"column"}
    >
      <Box
        width={"100%"}
        // height={"60%"}
        height={"calc(var(--swap-box-height) - 262px)"}
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
        margin={2}
        width={"auto"}
        spacing={2}
      >
        <Grid
          item
          // paddingLeft={2}
          // paddingY={3}
          xs={12}
          md={6}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
              className={"float-chart float-group"}
            >
              <Typography
                variant={"h5"}
                component={"span"}
                className={`float-tag float-${tradeFloatType}`}
              >
                {tradeFloatType === FloatTag.increase ? "+" : ""}
                {change}
              </Typography>
            </Box>
            <Typography
              component={"span"}
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
              style={{ textTransform: "capitalize" }}
              color={"textPrimary"}
              marginTop={1}
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
                  <AvatarCoin
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
                  <AvatarCoin
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
          <Divider className={"divider-item"} orientation={"vertical"} />
        </Grid>

        <Grid item paddingX={2} paddingY={3} xs={12} md={6}>
          <Typography
            display={"inline-flex"}
            component={"p"}
            marginTop={1}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Typography
              component={"span"}
              color={"var(--color-text-third)"}
              display={"flex"}
              title={"Total Volume Locked"}
            >
              {t("labelTVL")}
            </Typography>
            <Typography variant={"body1"} component={"span"}>
              {typeof coinPairInfo.amountDollar === "undefined"
                ? EmptyValueTag
                : PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (coinPairInfo.amountDollar || 0) *
                      (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    { isFait: true, floor: true, isAbbreviate: true }
                  )}
            </Typography>
          </Typography>

          <Typography
            display={"inline-flex"}
            component={"p"}
            marginTop={1}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Typography
              component={"span"}
              color={"var(--color-text-third)"}
              display={"flex"}
            >
              {t("label24Volume")}
            </Typography>
            <Typography variant={"body1"} component={"span"}>
              {render24hVolume}
            </Typography>
          </Typography>

          <Typography
            display={"inline-flex"}
            component={"p"}
            marginTop={1}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Typography
              component={"span"}
              color={"var(--color-text-third)"}
              display={"flex"}
            >
              {t("labelAPR")}
            </Typography>
            <Typography variant={"body1"} component={"span"}>
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
          </Typography>

          <Typography
            display={"inline-flex"}
            component={"p"}
            marginTop={1}
            justifyContent={"space-between"}
            width={"100%"}
          >
            <Typography
              component={"span"}
              color={"var(--color-text-third)"}
              display={"flex"}
            >
              {t("labelMe")}
            </Typography>
            {typeof myBalanceDollar === "undefined" ? (
              <Typography component={"span"}>{EmptyValueTag}</Typography>
            ) : (
              <Typography
                component={"span"}
                {...bindHover(popState)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline dotted",
                }}
              >
                {PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (myBalanceDollar || 0) * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    { isFait: true, floor: true }
                  )}
              </Typography>
            )}
            <PopoverPure
              className={"arrow-top-center"}
              {...bindPopper(popState)}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
            >
              <AmmPairDetail
                coinA={coinPairInfo.coinA}
                coinB={coinPairInfo.coinB}
                balanceA={myBalanceA}
                balanceB={myBalanceB}
                precisionA={
                  tokenMap ? tokenMap[coinPairInfo.coinA]?.precision ?? 4 : 4
                }
                precisionB={
                  tokenMap ? tokenMap[coinPairInfo.coinB]?.precision ?? 4 : 4
                }
              />
            </PopoverPure>
          </Typography>
        </Grid>
      </BoxWrapperStyled>
    </BoxStyle>
  );
};
