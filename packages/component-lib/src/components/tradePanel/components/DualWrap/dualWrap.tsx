import React from "react";
import moment from "moment";
import {
  YEAR_DAY_MINUTE_FORMAT,
  DualCalcData,
  DualViewInfo,
  IBData,
  myLog,
  UpColor,
  getValuePrecisionThousand,
  EmptyValueTag,
} from "@loopring-web/common-resources";
import { DualWrapProps } from "./Interface";
import { useTranslation } from "react-i18next";

import { Box, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { useSettings } from "../../../../stores";
import styled from "@emotion/styled";
import { CountDownIcon } from "../tool/Refresh";
import { ButtonStyle } from "../Styled";
import { InputCoin } from "../../../basic-lib";
import { TradeBtnStatus } from "../../Interface";
import * as sdk from "@loopring-web/loopring-sdk";

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
      }
      &:after {
        content: "";
        display: block;
        height: 7px;
        width: calc(25% - 7px);
        background-color: var(--color-warning);
        bottom: -3px;
        left: 0;
        position: absolute;
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
       left: 25%;
       transform: translateX(-50%);  
    }
    .returnV1{
      position: absolute;
      right: 25%;
      transform: translateX(50%);
      bottom:0
    }
    .returnV2{
      position: absolute;
      left: 25%;
      transform: translateX(-50%);
      bottom:0
    }
`;
});

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
  // const history = useHistory();
  const { isMobile, upColor } = useSettings();
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
  // const covertOnClick = React.useCallback(() => {
  //   onChangeEvent({
  //     tradeData: undefined,
  //   });
  // }, [onChangeEvent]);
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
  const targetView = React.useMemo(
    () =>
      priceSymbol
        ? getValuePrecisionThousand(
            dualCalcData.dualViewInfo?.strike,
            tokenMap[priceSymbol].precision,
            tokenMap[priceSymbol].precision,
            tokenMap[priceSymbol].precision,
            false,
            { floor: true }
          )
        : EmptyValueTag,
    [dualCalcData.dualViewInfo?.strike, priceSymbol, tokenMap]
  );

  const currentView = React.useMemo(
    () =>
      priceSymbol
        ? getValuePrecisionThousand(
            dualCalcData.dualViewInfo.currentPrice.currentPrice,
            tokenMap[priceSymbol].precision,
            tokenMap[priceSymbol].precision,
            tokenMap[priceSymbol].precision,
            false,
            { floor: true }
          )
        : EmptyValueTag,
    [dualCalcData.dualViewInfo.currentPrice.currentPrice, priceSymbol, tokenMap]
  );

  // const maxValue =
  //   tokenBuy.symbol &&
  //   maxBuyVol &&
  //   `${getValuePrecisionThousand(
  //     new BigNumber(maxBuyVol ?? 0).div("1e" + tokenBuy.decimals),
  //     tokenBuy.precision,
  //     tokenBuy.precision,
  //     tokenBuy.precision,
  //     false,
  //     { floor: true }
  //   )} ${tokenBuy.symbol}`;

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
            md={6}
            order={isMobile ? 1 : 0}
            flexDirection={"column"}
            alignItems={"stretch"}
            justifyContent={"space-between"}
          >
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
                justifyContent={"space-between"}
                paddingBottom={1}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                >
                  {t("labelDualSubDate")}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {moment().format(YEAR_DAY_MINUTE_FORMAT)}
                </Typography>
              </Typography>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
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
                  {moment(
                    new Date(dualCalcData.dualViewInfo.expireTime)
                  ).format(YEAR_DAY_MINUTE_FORMAT)}
                </Typography>
              </Typography>
              <Typography
                variant={"body1"}
                display={"inline-flex"}
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
                  {dualCalcData.dualViewInfo?.apy}
                </Typography>
              </Typography>

              <Typography
                variant={"body1"}
                display={"inline-flex"}
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
            <Box paddingX={2}>
              <BoxChartStyle height={96} width={"100%"} position={"relative"}>
                <Box className={"backView"} />
                <Box className={"point1 point"}>
                  <Typography>{t("labelDualTargetPrice2")}</Typography>
                  <Typography>{targetView}</Typography>
                </Box>
                <Box className={"point2 point"}>
                  <Typography>
                    {t("labelDualCurrentPrice2", {
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
                <Box className={"returnV1"}>
                  <Typography>
                    {t("labelDualReturn", {
                      symbol: dualCalcData.dualViewInfo.sellSymbol,
                    })}
                  </Typography>
                </Box>
                <Box className={"returnV2"}>
                  <Typography>
                    {t("labelDualReturn", {
                      symbol: dualCalcData.dualViewInfo.buySymbol,
                    })}
                  </Typography>
                </Box>
              </BoxChartStyle>

              <Box marginTop={1}>
                <Typography
                  color={"textSecondary"}
                  whiteSpace={"pre-line"}
                  variant={"body1"}
                >
                  {t("labelDualRiskDes")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            flexDirection={"column"}
            alignItems={"stretch"}
            justifyContent={"space-between"}
            display={"flex"}
          >
            <Box
              paddingX={2}
              flex={1}
              display={"flex"}
              alignItems={"stretch"}
              justifyContent={"space-between"}
              flexDirection={"column"}
            >
              <Box alignSelf={"flex-end"} sx={{ display: "none" }}>
                <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
              </Box>
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
                justifyContent={"space-between"}
                paddingBottom={1}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textSecondary"}
                >
                  {t("labelDualSubDate")}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {moment().format(YEAR_DAY_MINUTE_FORMAT)}
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
                  variant={"subtitle2"}
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
                      symbol: priceSymbol,
                      tag: "<",
                      target: targetView,
                    })}
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"textPrimary"}
                  >
                    {t("labelDualReturnValue", {
                      symbol: dualCalcData.lessEarnTokenSymbol,
                      value:
                        dualCalcData.lessEarnVol &&
                        tokenMap[dualCalcData.lessEarnTokenSymbol]
                          ? getValuePrecisionThousand(
                              sdk
                                .toBig(dualCalcData.lessEarnVol)
                                .div(
                                  "1e" +
                                    tokenMap[dualCalcData.lessEarnTokenSymbol]
                                      .decimals
                                ),
                              tokenMap[dualCalcData.lessEarnTokenSymbol]
                                .precision,
                              tokenMap[dualCalcData.lessEarnTokenSymbol]
                                .precision,
                              tokenMap[dualCalcData.lessEarnTokenSymbol]
                                .precision,
                              false,
                              { floor: true }
                            )
                          : EmptyValueTag,
                    })}
                  </Typography>
                </Typography>
                <Typography
                  variant={"body1"}
                  display={"inline-flex"}
                  justifyContent={"space-between"}
                  paddingBottom={1}
                >
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"textSecondary"}
                  >
                    {t("labelDualCalcLabel", {
                      symbol: priceSymbol,
                      tag: ">",
                      target: targetView,
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
                        dualCalcData.greaterEarnVol &&
                        tokenMap[dualCalcData.greaterEarnTokenSymbol]
                          ? getValuePrecisionThousand(
                              sdk
                                .toBig(dualCalcData.greaterEarnVol)
                                .div(
                                  "1e" +
                                    tokenMap[
                                      dualCalcData.greaterEarnTokenSymbol
                                    ].decimals
                                ),
                              tokenMap[dualCalcData.greaterEarnTokenSymbol]
                                .precision,
                              tokenMap[dualCalcData.greaterEarnTokenSymbol]
                                .precision,
                              tokenMap[dualCalcData.greaterEarnTokenSymbol]
                                .precision,
                              false,
                              { floor: true }
                            )
                          : EmptyValueTag,
                    })}
                  </Typography>
                </Typography>
              </Box>
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
};;
