import React from "react";
import moment from "moment";
import {
  DualCalcData,
  DualCurrentPrice,
  DualViewInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  hexToRGB,
  IBData,
  myLog,
  UpColor,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { DualWrapProps } from "./Interface";
import { useTranslation } from "react-i18next";

import { Box, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { useSettings } from "../../../../stores";
import styled from "@emotion/styled";
import { ButtonStyle } from "../Styled";
import { InputCoin } from "../../../basic-lib";
import { TradeBtnStatus } from "../../Interface";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE } from "@loopring-web/loopring-sdk";

const BoxChartStyle = styled(Box)(({ theme }: any) => {
  const fillColor: string = theme.colorBase.textThird;
  const svg = encodeURIComponent(
    `<svg viewBox="0 0 24 24" fill="${fillColor}" height="24" width="24"  xmlns="http://www.w3.org/2000/svg"><path d="M12 15L8.5359 11.25L15.4641 11.25L12 15Z" /></svg>`
  );
  return `
   .backView{
      height: 1px;
      left: 0;
      right: 0;
      bottom: 30px;
      position: absolute;
      background-color: var(--color-primary);
    
      &:before {
        content: "";
        display: block;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background-color: var(--color-primary);
        bottom: -7px;
        left: calc(50% - 7px);
        position: absolute;
        z-index:99;
      }
      .line {
        display: block;
        height: 7px;
        background-color: var(--color-warning);
        bottom: -3px;
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
      top: 0px;
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
      height: 30px;
      width:50%;
      display:flex;
      align-items: center;
      justify-content: center;
    }
    .returnV1{
      right: 25%;
      transform: translateX(50%);  
      background-color: ${hexToRGB(theme.colorBase.success, 0.3)};
    }
    .returnV2{
      left: 25%;
      transform: translateX(-50%);
      background-color: ${hexToRGB(theme.colorBase.warning, 0.3)};

     
    }
`;
});
export const DualDetail = ({
  dualViewInfo,
  currentPrice,
  tokenMap,
  lessEarnView,
  lessEarnTokenSymbol,
  greaterEarnTokenSymbol,
  greaterEarnView,
}: {
  dualViewInfo: DualViewInfo;
  currentPrice: DualCurrentPrice;
  tokenMap: any;
  lessEarnView: string;
  greaterEarnView: string;
  lessEarnTokenSymbol: string;
  greaterEarnTokenSymbol: string;
}) => {
  const { t } = useTranslation();
  const { upColor } = useSettings();
  const { base: priceBase } = currentPrice;
  const currentView = React.useMemo(
    () =>
      priceBase
        ? getValuePrecisionThousand(
            // dualCalcData.dualViewInfo.currentPrice.currentPrice,
            dualViewInfo.__raw__.index.index,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            true,
            { floor: true }
          )
        : EmptyValueTag,
    [dualViewInfo.currentPrice.currentPrice, priceBase, tokenMap]
  );

  const targetView = React.useMemo(
    () =>
      priceBase
        ? getValuePrecisionThousand(
            dualViewInfo?.strike,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            true,
            { floor: true }
          )
        : EmptyValueTag,
    [dualViewInfo?.strike, priceBase, tokenMap]
  );
  return (
    <Box>
      <Box paddingX={2} paddingBottom={1}>
        <BoxChartStyle height={96} width={"100%"} position={"relative"}>
          <Box className={"point1 point"}>
            <Typography
              variant={"body2"}
              whiteSpace={"pre"}
              color={"textPrimary"}
            >
              {t("labelDualTargetPrice2")}
            </Typography>
            <Typography>{targetView}</Typography>
          </Box>
          <Box
            className={"point2 point"}
            whiteSpace={"pre"}
            sx={{
              left:
                Number(dualViewInfo.__raw__.index.index) >
                Number(dualViewInfo?.strike)
                  ? "75%"
                  : "25%",
            }}
          >
            <Typography variant={"body2"} color={"textPrimary"}>
              {t("labelDualCurrentPrice3", {
                symbol: priceBase,
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
            <Typography variant={"body2"} color={"textPrimary"}>
              {t("labelDualReturn", {
                symbol:
                  (greaterEarnView === "0" ? EmptyValueTag : greaterEarnView) +
                  " " +
                  greaterEarnTokenSymbol,
              })}
            </Typography>
          </Box>
          <Box className={"returnV2 returnV"}>
            <Typography variant={"body2"} color={"textPrimary"}>
              {t("labelDualReturn", {
                symbol:
                  (lessEarnView === "0" ? EmptyValueTag : lessEarnView) +
                    " " +
                    lessEarnTokenSymbol ?? dualViewInfo.__raw__.info.base,
              })}
            </Typography>
          </Box>
          <Box className={"backView"}>
            <Box
              className={"line"}
              width={
                Number(dualViewInfo.__raw__.index.index) >
                Number(dualViewInfo.strike)
                  ? "75%"
                  : "25%"
              }
            />
          </Box>
        </BoxChartStyle>

        {/*<Box marginTop={1}>*/}
        {/*  <Typography*/}
        {/*    color={"textSecondary"}*/}
        {/*    whiteSpace={"pre-line"}*/}
        {/*    variant={"body1"}*/}
        {/*  >*/}
        {/*    {t("labelDualRiskDes")}*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        justifyContent={"space-between"}
        paddingX={2}
      >
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
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
          >
            {t("labelDualCurrentPrice2", {
              symbol: priceBase,
            })}
          </Typography>
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textPrimary"}
          >
            {currentView}
          </Typography>
        </Typography>

        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={1}
        >
          <Tooltip title={t("labelDualCurrentAPRDes").toString()}>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {t("labelDualCurrentAPR")}
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
        >
          <Tooltip title={t("labelDualTargetPriceDes").toString()}>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {t("labelDualTargetPrice2")}
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
      </Box>
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
  ...rest
}: DualWrapProps<T, I, DUAL>) => {
  const coinSellRef = React.useRef();
  const { t } = useTranslation();
  // myLog("refreshRef", refreshRef);
  // const history = useHistory();
  const priceSymbol = dualCalcData?.dualViewInfo?.currentPrice?.quote;
  const priceBase = dualCalcData?.dualViewInfo?.currentPrice?.base;

  const getDisabled = React.useMemo(() => {
    return disabled || dualCalcData === undefined;
  }, [btnStatus, dualCalcData, disabled]);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      // const focus: DualChgType =
      //   _ref?.current === coinSellRef.current
      //     ? DualChgType.coinSell
      //     : DualChgType.coinBuy;

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
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenSellProps,
    handleError: handleError as any,
    handleCountChange,
    ...rest,
  };
  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return t(`labelInvestBtn`);
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
  const targetView = React.useMemo(
    () =>
      priceBase
        ? getValuePrecisionThousand(
            dualCalcData.dualViewInfo?.strike,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            tokenMap[priceBase].precision,
            true,
            { floor: true }
          )
        : EmptyValueTag,
    [dualCalcData.dualViewInfo?.strike, priceBase, tokenMap]
  );
  const maxSellAmount = React.useMemo(
    () =>
      dualCalcData.maxSellAmount && dualCalcData.sellToken
        ? getValuePrecisionThousand(
            dualCalcData.maxSellAmount,
            // sdk
            //   .toBig(dualCalcData.maxSellVol)
            //   .div("1e" + dualCalcData.sellToken.decimals),decimals
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            false,
            { floor: false, isAbbreviate: true }
          )
        : EmptyValueTag,
    [dualCalcData]
  );
  myLog("maxSellAmount", dualCalcData.maxSellAmount, maxSellAmount);

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
                  name: "coinSell",
                  isHideError: true,
                  order: "right",
                  inputData: dualCalcData ? dualCalcData.coinSell : ({} as any),
                  coinMap: {},
                  coinPrecision: tokenSell.precision,
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
                  {maxSellAmount + " " + dualCalcData.coinSell.belong}
                </Typography>
              </Typography>
            </Box>
            <Box paddingX={2}>
              <Box
                borderRadius={1}
                marginBottom={2}
                style={{ background: "var(--color-table-header-bg)" }}
                alignItems={"stretch"}
                display={"flex"}
                paddingY={1}
                paddingX={2}
                flexDirection={"column"}
              >
                <Typography
                  variant={"subtitle1"}
                  color={"textSecondary"}
                  alignSelf={"flex-start"}
                  marginBottom={1}
                >
                  {t("labelDualReceive")}
                </Typography>
                <Divider />
                <Typography
                  variant={"body1"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  paddingBottom={1}
                  marginTop={1}
                >
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"textSecondary"}
                  >
                    {t("labelDualCalcLabel", {
                      symbol: priceBase,
                      tag:
                        dualCalcData.dualViewInfo.__raw__.info.dualType ===
                        DUAL_TYPE.DUAL_CURRENCY
                          ? "≤"
                          : "<",
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
                      symbol: dualCalcData.lessEarnTokenSymbol,
                      value:
                        lessEarnView === "0" ? EmptyValueTag : lessEarnView,
                    })}
                  </Typography>
                </Typography>
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
                    whiteSpace={"pre-line"}
                  >
                    {t("labelDualCalcLabel", {
                      symbol: priceBase,
                      tag:
                        dualCalcData.dualViewInfo.__raw__.info.dualType ===
                        DUAL_TYPE.DUAL_BASE
                          ? "≥"
                          : ">",
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
                      symbol: dualCalcData.greaterEarnTokenSymbol,
                      value:
                        greaterEarnView === "0"
                          ? EmptyValueTag
                          : greaterEarnView,
                    })}
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            // order={isMobile ? 1 : 0}
            flexDirection={"column"}
            alignItems={"stretch"}
            justifyContent={"space-between"}
          >
            <DualDetail
              dualViewInfo={dualCalcData.dualViewInfo}
              currentPrice={dualCalcData.dualViewInfo.currentPrice}
              tokenMap={tokenMap}
              lessEarnTokenSymbol={dualCalcData.lessEarnTokenSymbol}
              greaterEarnTokenSymbol={dualCalcData.greaterEarnTokenSymbol}
              lessEarnView={lessEarnView}
              greaterEarnView={greaterEarnView}
            />
          </Grid>
          <Grid item xs={12}>
            <Box paddingX={2}>
              <ButtonStyle
                fullWidth
                variant={"contained"}
                size={"medium"}
                color={"primary"}
                onClick={() => {
                  onSubmitClick();
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
