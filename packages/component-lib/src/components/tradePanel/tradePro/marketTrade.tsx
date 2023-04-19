import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { MarketTradeData, TradeBaseType, TradeMarketProps } from "../Interface";
import {
  CheckBoxIcon,
  CheckedIcon,
  CoinInfo,
  CoinKey,
  CoinMap,
  defaultSlipage,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  SlippageTolerance,
  TradeBtnStatus,
  TradeCalcProData,
} from "@loopring-web/common-resources";
import { TradeProType } from "./Interface";
import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BtnPercentage,
  InputCoin,
  LinkActionStyle,
  PopoverPure,
} from "../../basic-lib";
import { useCommon } from "./hookCommon";
import { ButtonStyle, TabsStyle } from "../components/Styled";
import { bindHover, bindPopover } from "material-ui-popup-state/es";
import { SlippagePanel } from "../components";
import React from "react";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useSettings } from "../../../stores";

export const MarketTrade = withTranslation("common", { withRef: true })(
  <
    M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>,
    I = CoinKey<any>
  >({
    tradeData = {} as M,
    ...props
  }: TradeMarketProps<M, T, TCD, I> & WithTranslation) => {
    // const {slippage} = useSettings();
    // onChangeEvent?: (data:L,type:TradeProType) => L,
    const { slippage } = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(
      `slippage:${slippage}`
    ) as Array<number | string>;
    const {
      t,
      // disabled,
      tradeMarketI18nKey,
      // tradeCalcProData,
      tradeMarketBtnStyle,
      tradeType,
      tradeMarketBtnStatus,
      // handleCountChange,
      // tokenBaseProps,
      // tokenQuoteProps,
      // tradeData,
      // handleError,
      handleSubmitEvent,
      // handleChangeIndex,
      onChangeEvent,
      // ...rest
    } = props;

    const {
      quoteRef,
      baseRef,
      btnLabel,
      getDisabled,
      _handleChangeIndex,
      // inputError,
      tradeCalcProData,
      tradeBtnBaseStatus,
      propsBase,
      propsQuote,
      onPercentage,
      handleCountChange,
      selectedPercentage,
    } = useCommon({
      type: "market",
      ...(props as any),
      tradeData,
      tradeType,
      onChangeEvent,
      i18nKey: tradeMarketI18nKey ? tradeMarketI18nKey : "labelProMarketBtn",
      tradeBtnBaseStatus: tradeMarketBtnStatus,
    });
    const popupState = usePopupState({
      variant: "popover",
      popupId: "slippagePop",
    });
    const _onSlippageChange = React.useCallback(
      (
        slippage: number | string,
        customSlippage: number | string | undefined
      ) => {
        popupState.close();
        onChangeEvent(
          {
            ...tradeData,
            slippage: slippage,
            __cache__: {
              ...tradeData.__cache__,
              customSlippage: customSlippage,
            },
          },
          TradeBaseType.slippage
        );
      },
      [tradeData, onChangeEvent]
    );
    const [symbolSell, symbolBuy] =
      tradeData.type == TradeProType.sell
        ? [tradeData.base, tradeData.quote]
        : [tradeData.quote, tradeData.base];
    const priceImpactColor = tradeCalcProData?.priceImpactColor
      ? tradeCalcProData.priceImpactColor
      : "textPrimary";
    const priceImpact =
      tradeCalcProData?.priceImpact !== undefined
        ? getValuePrecisionThousand(
            tradeCalcProData.priceImpact,
            2,
            undefined,
            undefined,
            false,
            { floor: true }
          ) + " %"
        : EmptyValueTag;

    // const fee =
    //   tradeCalcProData && tradeCalcProData.fee
    //     ? (parseFloat(tradeCalcProData.fee) / 100).toString() + "%"
    //     : EmptyValueTag;

    const fee =
      tradeCalcProData && tradeCalcProData.fee
        ? `${tradeCalcProData.fee} ${
            tradeType === TradeProType.sell
              ? tradeData.quote?.belong
              : tradeData.base?.belong
          }` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
        : EmptyValueTag;

    const userTakerRate =
      tradeCalcProData && tradeCalcProData.feeTakerRate
        ? (tradeCalcProData.feeTakerRate / 100).toString()
        : EmptyValueTag;

    const tradeCostMin =
      tradeCalcProData && tradeCalcProData.tradeCost
        ? `${tradeCalcProData.tradeCost} ${tradeData.quote?.belong}` //(parseFloat(tradeCalcData.fee) / 100).toString() + "%"
        : EmptyValueTag;
    // const minimumReceived = tradeCalcProData && tradeCalcProData.minimumReceived ? tradeCalcProData.minimumReceived : EmptyValueTag
    const minimumReceived =
      tradeCalcProData && tradeCalcProData.minimumReceived
        ? `${tradeCalcProData.minimumReceived}  ${
            tradeType === TradeProType.buy
              ? tradeData.base.belong
              : tradeData.quote.belong
          }`
        : EmptyValueTag;

    return (
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
      >
        <Box
          className={"tool-bar"}
          paddingX={2}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Box component={"header"} width={"100%"}>
            <TabsStyle
              className={"trade-tabs pro-tabs"}
              variant={"fullWidth"}
              value={tradeType}
              onChange={(_e, index) => _handleChangeIndex(index)}
            >
              <Tab
                className={"trade-tab-buy"}
                value={TradeProType.buy}
                label={t("labelProBuy")}
              />
              <Tab
                className={"trade-tab-sell"}
                value={TradeProType.sell}
                label={t("labelProSell")}
              />
            </TabsStyle>
          </Box>
        </Box>
        <Box className={"trade-panel"} paddingTop={2} paddingX={2}>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={baseRef as any}
              name={"base"}
              disabled={getDisabled()}
              {...{
                ...propsBase,
                // maxAllow:false,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                handleCountChange,
                isHideError: true,
                inputData: tradeData ? tradeData.base : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
          {/*</Grid>*/}
          {/*<Grid item>*/}
          <Box alignSelf={"center"} paddingTop={4} paddingX={1}>
            <BtnPercentage
              step={25}
              // valuetext={(value)=>`${value}%`}
              getAriaLabel={(value) => `${value}%`}
              valueLabelFormat={(value) => `${value}%`}
              valueLabelDisplay={"on"}
              selected={selectedPercentage}
              anchors={[
                {
                  value: 0,
                  label: "",
                },
                {
                  value: 25,
                  label: "",
                },
                {
                  value: 50,
                  label: "",
                },
                {
                  value: 75,
                  label: "",
                },
                {
                  value: 100,
                  label: "",
                },
              ]}
              handleChanged={onPercentage}
            />
          </Box>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={quoteRef}
              name={"quote"}
              disabled={getDisabled()}
              {...{
                ...propsQuote,
                isHideError: true,
                handleCountChange,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                inputData: tradeData ? tradeData.quote : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
          {/*</Grid>*/}
          {/*<Grid item>*/}

          {/*< label={tradeCalcProData.baseToken} coinMap={tradeCalcProData.coinMap} />*/}
        </Box>
        <Box paddingTop={2} paddingX={2}>
          <Grid
            container
            direction={"column"}
            spacing={1}
            alignItems={"stretch"}
          >
            <Grid item marginBottom={1} sx={{ color: "text.secondary" }}>
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
                    {" " + t("swapFeeS")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textPrimary"}
                >
                  {fee}
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
                  {tradeCalcProData ? (
                    <>
                      <Typography
                        {...bindHover(popupState)}
                        component={"span"}
                        color={"textPrimary"}
                      >
                        <LinkActionStyle>
                          {tradeData.slippage
                            ? tradeData.slippage
                            : tradeCalcProData.slippage
                            ? tradeCalcProData.slippage
                            : defaultSlipage}
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
                              t,
                              handleChange: _onSlippageChange,
                              slippageList: slippageArray,
                              slippage: tradeData.slippage
                                ? tradeData.slippage
                                : tradeCalcProData.slippage
                                ? tradeCalcProData.slippage
                                : defaultSlipage,
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
                    {" " + t("swapMinReceiveS")}
                  </Typography>
                </Tooltip>
                <Typography
                  component={"p"}
                  variant="body2"
                  color={"textPrimary"}
                >
                  {minimumReceived !== EmptyValueTag
                    ? minimumReceived
                    : EmptyValueTag}
                </Typography>
              </Grid>
            </Grid>
            {/*<Grid item >*/}
            {/*  isNotMatchMarketPrice*/}
            {/*  marketPrice*/}
            {/*  marketRatePrice*/}
            {/*  */}
            {/*</Grid>*/}
            {tradeCalcProData.isNotMatchMarketPrice && (
              <Grid item marginBottom={1}>
                <MuiFormControlLabel
                  sx={{ alignItems: "flex-start" }}
                  control={
                    <Checkbox
                      checked={tradeCalcProData?.isChecked ? true : false}
                      onChange={() => {
                        onChangeEvent(
                          {
                            ...tradeData,
                            isChecked: !tradeCalcProData?.isChecked,
                          },
                          tradeCalcProData?.lastStepAt === TradeBaseType.quote
                            ? TradeBaseType.quote
                            : TradeBaseType.base
                        );
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
                          // ,symbolBuy
                          symbolSell: symbolSell?.belong,
                          symbolBuy: symbolBuy?.belong,
                          stob: tradeCalcProData.StoB,
                          marketPrice: tradeCalcProData.marketPrice,
                          marketRatePrice: tradeCalcProData.marketRatePrice,
                        }}
                      >
                        The expected settlement price from this order is symbol
                        = value, while the current market price from a trusted
                        oracle is symbol= marketPrice. There is marketRatePrice%
                        variance observed. Please acknowledge the risk if you
                        still want to continue.
                      </Trans>
                    </Typography>
                  }
                />
              </Grid>
            )}
          </Grid>
        </Box>
        <Box paddingTop={2} paddingX={2}>
          <ButtonStyle
            variant={"contained"}
            size={"medium"}
            color={tradeType === TradeProType.sell ? "error" : "success"}
            loadingbg={
              tradeType === TradeProType.sell
                ? "var(--color-error)"
                : "var(--color-success)"
            }
            style={{ ...tradeMarketBtnStyle }}
            onClick={() => {
              handleSubmitEvent(tradeData);
            }}
            loading={
              !getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={
              getDisabled() ||
              tradeBtnBaseStatus === TradeBtnStatus.DISABLED ||
              tradeBtnBaseStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {btnLabel}
          </ButtonStyle>
        </Box>
      </Box>
    );
  }
) as <
  M extends MarketTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>
>(
  props: TradeMarketProps<M, T, TCD, I>
) => JSX.Element;
