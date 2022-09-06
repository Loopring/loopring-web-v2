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

import { Box, Grid, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { TradeBtnStatus } from "../../Interface";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";
import { useSettings } from "../../../../stores";

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
      className={dualCalcData ? "" : "loading"}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
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
        >
          <Typography
            variant={"body1"}
            display={"inline-flexl"}
            justifyContent={"space-between"}
          >
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {t("labelDualSubDate")}
              {/*labelDualSubDate:Subscription Date*/}
            </Typography>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {moment().format(YEAR_DAY_MINUTE_FORMAT)}
            </Typography>
          </Typography>
          <Typography
            variant={"body1"}
            display={"inline-flexl"}
            justifyContent={"space-between"}
          >
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {t("labelDualSettlDate")}
              {/*labelDualSettlDate:Settlement Date*/}
            </Typography>
            <Typography
              component={"span"}
              variant={"inherit"}
              color={"textSecondary"}
            >
              {moment(new Date(dualCalcData.dualViewInfo.expireTime)).format(
                YEAR_DAY_MINUTE_FORMAT
              )}
            </Typography>
          </Typography>
        </Box>
        <Box></Box>
      </Grid>
      2022-06-16 15:56 2022-06-17 16:00 Current BTC Price 22,000.87 APR 175.87%
      Target Price 19,500
      <Grid item xs={12} md={6}></Grid>
      <Grid
        item
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexDirection={"row"}
        width={"100%"}
        className={"MuiToolbar-root"}
      >
        <Typography
          height={"100%"}
          display={"inline-flex"}
          variant={"h5"}
          alignItems={"center"}
          alignSelf={"self-start"}
        >
          {t("labelInvestdualTitle")}
        </Typography>
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
      </Grid>
      <Grid
        item
        marginTop={3}
        flexDirection={"column"}
        display={"flex"}
        alignSelf={"stretch"}
        alignItems={"stretch"}
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
      </Grid>
      <Grid item alignSelf={"stretch"}>
        <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
          <Grid item>
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
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
