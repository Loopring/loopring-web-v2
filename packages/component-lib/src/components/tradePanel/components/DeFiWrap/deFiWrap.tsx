import {
  AccountStatus,
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
  tokenA,
  tokenB,
  isLoading,
  btnStatus,
  tokenAProps,
  tokenBProps,
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
    deFiCalcData.coinSell && deFiCalcData.coinBuy && deFiCalcData?.AtoB;

  const convertStr = isStoB
    ? `1${deFiCalcData.coinSell} \u2248 ${
        // @ts-ignore
        deFiCalcData?.AtoB && deFiCalcData?.AtoB != "NaN"
          ? deFiCalcData?.AtoB
          : EmptyValueTag
      } ${deFiCalcData.coinBuy}`
    : `1${deFiCalcData.coinBuy}  \u2248 ${
        // @ts-ignore
        deFiCalcData.BtoA && deFiCalcData?.BtoA != "NaN"
          ? deFiCalcData.BtoA
          : EmptyValueTag
      } ${deFiCalcData.coinSell}`;

  // const getDisabled = () => {
  //   return (
  //     disabled ||
  //     deFiCalcData === undefined ||
  //     deFiCalcData.coinMap === undefined
  //   );
  // };
  const getDisabled = React.useMemo(() => {
    return (
      disabled ||
      isLoading ||
      deFiCalcData === undefined ||
      deFiCalcData.coinMap === undefined
    );
  }, [btnStatus, deFiCalcData, disabled]);

  if (typeof handleError !== "function") {
    handleError = (iBData: any) => {
      if (accStatus === AccountStatus.ACTIVATED) {
        // const iscoinSell = belong === deFiCalcData.mycoinSell.belong;
        // if (balance < tradeValue || (tradeValue && !balance)) {
        //   const _error = {                                 o
        //     error: true,
        //     message: t("tokenNotEnough", {belong: belong}),
        //   };
        //   if (iscoinSell) {
        //     setErrorA(_error);
        //   } else {
        //     setErrorB(_error);
        //   }
        //   return _error;
        // }
        // if (iscoinSell) {
        //   setErrorA({error: false, message: ""});
        // } else {
        //   setErrorB({error: false, message: ""});
        // }
      }
      return { error: false, message: "" };
    };
  }
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
  const propsA: any = {
    label: t("labelTokenAmount"),
    subLabel: t("labelAvailable"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenAProps,
    handleError,
    handleCountChange,
    ...rest,
  };
  const propsB: any = {
    label: t("labelTokenAmount"),
    subLabel: t("labelAvailable"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenBProps,
    handleError,
    handleCountChange,
    ...rest,
  };
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
                history.push(`/layer2/history/ammRecord`);
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
            ...propsA,
            name: "coinSell",
            isHideError: true,
            order: "right",
            disabled: isLoading,
            inputData: deFiCalcData ? deFiCalcData.coinSell : ({} as any),
            coinMap: deFiCalcData ? deFiCalcData.coinMap : ({} as any),
            coinPrecision: tokenA.precision,
          }}
        />
        <Box alignSelf={"center"} marginY={1}>
          <IconButtonStyled
            size={"large"}
            onClick={covertOnClick}
            aria-label={t("tokenExchange")}
          >
            <ExchangeIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-primary)"}
            />
          </IconButtonStyled>
        </Box>
        <InputCoin<any, I, any>
          ref={coinBuyRef}
          disabled={getDisabled}
          {...{
            ...propsB,
            name: "coinBuy",
            isHideError: true,
            disabled: isLoading,
            order: "right",
            inputData: deFiCalcData ? deFiCalcData.coinBuy : ({} as any),
            coinMap: deFiCalcData ? deFiCalcData.coinMap : ({} as any),
            coinPrecision: tokenB.precision,
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
                {t(deFiCalcData ? deFiCalcData.fee : EmptyValueTag)}
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
                : t(`depositLabelBtn`)}
            </ButtonStyle>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
