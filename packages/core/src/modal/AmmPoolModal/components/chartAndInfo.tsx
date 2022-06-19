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
} from "@loopring-web/component-lib";
import {
  abbreviateNumber,
  AvatarCoinStyled,
  EmptyValueTag,
  FloatTag,
  getValuePrecisionThousand,
  PriceTag,
  SoursURL,
} from "@loopring-web/common-resources";
import { Currency } from "@loopring-web/loopring-sdk";
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
    totalAmmValueDollar,
    totalAmmValueYuan,
    balanceA,
    balanceB,
    // ammDetail: { coinAInfo, coinBInfo },
  } = myAmm as any;
  const tradeFloatType =
    tradeFloat?.changeDollar === 0
      ? FloatTag.none
      : tradeFloat && tradeFloat.changeDollar && tradeFloat.changeDollar < 0
      ? FloatTag.decrease
      : FloatTag.increase;
  // const close: any = tradeFloat?.close;
  // const value =
  //   currency === Currency.usd
  //     ? "\u2248 " +
  //       PriceTag.Dollar +
  //       getValuePrecisionThousand(
  //         tradeFloat && tradeFloat.closeDollar ? tradeFloat.closeDollar : 0,
  //         undefined,
  //         undefined,
  //         undefined,
  //         true,
  //         { isFait: true }
  //       )
  //     : "\u2248 " +
  //       PriceTag.Yuan +
  //       getValuePrecisionThousand(
  //         tradeFloat && tradeFloat.closeYuan ? tradeFloat.closeYuan : 0,
  //         undefined,
  //         undefined,
  //         undefined,
  //         true,
  //         { isFait: true }
  //       );

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
        height={"calc(var(--swap-box-height) - 296px)"}
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
      >
        <Grid
          item
          paddingLeft={2}
          paddingY={3}
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
              {/*<Typography variant={"h5"}>*/}
              {/*  {close == "NaN" ? EmptyValueTag : close} {coinPairInfo.coinB}*/}
              {/*</Typography>*/}
              {/*<Typography*/}
              {/*  variant={"h5"}*/}
              {/*  component={"span"}*/}
              {/*  display={"flex"}*/}
              {/*  alignItems={"flex-end"}*/}
              {/*>*/}
              {/*<Typography variant={"h5"} component={"span"}>*/}
              {/*  {value}*/}
              {/*</Typography>*/}
              {/*</Typography>*/}
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
              height: 0,
              paddingTop: "48%",
              marginLeft: "8px",
              borderRight: "1px solid var(--color-divide)",
            }}
            orientation={"vertical"}
          />
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
            >
              {t("labelTVL")}
            </Typography>
            <Typography variant={"body1"} component={"span"}>
              {typeof coinPairInfo.amountDollar === "undefined"
                ? EmptyValueTag
                : currency === Currency.usd
                ? PriceTag.Dollar +
                  abbreviateNumber(coinPairInfo.amountDollar || 0, 2)
                : PriceTag.Yuan +
                  abbreviateNumber(coinPairInfo.amountYuan || 0, 2)}
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
            {typeof totalAmmValueDollar === "undefined" ? (
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
                {typeof totalAmmValueDollar === "undefined"
                  ? EmptyValueTag
                  : currency === Currency.usd
                  ? PriceTag.Dollar +
                    getValuePrecisionThousand(
                      totalAmmValueDollar,
                      undefined,
                      undefined,
                      undefined,
                      true,
                      {
                        isFait: true,
                        floor: true,
                      }
                    )
                  : PriceTag.Yuan +
                    getValuePrecisionThousand(
                      totalAmmValueYuan,
                      undefined,
                      undefined,
                      undefined,
                      true,
                      {
                        isFait: true,
                        floor: true,
                      }
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
              <Box padding={1.5} paddingLeft={1}>
                <Typography
                  component={"span"}
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
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
                    justifyContent={"flex-start"}
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
                        alt={coinAIcon.simpleName as string}
                        src={
                          "data:image/svg+xml;utf8," +
                          '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                        }
                      />
                    ) : (
                      <Avatar
                        variant="circular"
                        alt={coinAIcon.simpleName as string}
                        style={{
                          height: "var(--list-menu-coin-size))",
                          width: "var(--list-menu-coin-size)",
                        }}
                        src={SoursURL + "images/icon-default.png"}
                      />
                    )}
                    <Typography
                      component={"span"}
                      color={"var(--color-text-primary)"}
                      variant={"body2"}
                      marginLeft={1 / 2}
                      height={20}
                      lineHeight={"20px"}
                    >
                      {coinAIcon.simpleName}
                    </Typography>
                  </Box>

                  <Typography
                    component={"span"}
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    height={20}
                    marginLeft={10}
                    lineHeight={"20px"}
                  >
                    {getValuePrecisionThousand(balanceA, 4, 4)}
                  </Typography>
                </Typography>
                <Typography
                  component={"span"}
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  marginTop={1 / 2}
                  style={{ textTransform: "capitalize" }}
                >
                  <Box
                    component={"span"}
                    className={"logo-icon"}
                    display={"flex"}
                    height={"var(--list-menu-coin-size)"}
                    width={"var(--list-menu-coin-size)"}
                    alignItems={"center"}
                    justifyContent={"flex-start"}
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
                        alt={coinBIcon.simpleName as string}
                        src={
                          "data:image/svg+xml;utf8," +
                          '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                        }
                      />
                    ) : (
                      <Avatar
                        variant="circular"
                        alt={coinBIcon.simpleName as string}
                        style={{
                          height: "var(--list-menu-coin-size)",
                          width: "var(--list-menu-coin-size)",
                        }}
                        src={SoursURL + "images/icon-default.png"}
                      />
                    )}
                    <Typography
                      variant={"body2"}
                      color={"var(--color-text-primary)"}
                      component={"span"}
                      marginRight={5}
                      marginLeft={1 / 2}
                      alignSelf={"right"}
                      height={20}
                      lineHeight={"20px"}
                    >
                      {coinBIcon.simpleName}
                    </Typography>
                  </Box>

                  <Typography
                    variant={"body2"}
                    color={"var(--color-text-primary)"}
                    component={"span"}
                    height={20}
                    marginLeft={10}
                    lineHeight={"20px"}
                  >
                    {getValuePrecisionThousand(balanceB, 4, 4)}
                  </Typography>
                </Typography>
              </Box>
            </PopoverPure>
          </Typography>
        </Grid>
      </BoxWrapperStyled>
    </BoxStyle>
  );
};
