import { SwapTradeData, TradeBtnStatus } from "../../Interface";
import {
  CoinInfo,
  CoinMap,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  ReverseIcon,
  SlippageTolerance,
  TradeCalcData,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import React from "react";
import { Grid, Typography } from "@mui/material";
import { InputButton, LinkActionStyle, PopoverPure } from "../../../basic-lib";
import { usePopupState } from "material-ui-popup-state/hooks";
import { bindHover, bindPopover } from "material-ui-popup-state/es";
import { SwapTradeProps } from "./Interface";
import { useSettings } from "../../../../stores";
import { IconButtonStyled, ButtonStyle } from "../Styled";
import { SlippagePanel } from "../tool";
import { Box } from "@mui/material";

export const SwapTradeWrap = <
  T extends IBData<I>,
  I,
  TCD extends TradeCalcData<I>
>({
  t,
  onChangeEvent,
  isStob,
  switchStobEvent,
  swapData,
  disabled,
  handleError,
  swapBtnStatus,
  onSwapClick,
  swapBtnI18nKey,
  tradeCalcData,
  tokenSellProps,
  tokenBuyProps,
  ...rest
}: SwapTradeProps<T, I, TCD> & WithTranslation) => {
  const sellRef = React.useRef();
  const buyRef = React.useRef();
  const { slippage } = useSettings();
  let tradeData = swapData.tradeData;
  const slippageArray: Array<number | string> = SlippageTolerance.concat(
    `slippage:${slippage}`
  ) as Array<number | string>;
  const [error, setError] = React.useState<{
    error: boolean;
    message?: string | JSX.Element;
  }>({
    error: false,
    message: "",
  });
  const [_isStoB, setIsStoB] = React.useState(
    typeof isStob !== "undefined" ? isStob : true
  );

  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      setIsStoB(!_isStoB);
      if (typeof switchStobEvent === "function") {
        switchStobEvent(!_isStoB);
      }
    },
    [switchStobEvent, _isStoB]
  );

  const getDisabled = React.useCallback(() => {
    return (
      disabled ||
      tradeCalcData === undefined ||
      tradeCalcData.coinInfoMap === undefined
    );
  }, [disabled, tradeCalcData]);

  const handleOnClick = React.useCallback(
    (_event: React.MouseEvent, _name: string, ref: any) => {
      const focus: "buy" | "sell" =
        ref.current === buyRef.current ? "buy" : "sell";
      onChangeEvent(1, {
        tradeData: swapData.tradeData,
        type: focus,
        to: "menu",
      });
    },
    [swapData, onChangeEvent]
  );
  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _name: string, _ref: any) => {
      const focus: "buy" | "sell" =
        _ref?.current === buyRef.current ? "buy" : "sell";
      if (swapData.tradeData[focus].tradeValue !== ibData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...swapData.tradeData, [focus]: ibData },
          type: focus,
          to: "button",
        });
      }
    },
    [swapData, onChangeEvent]
  );
  const covertOnClick = React.useCallback(() => {
    onChangeEvent(0, {
      tradeData: {
        sell: swapData.tradeData.buy,
        buy: swapData.tradeData.sell,
      } as SwapTradeData<T>,
      type: "exchange",
      to: "button",
    });
  }, [swapData, onChangeEvent]);
  const _onSlippageChange = React.useCallback(
    (
      slippage: number | string,
      customSlippage: number | string | undefined
    ) => {
      popupState.close();
      onChangeEvent(0, {
        ...swapData,
        tradeData: {
          ...swapData.tradeData,
          slippage: slippage,
          __cache__: {
            ...swapData.tradeData.__cache__,
            customSlippage: customSlippage,
          },
        },
        type: "sell",
        to: "button",
      });
    },
    [swapData, onChangeEvent]
  );

  if (typeof handleError !== "function") {
    handleError = ({ belong, balance, tradeValue }: any) => {
      if (balance < tradeValue || (tradeValue && !balance)) {
        const _error = {
          error: true,
          message: t("tokenNotEnough", { belong: belong }),
        };
        setError(_error);
        return _error;
      }
      setError({ error: false, message: "" });
      return { error: false, message: "" };
    };
  }
  const propsSell = {
    label: t("tokenEnterPaymentToken"),
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenSellProps,
    handleError,
    handleCountChange,
    handleOnClick,
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
    handleOnClick,
    ...rest,
  };
  const popupState = usePopupState({
    variant: "popover",
    popupId: "slippagePop",
  });
  const label = React.useMemo(() => {
    if (error.error) {
      if (typeof error.message === "string") {
        return t(error.message);
      } else if (error.message !== undefined) {
        return error.message;
      } else {
        return t("labelError");
      }
    }
    if (swapBtnI18nKey) {
      const key = swapBtnI18nKey.split("|");
      return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
    } else {
      return t(`swapBtn`);
    }
  }, [error, t, swapBtnI18nKey]);
  const showVal =
    tradeData.buy?.belong && tradeData.sell?.belong && tradeCalcData?.StoB;

  // const convertStr = _isStoB ? `1${tradeData.sell?.belong} \u2248 ${stob} ${tradeData.buy?.belong}`
  //     : `1${tradeData.buy?.belong} \u2248 ${btos} ${tradeData.sell?.belong}`
  const convertStr = _isStoB
    ? `1${tradeData.sell?.belong} \u2248 ${
        tradeCalcData.StoB && tradeCalcData.StoB != "NaN"
          ? tradeCalcData.StoB
          : EmptyValueTag
      } ${tradeData.buy?.belong}`
    : `1${tradeData.buy?.belong} \u2248 ${
        tradeCalcData.BtoS && tradeCalcData.BtoS != "NaN"
          ? tradeCalcData.BtoS
          : EmptyValueTag
      } ${tradeData.sell?.belong}`;
  const priceImpactColor = tradeCalcData?.priceImpactColor
    ? tradeCalcData.priceImpactColor
    : "textPrimary";
  const priceImpact = tradeCalcData?.priceImpact
    ? getValuePrecisionThousand(
        tradeCalcData.priceImpact,
        undefined,
        undefined,
        2,
        true
      ) + " %"
    : EmptyValueTag;

  const fee =
    tradeCalcData && tradeCalcData.fee
      ? (parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag;

  const minimumReceived =
    tradeCalcData && tradeCalcData.minimumReceived
      ? `${tradeCalcData.minimumReceived}  ${tradeData.buy?.belong}`
      : EmptyValueTag;
  const { isMobile } = useSettings();
  return (
    <Grid
      className={tradeCalcData ? "trade-panel" : "trade-panel loading"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
      direction={"column"}
      flexWrap={"nowrap"}
      justifyContent={"space-between"}
      flex={isMobile ? "1" : "initial"}
      height={"100%"}
    >
      <Grid
        item
        marginTop={3}
        display={"flex"}
        alignSelf={"stretch"}
        justifyContent={"flex-start"}
        alignItems={"stretch"}
        flexDirection={"column"}
        flexBasis={"initial"}
      >
        <InputButton<any, I, CoinInfo<I>>
          ref={sellRef}
          disabled={getDisabled()}
          {...{
            ...propsSell,
            isHideError: true,
            inputData: tradeData ? tradeData.sell : ({} as any),
            coinMap:
              tradeCalcData && tradeCalcData.coinInfoMap
                ? tradeCalcData.coinInfoMap
                : ({} as CoinMap<I, CoinInfo<I>>),
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
        {/*</Grid>*/}
        {/*<Grid item>*/}
        <InputButton<any, I, CoinInfo<I>>
          ref={buyRef}
          disabled={getDisabled()}
          {...{
            ...propsBuy,
            // maxAllow:false,
            isHideError: true,
            inputData: tradeData ? tradeData.buy : ({} as any),
            coinMap:
              tradeCalcData && tradeCalcData.coinInfoMap
                ? tradeCalcData.coinInfoMap
                : ({} as CoinMap<I, CoinInfo<I>>),
          }}
        />
        {/*</Grid>*/}
        {/*</Grid>*/}
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
              height={24}
            >
              <Typography
                component={"p"}
                variant="body2"
                color={"textSecondary"}
              >
                {t("swapTolerance")}
              </Typography>
              <Typography component={"p"} variant="body2">
                {tradeCalcData ? (
                  <>
                    <Typography
                      {...bindHover(popupState)}
                      component={"span"}
                      color={"textPrimary"}
                    >
                      <LinkActionStyle>
                        {tradeData.slippage
                          ? tradeData.slippage
                          : tradeCalcData.slippage
                          ? tradeCalcData.slippage
                          : 0.5}
                        %
                      </LinkActionStyle>
                      <PopoverPure
                        className={"arrow-right"}
                        {...bindPopover(popupState)}
                        {...{
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "right",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right",
                          },
                        }}
                      >
                        <SlippagePanel
                          {...{
                            ...rest,
                            t,
                            handleChange: _onSlippageChange,
                            slippageList: slippageArray,
                            slippage: tradeData.slippage
                              ? tradeData.slippage
                              : tradeCalcData.slippage
                              ? tradeCalcData.slippage
                              : 0.5,
                          }}
                        />
                      </PopoverPure>
                    </Typography>
                  </>
                ) : (
                  EmptyValueTag
                )}
              </Typography>
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
              >
                {t("swapPriceImpact")}
              </Typography>
              <Typography
                component={"p"}
                color={priceImpactColor}
                variant="body2"
              >
                {priceImpact}
              </Typography>
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
              >
                {t("swapMinReceive")}
              </Typography>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {minimumReceived}
              </Typography>
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
              >
                {t("swapFee")}
              </Typography>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {fee}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <ButtonStyle
              variant={"contained"}
              size={"large"}
              color={"primary"}
              onClick={() => {
                onSwapClick(swapData.tradeData);
              }}
              loading={
                !getDisabled() && swapBtnStatus === TradeBtnStatus.LOADING
                  ? "true"
                  : "false"
              }
              disabled={
                getDisabled() ||
                swapBtnStatus === TradeBtnStatus.DISABLED ||
                swapBtnStatus === TradeBtnStatus.LOADING ||
                error.error
              }
              fullWidth={true}
            >
              {label}
            </ButtonStyle>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
