import {
  DeFiCalcData,
  EmptyValueTag,
  ExchangeIcon,
  IBData,
  OrderListIcon,
  ReverseIcon,
} from "@loopring-web/common-resources";
import { DeFiChgType, DeFiWrapProps } from "./Interface";
import { useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle, IconButtonStyled } from "../Styled";
import { TradeBtnStatus } from "../../Interface";
import { CountDownIcon } from "../tool/Refresh";
import { useHistory } from "react-router-dom";

export const DeFiWrap = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
  disabled,
  isJoin,
  isStoB,
  btnInfo,
  refreshRef,
  onRefreshData,
  onSubmitClick,
  onConfirm,
  // covertOnClick,
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
  market,
  ...rest
}: DeFiWrapProps<T, I, ACD>) => {
  const coinSellRef = React.useRef();
  const coinBuyRef = React.useRef();
  const { t } = useTranslation();
  const history = useHistory();
  // const [errorA, setErrorA] = React.useState<{
  //   error: boolean;
  //   message?: string | JSX.Element;
  // }>({
  //   error: false,
  //   message: "",
  // });
  // const [errorB, setErrorB] = React.useState<{
  //   error: boolean;
  //   message?: string | JSX.Element;
  // }>({
  //   error: false,
  //   message: "",
  // });

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
    return isStoB
      ? `1${deFiCalcData.coinSell.belong} \u2248 ${
          // @ts-ignore
          deFiCalcData?.AtoB && deFiCalcData?.AtoB != "NaN"
            ? deFiCalcData?.AtoB
            : EmptyValueTag
        } ${deFiCalcData.coinBuy.belong}`
      : `1${deFiCalcData.coinBuy.belong}  \u2248 ${
          // @ts-ignore
          deFiCalcData.BtoA && deFiCalcData?.BtoA != "NaN"
            ? deFiCalcData.BtoA
            : EmptyValueTag
        } ${deFiCalcData.coinSell.belong}`;
  }, [
    deFiCalcData?.AtoB,
    deFiCalcData.BtoA,
    deFiCalcData.coinBuy.belong,
    deFiCalcData.coinSell.belong,
    isStoB,
  ]);

  // const getDisabled = () => {
  //   return (
  //     disabled ||
  //     deFiCalcData === undefined ||
  //     deFiCalcData.coinMap === undefined
  //   );
  // };
  const getDisabled = React.useMemo(() => {
    return disabled || isLoading || deFiCalcData === undefined;
  }, [btnStatus, deFiCalcData, disabled]);

  // if (typeof handleError !== "function") {
  //   handleError = (iBData: any) => {
  //     if (accStatus === AccountStatus.ACTIVATED) {
  //       // const iscoinSell = _ref?.current === coinSellRef.current;
  //       const { tradeValue, balance, belong } = deFiCalcData.coinSell;
  //       if (balance < tradeValue || (tradeValue && !balance)) {
  //         const _error = {
  //           error: true,
  //           message: t("tokenNotEnough", { belong: deFiCalcData.coinSell }),
  //         };
  //         if (iscoinSell) {
  //           setErrorA(_error);
  //         } else {
  //           setErrorB(_error);
  //         }
  //         return _error;
  //       }
  //       if (iscoinSell) {
  //         setErrorA({ error: false, message: "" });
  //       } else {
  //         setErrorB({ error: false, message: "" });
  //       }
  //     }
  //   };
  //   return { error: false, message: "" };
  // }

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      const focus: DeFiChgType =
        _ref?.current === coinSellRef.current
          ? DeFiChgType.coinSell
          : DeFiChgType.coinBuy;
      if (deFiCalcData[focus].tradeValue !== ibData.tradeValue) {
        onChangeEvent({
          tradeData: { ...ibData },
          type: focus,
        });
      }
    },
    [deFiCalcData]
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
  // const propsA: any = {
  //   label: t("labelTokenAmount"),
  //   subLabel: t("labelAvailable"),
  //   placeholderText: "0.00",
  //   maxAllow: true,
  //   ...tokenBuyProps,
  //   handleError,
  //   handleCountChange,
  //   ...rest,
  // };
  // const propsB: any = {
  //   label: t("labelTokenAmount"),
  //   subLabel: t("labelAvailable"),
  //   placeholderText: "0.00",
  //   maxAllow: true,
  //   ...tokenBProps,
  //   // handleError,
  //   handleCountChange,
  //   ...rest,
  // };
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
                history.push(`/layer2/history/ammRecords?market=${market}`);
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
                {t(
                  deFiCalcData
                    ? deFiCalcData.fee + ` ${tokenBuy.symbol}`
                    : EmptyValueTag
                )}
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
              disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            >
              {btnInfo
                ? t(btnInfo.label, btnInfo.params)
                : isJoin
                ? t(`depositLabelBtn`)
                : t(`depositLabelBtn`)}
            </ButtonStyle>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
