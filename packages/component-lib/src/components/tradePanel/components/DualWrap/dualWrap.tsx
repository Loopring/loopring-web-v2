import {
  DualCalcData,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  myLog,
  OrderListIcon,
} from "@loopring-web/common-resources";
import { DualWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { TradeBtnStatus } from "../../Interface";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";
import BigNumber from "bignumber.js";

export const DualWrap = <T extends IBData<I>, I, DUAL extends DualCalcData>({
  disabled,
  isJoin,
  isStoB,
  btnInfo,
  refreshRef,
  onRefreshData,
  onSubmitClick,
  onConfirm,
  confirmShowLimitBalance,
  switchStobEvent,
  onChangeEvent,
  handleError,
  dualCalcData,
  accStatus,
  tokenSell,
  tokenBuy,
  isLoading,
  btnStatus,
  tokenSellProps,
  tokenBuyProps,
  maxSellVol,
  maxBuyVol,
  market,
  ...rest
}: DualWrapProps<T, I, DUAL>) => {
  const coinSellRef = React.useRef();
  const coinBuyRef = React.useRef();
  const { t } = useTranslation();
  const history = useHistory();

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
  const covertOnClick = React.useCallback(() => {
    onChangeEvent({
      tradeData: undefined,
    });
  }, [onChangeEvent]);
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
  const propsBuy = {
    label: t("tokenEnterReceiveToken"),
    // subLabel: t('tokenHave'),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    maxAllow: false,
    ...tokenBuyProps,
    // handleError,
    handleCountChange,
    ...rest,
  };
  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return isJoin ? t(`labelInvestBtn`) : t(`labelRedeemBtn`);
    }
  }, [isJoin, t, btnInfo]);

  const maxValue =
    tokenBuy.symbol &&
    maxBuyVol &&
    `${getValuePrecisionThousand(
      new BigNumber(maxBuyVol ?? 0).div("1e" + tokenBuy.decimals),
      tokenBuy.precision,
      tokenBuy.precision,
      tokenBuy.precision,
      false,
      { floor: true }
    )} ${tokenBuy.symbol}`;

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
                history.push(`/l2assets/history/dualRecords?market=${market}`);
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
        <Box alignSelf={"center"} marginY={1}>
          <IconButtonStyled
            size={"large"}
            onClick={covertOnClick}
            disabled={true}
            aria-label={t("tokenExchange")}
          >
            <ExchangeIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-disable)"}
            />
          </IconButtonStyled>
        </Box>
        <InputCoin<any, I, any>
          ref={coinBuyRef}
          disabled={getDisabled}
          {...{
            ...propsBuy,
            name: "coinBuy",
            isHideError: true,
            order: "right",
            inputData: dualCalcData ? dualCalcData.coinBuy : ({} as any),
            coinMap: {},
            coinPrecision: tokenBuy.precision,
          }}
        />
      </Grid>

      <Grid item alignSelf={"stretch"}>
        <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
          <Grid item paddingBottom={3} sx={{ color: "text.secondary" }}>
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
              >
                {t("labelDualFee")}
              </Typography>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {dualCalcData?.fee
                  ? dualCalcData.fee + ` ${tokenBuy.symbol}`
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
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
            <Grid item>
              {isJoin ? (
                <Typography
                  variant={"body1"}
                  component={"p"}
                  display={"flex"}
                  marginTop={1}
                  flexDirection={"column"}
                  color={"var(--color-warning)"}
                >
                  <Trans
                    i18nKey={"labelDualMaxBalanceJoin"}
                    tOptions={{ maxValue }}
                  >
                    The quota is almost sold out and can't fulfil your complete
                    order. You can only subscribe {{ maxValue }} now. Loopring
                    will setup the pool soon, please revisit for subscription
                    later.
                  </Trans>
                </Typography>
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
                  >
                    <Trans
                      i18nKey={"labelDualMaxBalance"}
                      tOptions={{ maxValue }}
                    >
                      Loopring rebalance pool can't satisfy your complete
                      request. You can only redeem {{ maxValue }} now. For the
                      remaining investment, you can choose one of the approaches
                    </Trans>
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"inherit"}
                    marginTop={1}
                  >
                    <Trans i18nKey={"labelDualMaxBalance1"}>
                      <ul>
                        <li>
                          Withdraw wstETH to L1 and trade through CRV or LIDO
                          directly
                        </li>
                        <li>Wait some time for Loopring to seto for redeem</li>
                      </ul>
                    </Trans>
                  </Typography>
                </Typography>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
