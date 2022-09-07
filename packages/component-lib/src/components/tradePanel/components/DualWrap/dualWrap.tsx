import React from "react";
import moment from "moment";
import {
  YEAR_DAY_MINUTE_FORMAT,
  DualCalcData,
  DualViewInfo,
  IBData,
  myLog,
  OrderListIcon,
} from "@loopring-web/common-resources";
import { DualWrapProps } from "./Interface";
import { useTranslation } from "react-i18next";

import { Box, Grid, Tooltip, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { TradeBtnStatus } from "../../Interface";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";
import { useSettings } from "../../../../stores";
import styled from "@emotion/styled";

const BoxChartStyle = styled(Box)`
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
`;

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
  accStatus,
  ...rest
}: DualWrapProps<T, I, DUAL>) => {
  const coinSellRef = React.useRef();
  const { t } = useTranslation();
  const history = useHistory();
  const { isMobile } = useSettings();

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
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
      {dualCalcData.dualViewInfo && (
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
                    symbol: dualCalcData.dualViewInfo?.currentPrice.symbol,
                  })}
                </Typography>
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"textPrimary"}
                >
                  {dualCalcData.dualViewInfo?.currentPrice.currentPrice}
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
                  color={"textPrimary"}
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
                  {dualCalcData.dualViewInfo?.strike}
                </Typography>
              </Typography>
            </Box>
            <Box paddingX={2}>
              <Box height={96} width={"100%"} position={"relative"}>
                <BoxChartStyle />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} display={"flex"}>
            <Box paddingX={2} flex={1}>
              <Box alignSelf={"flex-end"} display={"flex"}>
                <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
                <Typography display={"inline-block"} marginLeft={2}>
                  <IconButtonStyled
                    onClick={() => {
                      history.push(`/l2assets/history/dualRecords`);
                    }}
                    sx={{ backgroundColor: "var(--field-opacity)" }}
                    className={"switch outlined"}
                    aria-label="to Transaction"
                    size={"large"}
                  >
                    <OrderListIcon color={"primary"} fontSize={"large"} />
                  </IconButtonStyled>
                </Typography>
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
