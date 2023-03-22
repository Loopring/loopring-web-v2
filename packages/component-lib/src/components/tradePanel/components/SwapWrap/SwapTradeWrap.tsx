import { SwapTradeData } from "../../Interface";
import {
  CheckBoxIcon,
  CheckedIcon,
  CoinInfo,
  CoinMap,
  defalutSlipage,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  myLog,
  ReverseIcon,
  TradeBtnStatus,
  TradeCalcData,
} from "@loopring-web/common-resources";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import { InputButton } from "../../../basic-lib";

import { SwapTradeProps } from "./Interface";
import { useSettings } from "../../../../stores";
import { ButtonStyle, IconButtonStyled } from "../Styled";

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
  let tradeData = swapData.tradeData;

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

  if (typeof handleError !== "function") {
    handleError = ({ belong, balance, tradeValue }: any) => {
      if (balance < tradeValue || (tradeValue && !balance)) {
        const _error = {
          error: true,
          message: t("tokenNotEnough", { belong: belong }),
        };
        return _error;
      }
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
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    handleError,
    handleCountChange,
    handleOnClick,
    ...rest,
  } as any;
  const propsBuy = {
    label: t("tokenEnterReceiveToken"),
    // subLabel: t('tokenHave'),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    maxAllow: false,
    ...tokenBuyProps,
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    handleCountChange,
    handleOnClick,
    ...rest,
  } as any;
  // const popupState = usePopupState({
  //   variant: "popover",
  //   popupId: "slippagePop",
  // });
  const label = React.useMemo(() => {
    myLog(swapBtnI18nKey, "swapBtnI18nKey useMemo");
    if (swapBtnI18nKey) {
      const key = swapBtnI18nKey.split("|");
      if (key) {
        return t(key[0], key && key[1] ? { arg: key[1] } : undefined);
      } else {
        return t(swapBtnI18nKey);
      }
    } else {
      return t(`swapBtn`);
    }
  }, [t, swapBtnI18nKey]);
  const showVal =
    tradeData.buy?.belong && tradeData.sell?.belong && tradeCalcData?.StoB;

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
  const priceImpact =
    tradeCalcData?.priceImpact !== undefined
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
      ? `${tradeCalcData.fee} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag;

  const userTakerRate =
    tradeCalcData && tradeCalcData.feeTakerRate
      ? (tradeCalcData.feeTakerRate / 100).toString()
      : EmptyValueTag;
  const tradeCostMin =
    tradeCalcData && tradeCalcData.tradeCost
      ? `${tradeCalcData.tradeCost} ${tradeData.buy?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
      : EmptyValueTag;

  const minimumReceived =
    tradeCalcData && tradeCalcData.minimumReceived
      ? `${tradeCalcData.minimumReceived}  ${tradeData.buy?.belong}`
      : EmptyValueTag;
  const { isMobile } = useSettings();
  myLog("tradeCalcData?.isChecked", tradeCalcData?.isChecked);
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
              marginTop={1 / 2}
            >
              <Tooltip
                title={t("labelSwapFeeTooltips", {
                  rate: userTakerRate,
                  value: tradeCostMin,
                }).toString()}
                placement={"top"}
              >
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                  {" " + t("swapFee")}
                </Typography>
              </Tooltip>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {fee}
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
                title={t("labelSwapPriceImpactTooltips").toString()}
                placement={"top"}
              >
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                  {" " + t("swapPriceImpact")}
                </Typography>
              </Tooltip>
              <Typography
                component={"p"}
                color={priceImpactColor}
                variant="body2"
              >
                {priceImpact}
              </Typography>
            </Grid>
            {/*,labelSwapMinReceiveTooltips,labelSwapFeeTooltips */}

            <Grid
              container
              justifyContent={"space-between"}
              direction={"row"}
              alignItems={"center"}
              marginTop={1 / 2}
            >
              <Tooltip
                title={t("labelSwapMinReceiveTooltips").toString()}
                placement={"top"}
              >
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                  {" " + t("swapMinReceive")}
                </Typography>
              </Tooltip>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {minimumReceived}
              </Typography>
            </Grid>
            <Grid
              container
              justifyContent={"space-between"}
              direction={"row"}
              alignItems={"center"}
              height={24}
            >
              <Tooltip
                title={t("labelSwapToleranceTooltips").toString()}
                placement={"top"}
              >
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textSecondary"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <Info2Icon
                    fontSize={"small"}
                    color={"inherit"}
                    sx={{ marginX: 1 / 2 }}
                  />
                  {" " + t("swapTolerance")}
                </Typography>
              </Tooltip>

              <Typography component={"p"} variant="body2">
                {tradeCalcData
                  ? (tradeData.slippage
                      ? tradeData.slippage
                      : tradeCalcData.slippage
                      ? tradeCalcData.slippage
                      : defalutSlipage) + "%"
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
          {tradeCalcData.isNotMatchMarketPrice && (
            <Grid item>
              <MuiFormControlLabel
                sx={{ alignItems: "flex-start" }}
                control={
                  <Checkbox
                    checked={tradeCalcData?.isChecked ? true : false}
                    onChange={() => {
                      onChangeEvent(0, {
                        tradeData: {
                          ...swapData.tradeData,
                          isChecked: !tradeCalcData?.isChecked,
                        } as SwapTradeData<T>,
                        type: "buy",
                        to: "button",
                      });
                    }}
                    checkedIcon={<CheckedIcon />}
                    icon={<CheckBoxIcon />}
                    color="default"
                  />
                }
                label={
                  <Typography variant={"body2"}>
                    <Trans
                      i18nKey={"labelExpectSettlementPrice"}
                      interpolation={{ escapeValue: false }}
                      tOptions={{
                        symbolSell: tradeData.sell?.belong,
                        symbolBuy: tradeData.buy?.belong,
                        stob: tradeCalcData.StoB,
                        marketPrice: tradeCalcData.marketPrice,
                        marketRatePrice: tradeCalcData.marketRatePrice,
                      }}
                    >
                      The expected settlement price from this order is symbol =
                      value, while the current market price from a trusted
                      oracle is symbol= marketPrice. There is marketRatePrice%
                      variance observed. Please acknowledge the risk if you
                      still want to continue.
                    </Trans>
                  </Typography>
                }
              />
            </Grid>
          )}
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
                swapBtnStatus === TradeBtnStatus.LOADING
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
