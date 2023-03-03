import {
  DeFiSideCalcData,
  IBData,
  Info2Icon,
  myLog,
  OrderListIcon,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { DeFiSideWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Tooltip, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";
import styled from "@emotion/styled";

const GridStyle = styled(Grid)`
  ul {
    list-style: disc;
    padding-left: ${({ theme }) => theme.unit}px;
  }
`;

export const DeFiSideWrap = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideCalcData<T>
>({
  disabled,
  isJoin,
  btnInfo,
  refreshRef,
  onRefreshData,
  onSubmitClick,
  onConfirm,
  type,
  confirmShowLimitBalance,
  switchStobEvent,
  onChangeEvent,
  handleError,
  deFiSideCalcData,
  accStatus,
  tokenSell,
  isLoading,
  btnStatus,
  tokenSellProps,
  maxSellVol,
  ...rest
}: DeFiSideWrapProps<T, I, ACD>) => {
  // @ts-ignore
  const coinSellRef = React.useRef();

  const { t } = useTranslation();
  const history = useHistory();
  const getDisabled = React.useMemo(() => {
    return disabled || deFiSideCalcData === undefined;
  }, [btnStatus, deFiSideCalcData, disabled]);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (deFiSideCalcData.coinSell.tradeValue !== ibData.tradeValue) {
        myLog("defi handleCountChange", _name, ibData);

        onChangeEvent({
          tradeData: { ...ibData },
        });
      }
    },
    [deFiSideCalcData, onChangeEvent]
  );

  const propsSell = {
    label: t("tokenEnterPaymentToken"),
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: true,
    ...tokenSellProps,
    handleError: handleError as any,
    handleCountChange: handleCountChange as any,
    ...rest,
  } as any;

  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return isJoin ? t(`labelInvestBtn`) : t(`labelRedeemBtn`);
    }
  }, [isJoin, t, btnInfo]);

  const maxValue = "";

  return (
    <Grid
      className={deFiSideCalcData ? "" : "loading"}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
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
          {t("labelInvestLRCTitle")}
        </Typography>
        <Box alignSelf={"flex-end"} display={"flex"}>
          <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
          <Typography display={"inline-block"} marginLeft={2}>
            <IconButtonStyled
              onClick={() => {
                history.push(`/l2assets/history/defiSideRecords`);
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
        <InputCoin<T, I, any>
          ref={coinSellRef}
          disabled={getDisabled}
          {...{
            ...propsSell,
            name: "coinSell",
            isHideError: true,
            order: "right",
            inputData: deFiSideCalcData
              ? deFiSideCalcData.coinSell
              : ({} as any),
            coinMap: {},
            coinPrecision: tokenSell.precision,
          }}
        />
      </Grid>
      <Grid item alignSelf={"stretch"} marginTop={1 / 2} marginBottom={2}>
        <Typography
          component={"span"}
          display={"inline-flex"}
          color={"textSecondary"}
          variant={"body2"}
        >
          <Trans i18nKey={"labelInvestLRCStakingLockAlert"}>
            <Typography component={"span"}>*</Typography>Your assets for
            investment will be locked until your redemption.
          </Trans>
        </Typography>
      </Grid>
      <Grid
        container
        justifyContent={"space-between"}
        direction={"row"}
        alignItems={"center"}
        marginTop={1 / 2}
      >
        <Tooltip
          title={t("labelLRCStakeAPRTooltips").toString()}
          placement={"top"}
        >
          <Typography
            component={"p"}
            variant="body2"
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelLRCStakeAPR"}>
              APR
              <Info2Icon
                fontSize={"small"}
                color={"inherit"}
                sx={{ marginX: 1 / 2 }}
              />
            </Trans>
          </Typography>
        </Tooltip>
        <Typography component={"p"} variant="body2" color={"textPrimary"}>
          {}
        </Typography>
      </Grid>

      <Grid
        container
        justifyContent={"space-between"}
        direction={"row"}
        alignItems={"center"}
        marginTop={1 / 2}
      >
        <Tooltip
          title={t("labelLRCStakeEarnTooltips").toString()}
          placement={"top"}
        >
          <Typography
            component={"p"}
            variant="body2"
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelLRCStakeEarn"}>
              Earn
              <Info2Icon
                fontSize={"small"}
                color={"inherit"}
                sx={{ marginX: 1 / 2 }}
              />
            </Trans>
          </Typography>
        </Tooltip>
      </Grid>
      <Grid
        container
        justifyContent={"space-between"}
        direction={"row"}
        alignItems={"center"}
        marginTop={1 / 2}
      >
        <Typography
          component={"p"}
          variant="body2"
          color={"textSecondary"}
          display={"inline-flex"}
          alignItems={"center"}
        >
          {t("labelLRCStakeSubTime")}
        </Typography>
        <Typography component={"p"} variant="body2" color={"textPrimary"}>
          {}
        </Typography>
      </Grid>
      <Grid
        container
        justifyContent={"space-between"}
        direction={"row"}
        alignItems={"center"}
        marginTop={1 / 2}
      >
        <Tooltip
          title={(t("labelLRCStakeDurationTooltips").toString(), { day: 90 })}
          placement={"top"}
        >
          <Typography
            component={"p"}
            variant="body2"
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelLRCStakeDuration"}>
              Duration
              <Info2Icon
                fontSize={"small"}
                color={"inherit"}
                sx={{ marginX: 1 / 2 }}
              />
            </Trans>
          </Typography>
        </Tooltip>
        <Typography component={"p"} variant="body2" color={"textPrimary"}>
          {}
        </Typography>
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
          {confirmShowLimitBalance && (
            <GridStyle item>
              {isJoin ? (
                <Typography
                  variant={"body1"}
                  component={"p"}
                  display={"flex"}
                  marginTop={1}
                  flexDirection={"column"}
                  color={"var(--color-warning)"}
                ></Typography>
              ) : (
                <Typography
                  variant={"body1"}
                  component={"p"}
                  display={"flex"}
                  marginTop={1}
                  flexDirection={"column"}
                  color={"var(--color-warning)"}
                >
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"inherit"}
                  ></Typography>
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"inherit"}
                    marginTop={1}
                  ></Typography>
                </Typography>
              )}
            </GridStyle>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
