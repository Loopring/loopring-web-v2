import {
  DeFiCalcData,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  myLog,
  OrderListIcon,
  ReverseIcon,
} from "@loopring-web/common-resources";
import { DeFiChgType, DeFiWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { TradeBtnStatus } from "../../Interface";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";
import BigNumber from "bignumber.js";

export const DeFiWrap = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
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
  deFiCalcData,
  accStatus,
  tokenSell,
  tokenBuy,
  isLoading,
  btnStatus,
  tokenSellProps,
  tokenBuyProps,
  maxSellVol,
  market,
  ...rest
}: DeFiWrapProps<T, I, ACD>) => {
  const coinSellRef = React.useRef();
  const coinBuyRef = React.useRef();
  const { t } = useTranslation();
  const history = useHistory();
  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      if (typeof switchStobEvent === "function") {
        switchStobEvent(!isStoB);
      }
    },
    [switchStobEvent, isStoB]
  );

  const showVal =
    deFiCalcData.coinSell?.belong &&
    deFiCalcData.coinBuy?.belong &&
    deFiCalcData?.AtoB;

  const convertStr = React.useMemo(() => {
    return deFiCalcData.coinSell && deFiCalcData.coinBuy
      ? isStoB
        ? `1${deFiCalcData.coinSell.belong} \u2248 ${
            // @ts-ignore
            // eslint-disable-next-line eqeqeq
            deFiCalcData?.AtoB && deFiCalcData?.AtoB !== "NaN"
              ? getValuePrecisionThousand(
                deFiCalcData?.AtoB,
                tokenBuy.precision,
                tokenBuy.precision,
                tokenBuy.precision,
                false,
                { floor: true }
              ): EmptyValueTag
          } ${deFiCalcData.coinBuy.belong}`
        : `1${deFiCalcData.coinBuy.belong}  \u2248 ${
            // @ts-ignore
            deFiCalcData.BtoA && deFiCalcData?.BtoA !== "NaN"
              ? getValuePrecisionThousand(
                deFiCalcData?.AtoB,
                tokenSell.precision,
                tokenSell.precision,
                tokenSell.precision,
                false,
                { floor: true }
              )
              : EmptyValueTag
          } ${deFiCalcData.coinSell.belong}`
      : t("labelCalculating");
  }, [
    deFiCalcData?.AtoB,
    deFiCalcData.BtoA,
    deFiCalcData.coinBuy,
    deFiCalcData.coinSell,
    isStoB,
    t,
  ]);

  // const getDisabled = () => {
  //   return (
  //     disabled ||
  //     deFiCalcData === undefined ||
  //     deFiCalcData.coinMap === undefined
  //   );
  // };
  const getDisabled = React.useMemo(() => {
    return disabled || deFiCalcData === undefined || deFiCalcData.AtoB === undefined ;
  }, [btnStatus, deFiCalcData, disabled]);
  // myLog("DeFi DefiTrade btnStatus", btnStatus, btnInfo);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      const focus: DeFiChgType =
        _ref?.current === coinSellRef.current
          ? DeFiChgType.coinSell
          : DeFiChgType.coinBuy;

      if (deFiCalcData[focus].tradeValue !== ibData.tradeValue) {
        myLog("defi handleCountChange", _name, ibData);

        onChangeEvent({
          tradeData: { ...ibData },
          type: focus,
        });
      }
    },
    [deFiCalcData, onChangeEvent]
  );
  const covertOnClick = React.useCallback(() => {
    onChangeEvent({
      tradeData: undefined,
      type: DeFiChgType.exchange,
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
    tokenSell.symbol &&
    maxSellVol &&
    `${getValuePrecisionThousand(
      new BigNumber(maxSellVol ?? 0).div("1e" + tokenSell.decimals),
      tokenSell.precision,
      tokenSell.precision,
      tokenSell.precision,
      false,
      { floor: true }
    )} ${tokenSell.symbol}`;

  return (
    <Grid
      className={deFiCalcData ? "" : "loading"}
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
          {t("labelInvestDefiTitle")}
        </Typography>
        <Box alignSelf={"flex-end"} display={"flex"}>
          <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
          <Typography display={"inline-block"} marginLeft={2}>
            <IconButtonStyled
              onClick={() => {
                history.push(`/l2assets/history/defiRecords?market=${market}`);
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
            inputData: deFiCalcData ? deFiCalcData.coinSell : ({} as any),
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
            inputData: deFiCalcData ? deFiCalcData.coinBuy : ({} as any),
            coinMap: {},
            coinPrecision: tokenBuy.precision,
          }}
        />
      </Grid>
      <Grid item>
        <Typography
          component={"p"}
          variant="body1"
          textAlign={"center"}
          lineHeight={"24px"}
          paddingY={2}
        >
          {showVal ? (
            <>
              {convertStr}
              <IconButtonStyled
                size={"small"}
                aria-label={t("tokenExchange")}
                onClick={_onSwitchStob}
                // style={{transform: 'rotate(90deg)'}}
              >
                <ReverseIcon />
              </IconButtonStyled>
            </>
          ) : (
            t("labelCalculating")
          )}
        </Typography>
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
                {t("labelDefiFee")}
              </Typography>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {deFiCalcData?.fee
                  ? deFiCalcData.fee + ` ${tokenBuy.symbol}`
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
          {confirmShowLimitBalance && 
            <Grid item>
              {
                isJoin? <Typography
                variant={"body1"}
                component={"p"}
                display={"flex"}
                marginTop={1}
                flexDirection={"column"}
                color={"var(--color-warning)"}
                ><Trans
                i18nKey={"labelDefiMaxBalanceJoin"}
                tOptions={{ maxValue }}> The quota is almost sold out and can't fulfil your complete order. You can only subscribe ** now. Loopring will setup the pool soon, please revisit for subscription later. 

                </Trans>
                </Typography> :
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
                      i18nKey={"labelDefiMaxBalance"}
                      tOptions={{ maxValue }}
                    >
                      Your Redeem order is too large and cannot be withdrawn
                      immediately, you can only redeem {{ maxValue }}
                    </Trans>
                  </Typography>
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"inherit"}
                    marginTop={1}
                  >
                    <Trans i18nKey={"labelDefiMaxBalance1"}>
                      or you can
                      <ul>
                        <li>Withdraw to L1 and redeem through crv or lido</li>
                        <li>Wait some time and wait for pool liquidity</li>
                      </ul>
                    </Trans>
                  </Typography>
                </Typography>
              }
            
            </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );
};
