import React from "react";
import moment from "moment";
import {
  DualCalcData,
  DualViewBase,
  DualViewInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  hexToRGB,
  IBData,
  Info2Icon,
  myLog,
  TradeBtnStatus,
  UpColor,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { DualDetailType, DualWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";

import { Box, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { useSettings } from "../../../../stores";
import styled from "@emotion/styled";
import { ButtonStyle } from "../Styled";
import { InputCoin } from "../../../basic-lib";
import * as sdk from "@loopring-web/loopring-sdk";

const BoxChartStyle = styled(Box)(({ theme }: any) => {
  const fillColor: string = theme.colorBase.textThird;
  const whiteColor: string = theme.colorBase.white;
  const svg = encodeURIComponent(
    `<svg viewBox="0 0 24 24" fill="${fillColor}" height="24" width="24"  xmlns="http://www.w3.org/2000/svg"><path d="M12 15L8.5359 11.25L15.4641 11.25L12 15Z" /></svg>`
  );
  const svgStar = encodeURIComponent(
    `<svg viewBox="0 0 24 24" fill="${whiteColor}" height="24" width="24"  xmlns="http://www.w3.org/2000/svg"><path d="M11.6085 5L13.4046 10.5279H19.2169L14.5146 13.9443L16.3107 19.4721L11.6085 16.0557L6.90617 19.4721L8.70228 13.9443L4 10.5279H9.81234L11.6085 5Z" /></svg>`
  );
  return `
   border-radius: ${theme.unit / 2}px;
   overflow:hidden;
   background: var(--color-table-header-bg);
  .backView{
      
      height: 1px;
      left: 0;
      right: 0;
      bottom: 48px;
      position: absolute;
      background-color: var(--color-primary);
      &:before {
        content: "";
        display: block;
        height: 24px;
        width: 24px;
        transform: scale(${14 / 24});
        border-radius: 50%;
        background-image: url("data:image/svg+xml, ${svgStar}");
        background-color: var(--color-primary);
        bottom: -12px;
        left: calc(50% - 12px);
        position: absolute;
        z-index:99;
      }
      .line {
        display: block;
        height: 5px;
        background-color: var(--color-primary);
        bottom: -2px;
        left: 0;
        position: absolute;
        z-index:20;
    }
    }
    .point {
      position: absolute;
      display:flex;
      flex-direction:column;
      align-items: center;
      top: ${theme.unit}px;
      &:after {
        content: "";
        display: block;
        height: 24px;
        width:24px;
        background-image: url("data:image/svg+xml, ${svg}");
        left: calc(50% - 12px);
        bottom: -20px;
        position: absolute;
      }
    }
    .point1 {
      left: 50%;
      transform: translateX(-50%);  
    }
    .point2 {
       transform: translateX(-50%);  
    }
   
    .returnV{
      position: absolute;
      bottom:0;
      height: 48px;
      width:50%;
      display:flex;
      align-items: center;
      justify-content: center;
      text-align:center;
    }
    .returnV1{
      right: 25%;
      transform: translateX(50%);  
      background-color: ${hexToRGB(theme.colorBase.warning, 0.3)};

    }
    .returnV2{
      left: 25%;
      transform: translateX(-50%);
      background-color: ${hexToRGB(theme.colorBase.success, 0.3)};

     
    }
`;
});

enum DisplayMode {
  nonBeginnerMode = 1,
  beginnerModeStep1,
  beginnerModeStep2,
}

export const DualDetail = ({
  dualViewInfo,
  currentPrice,
  tokenMap,
  lessEarnView,
  // lessEarnTokenSymbol,
  // greaterEarnTokenSymbol,
  greaterEarnView,
  isOrder = false,
  displayMode = DisplayMode.nonBeginnerMode,
}: DualDetailType & { displayMode?: DisplayMode; tokenMap: any }) => {
  const { t } = useTranslation();
  const { upColor } = useSettings();
  const { base, quote, precisionForPrice } = currentPrice;
  const currentView = React.useMemo(
    () =>
      base
        ? getValuePrecisionThousand(
            currentPrice.currentPrice,
            precisionForPrice
              ? precisionForPrice
              : tokenMap[quote].precisionForOrder,
            precisionForPrice
              ? precisionForPrice
              : tokenMap[quote].precisionForOrder,
            precisionForPrice
              ? precisionForPrice
              : tokenMap[quote].precisionForOrder,
            true,
            { floor: true }
          )
        : EmptyValueTag,
    [dualViewInfo.currentPrice.currentPrice, precisionForPrice, tokenMap]
  );

  const targetView = React.useMemo(
    () =>
      Number(dualViewInfo?.strike).toLocaleString("en-US")
        ? Number(dualViewInfo?.strike).toLocaleString("en-US") + " USDT"
        : EmptyValueTag,
    [dualViewInfo?.strike]
  );

  return (
    <Box>
      {displayMode !== DisplayMode.beginnerModeStep1 && (
        <Box paddingX={2} paddingBottom={1}>
          <BoxChartStyle height={128} width={"100%"} position={"relative"}>
            <Box className={"point1 point"}>
              <Typography
                variant={"body2"}
                whiteSpace={"pre"}
                color={"textPrimary"}
              >
                {t("labelDualTargetPrice3")}
              </Typography>
              <Typography>{targetView}</Typography>
            </Box>
            <Box
              className={"point2 point"}
              whiteSpace={"pre"}
              sx={{
                left: sdk
                  .toBig(dualViewInfo.currentPrice?.currentPrice ?? 0)
                  .minus(dualViewInfo.strike)
                  .gte(0)
                  ? "75%"
                  : "25%",
              }}
            >
              <Typography variant={"body2"} color={"textPrimary"}>
                {t("labelDualCurrentPrice3", {
                  symbol: base,
                })}
              </Typography>
              <Typography
                color={
                  upColor == UpColor.green
                    ? "var(--color-error)"
                    : "var(--color-success)"
                }
              >
                {currentView}
              </Typography>
            </Box>
            <Box className={"returnV1 returnV"}>
              <Typography
                variant={"body2"}
                color={"var(--color-warning)"}
                whiteSpace={"pre-line"}
              >
                {quote &&
                  t("labelDualReturn", {
                    symbol:
                      (greaterEarnView === "0"
                        ? EmptyValueTag
                        : greaterEarnView) +
                      " " +
                      quote,
                  })}
              </Typography>
            </Box>
            <Box className={"returnV2 returnV"}>
              <Typography
                variant={"body2"}
                color={"var(--color-success)"}
                whiteSpace={"pre-line"}
              >
                {base &&
                  t("labelDualReturn", {
                    symbol:
                      (lessEarnView === "0" ? EmptyValueTag : lessEarnView) +
                      " " +
                      base,
                  })}
              </Typography>
            </Box>
            <Box className={"backView"}>
              <Box
                className={"line"}
                width={
                  sdk
                    .toBig(dualViewInfo.currentPrice?.currentPrice ?? 0)
                    .minus(dualViewInfo.strike)
                    .gte(0)
                    ? "75%"
                    : "25%"
                }
              />
            </Box>
          </BoxChartStyle>
        </Box>
      )}
      {displayMode === DisplayMode.beginnerModeStep2 && (
        <>
          <Box paddingX={2} marginTop={2}>
            <Typography variant={"h5"} marginBottom={0}>
              {t("At Settlement Date")}
            </Typography>
            <Typography color={"textSecondary"} marginBottom={1}>
              {t("labelDualBeginnerIndexPriceDes")}
            </Typography>
            <Box
              marginBottom={1}
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Typography>
                {" "}
                {t(
                  dualViewInfo.isUp
                    ? "labelDualBeginnerPriceSmallerThan"
                    : "labelDualBeginnerPriceSmallerThanOrEqual",
                  {
                    value: targetView,
                  }
                )}
              </Typography>
              <Typography>
                {base &&
                  t("labelDualReturn", {
                    symbol:
                      (lessEarnView === "0" ? EmptyValueTag : lessEarnView) +
                      " " +
                      base,
                  })}
              </Typography>
            </Box>
            <Box
              marginBottom={5}
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Typography>
                {t(
                  dualViewInfo.isUp
                    ? "labelDualBeginnerPriceGreaterThanOrEqual"
                    : "labelDualBeginnerPriceGreaterThan",
                  {
                    value: targetView,
                  }
                )}
              </Typography>
              <Typography>
                {quote &&
                  t("labelDualReturn", {
                    symbol:
                      (greaterEarnView === "0"
                        ? EmptyValueTag
                        : greaterEarnView) +
                      " " +
                      quote,
                  })}
              </Typography>
            </Box>
          </Box>
          <Typography
            textAlign={"center"}
            color={"var(--color-text-third)"}
            variant={"body2"}
          >
            {t("labelDualBeginnerLockingDes")}
          </Typography>
        </>
      )}
      {displayMode !== DisplayMode.beginnerModeStep2 && (
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"stretch"}
          justifyContent={"space-between"}
          paddingX={2}
          marginTop={displayMode === DisplayMode.nonBeginnerMode ? 2 : 0}
        >
          {displayMode === DisplayMode.nonBeginnerMode && (
            <>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                paddingBottom={1}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                >
                  {t("labelDualCalcLabel", {
                    symbol: base,
                    tag: dualViewInfo.isUp ? "<" : "≤",
                    target: targetView,
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                  whiteSpace={"pre-line"}
                >
                  {t("labelDualReturnValue", {
                    symbol: base,
                    value: lessEarnView === "0" ? EmptyValueTag : lessEarnView,
                  })}
                </Typography>
              </Typography>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                paddingBottom={3}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                  whiteSpace={"pre-line"}
                >
                  {t("labelDualCalcLabel", {
                    symbol: base,
                    tag: dualViewInfo.isUp ? "≥" : ">",
                    target: targetView,
                    interpolation: {
                      escapeValue: false,
                    },
                  })}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {t("labelDualReturnValue", {
                    symbol: quote,
                    value:
                      greaterEarnView === "0" ? EmptyValueTag : greaterEarnView,
                  })}
                </Typography>
              </Typography>
            </>
          )}

          {isOrder && (
            <Box paddingBottom={1}>
              <Divider />
            </Box>
          )}
          <Typography
            variant={"body1"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            paddingBottom={1}
            order={isOrder ? 4 : 0}
          >
            <Tooltip title={t("labelDualCurrentAPRDes").toString()}>
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"textSecondary"}
                display={"inline-flex"}
                alignItems={"center"}
              >
                <Trans i18nKey={"labelDualCurrentAPR"}>
                  APR
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                </Trans>
              </Typography>
            </Tooltip>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={
                upColor == UpColor.green
                  ? "var(--color-success)"
                  : "var(--color-error)"
              }
            >
              {dualViewInfo?.apy}
            </Typography>
          </Typography>

          <Typography
            variant={"body1"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            paddingBottom={1}
            order={isOrder ? 5 : 1}
          >
            <Tooltip title={t("labelDualTargetPriceDes").toString()}>
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"textSecondary"}
                display={"inline-flex"}
                alignItems={"center"}
              >
                <Trans i18nKey={"labelDualTargetPrice2"}>
                  Target Price
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                </Trans>
              </Typography>
            </Tooltip>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textPrimary"}
            >
              {targetView}
            </Typography>
          </Typography>
          {isOrder && dualViewInfo.enterTime && (
            <>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                paddingBottom={1}
                order={1}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  {t("labelDualSubDate")}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {moment(new Date(dualViewInfo.enterTime)).format(
                    YEAR_DAY_MINUTE_FORMAT
                  )}
                </Typography>
              </Typography>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                paddingBottom={1}
                order={0}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  {t("labelDualAmount")}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {dualViewInfo?.amount}
                </Typography>
              </Typography>
            </>
          )}
          <Typography
            variant={"body1"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            paddingBottom={1}
            order={isOrder ? 2 : 2}
          >
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              {t("labelDualSettleDate")}
            </Typography>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textPrimary"}
            >
              {moment(new Date(dualViewInfo.expireTime)).format(
                YEAR_DAY_MINUTE_FORMAT
              )}
            </Typography>
          </Typography>
          <Typography
            variant={"body1"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            paddingBottom={1}
            order={isOrder ? 3 : 3}
          >
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              {t("labelDualSettleDateDur")}
            </Typography>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textPrimary"}
            >
              {getValuePrecisionThousand(
                (dualViewInfo.expireTime -
                  (isOrder && dualViewInfo.enterTime
                    ? dualViewInfo.enterTime
                    : Date.now())) /
                  (1000 * 60 * 60 * 24),
                1,
                1,
                1,
                true,
                { floor: true }
              )}
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const DualWrap = <
  T extends IBData<I>,
  I,
  DUAL extends DualCalcData<R>,
  R extends DualViewInfo
>({
  refreshRef,
  disabled,
  btnInfo,
  isLoading,
  onRefreshData,
  onSubmitClick,
  onChangeEvent,
  tokenSellProps,
  dualCalcData,
  handleError,
  tokenSell,
  btnStatus,
  tokenMap,
  accStatus,
  isBeginnerMode,
  ...rest
}: DualWrapProps<T, I, DUAL> & { isBeginnerMode: boolean }) => {
  const coinSellRef = React.useRef();
  const { t } = useTranslation();
  const priceSymbol = dualCalcData?.dualViewInfo?.currentPrice?.quote;
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>(
    isBeginnerMode ? DisplayMode.beginnerModeStep1 : DisplayMode.nonBeginnerMode
  );

  const getDisabled = React.useMemo(() => {
    return disabled || dualCalcData === undefined;
  }, [btnStatus, dualCalcData, disabled]);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (dualCalcData["coinSell"].tradeValue !== ibData.tradeValue) {
        myLog("dual handleCountChange", _name, ibData);

        onChangeEvent({
          tradeData: { ...ibData },
        });
      }
    },
    [dualCalcData, onChangeEvent]
  );

  const propsSell = {
    label: t("tokenEnterPaymentToken"),
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText: dualCalcData.maxSellAmount
      ? t("labelInvestMaxDual", {
          value: getValuePrecisionThousand(
            dualCalcData.maxSellAmount,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            false,
            { floor: false, isAbbreviate: true }
          ),
        })
      : "0.00",
    maxAllow: true,
    name: "coinSell",
    isHideError: true,
    order: "right" as any,
    decimalsLimit: tokenSell.precision,
    coinPrecision: tokenSell.precision,
    inputData: dualCalcData ? dualCalcData.coinSell : ({} as any),
    coinMap: {},
    ...tokenSellProps,
    handleError: handleError as any,
    handleCountChange,
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    ...rest,
  } as any;
  console.log("propsSell", dualCalcData);
  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return displayMode === DisplayMode.beginnerModeStep1
        ? t("labelContinue")
        : t(`labelInvestBtn`);
    }
  }, [t, btnInfo]);
  const lessEarnView = React.useMemo(
    () =>
      dualCalcData.lessEarnVol && tokenMap[dualCalcData.lessEarnTokenSymbol]
        ? getValuePrecisionThousand(
            sdk
              .toBig(dualCalcData.lessEarnVol)
              .div("1e" + tokenMap[dualCalcData.lessEarnTokenSymbol].decimals),
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            false,
            { floor: true }
          )
        : EmptyValueTag,
    [dualCalcData.lessEarnTokenSymbol, dualCalcData.lessEarnVol, tokenMap]
  );
  const greaterEarnView = React.useMemo(
    () =>
      dualCalcData.greaterEarnVol &&
      tokenMap[dualCalcData.greaterEarnTokenSymbol]
        ? getValuePrecisionThousand(
            sdk
              .toBig(dualCalcData.greaterEarnVol)
              .div(
                "1e" + tokenMap[dualCalcData.greaterEarnTokenSymbol].decimals
              ),
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            false,
            { floor: true }
          )
        : EmptyValueTag,
    [dualCalcData.greaterEarnTokenSymbol, dualCalcData.greaterEarnVol, tokenMap]
  );

  const totalQuota = React.useMemo(
    () =>
      dualCalcData.quota && dualCalcData.sellToken
        ? getValuePrecisionThousand(
            dualCalcData.quota,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            false,
            { floor: false, isAbbreviate: true }
          )
        : EmptyValueTag,
    [dualCalcData]
  );

  return (
    <Grid
      className={dualCalcData.dualViewInfo ? "" : "loading"}
      container
      justifyContent={"space-between"}
      alignItems={"stretch"}
      flex={1}
      height={"100%"}
    >
      {dualCalcData.dualViewInfo && priceSymbol && (
        <>
          {displayMode !== DisplayMode.beginnerModeStep2 && (
            <Grid
              item
              xs={12}
              flexDirection={"column"}
              alignItems={"stretch"}
              justifyContent={"space-between"}
              display={"flex"}
            >
              <Box
                paddingX={2}
                display={"flex"}
                alignItems={"stretch"}
                justifyContent={"space-between"}
                flexDirection={"column"}
              >
                <InputCoin<any, I, any>
                  ref={coinSellRef}
                  disabled={getDisabled}
                  {...{
                    ...propsSell,
                  }}
                />
                <Typography
                  variant={"body1"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  paddingTop={1}
                  paddingBottom={2}
                >
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"textSecondary"}
                  >
                    {t("labelDualQuota")}
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"textPrimary"}
                  >
                    {totalQuota + " " + dualCalcData.coinSell.belong}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          )}
          <Grid
            item
            xs={12}
            // order={isMobile ? 1 : 0}
            flexDirection={"column"}
            alignItems={"stretch"}
            justifyContent={"space-between"}
          >
            {displayMode === DisplayMode.nonBeginnerMode && (
              <Typography
                variant={"body1"}
                component={"h6"}
                color={"textSecondary"}
                paddingX={2}
                paddingY={1}
              >
                {t("labelDualSettlementCalculator")}
              </Typography>
            )}
            <DualDetail
              dualViewInfo={dualCalcData.dualViewInfo as DualViewBase}
              currentPrice={dualCalcData.dualViewInfo.currentPrice}
              tokenMap={tokenMap}
              lessEarnTokenSymbol={dualCalcData.lessEarnTokenSymbol}
              greaterEarnTokenSymbol={dualCalcData.greaterEarnTokenSymbol}
              lessEarnView={lessEarnView}
              greaterEarnView={greaterEarnView}
              displayMode={displayMode}
            />
          </Grid>
          <Grid item xs={12}>
            <Box paddingX={2} marginTop={2}>
              <ButtonStyle
                fullWidth
                variant={"contained"}
                size={"medium"}
                color={"primary"}
                onClick={() => {
                  if (
                    !btnInfo?.label &&
                    displayMode === DisplayMode.beginnerModeStep1
                  ) {
                    setDisplayMode(DisplayMode.beginnerModeStep2);
                  } else {
                    onSubmitClick();
                  }
                }}
                loading={
                  !getDisabled && btnStatus === TradeBtnStatus.LOADING
                    ? "true"
                    : "false"
                }
                disabled={
                  getDisabled ||
                  btnStatus === TradeBtnStatus.LOADING ||
                  btnStatus === TradeBtnStatus.DISABLED
                }
              >
                {label}
              </ButtonStyle>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  );
};
