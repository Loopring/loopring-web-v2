import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { BtnPercentage, InputCoin, InputSize } from "../../basic-lib";
import { LimitTradeData, TradeLimitProps } from "../Interface";
import {
  CheckBoxIcon,
  CheckedIcon,
  CoinInfo,
  CoinKey,
  CoinMap,
  CurrencyToTag,
  IBData,
  PriceTag,
  TradeBaseType,
  TradeBtnStatus,
  TradeCalcProData,
  TradeProType,
} from "@loopring-web/common-resources";
import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Tab,
  Typography,
} from "@mui/material";
import { TabsStyle } from "../components/Styled";
import { useCommon } from "./hookCommon";
import { Button } from "./../../index";
import React from "react";
import { useSettings } from "../../../stores";

export const LimitTrade = withTranslation("common", { withRef: true })(
  <
    L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>,
    I = CoinKey<any>
  >({
    tradeData = { type: TradeProType.sell } as L,
    ...props
  }: TradeLimitProps<L, T, TCD, I> & WithTranslation) => {
    const {
      t,
      tradeType,
      tradeLimitI18nKey,
      tradeLimitBtnStatus,
      tradeLimitBtnStyle,
      tokenPriceProps,
      handleSubmitEvent,
      onChangeEvent,
    } = props;
    const { currency } = useSettings();
    const priceRef = React.useRef();
    const {
      quoteRef,
      baseRef,
      btnLabel,
      getDisabled,
      _handleChangeIndex,
      // inputError,
      tradeCalcProData,
      tradeBtnBaseStatus,
      handleCountChange,
      propsBase,
      propsQuote,
      onPercentage,
      selectedPercentage,
    } = useCommon({
      type: "limit",
      ...(props as any),
      tradeData,
      tradeType,
      onChangeEvent,
      i18nKey: tradeLimitI18nKey ? tradeLimitI18nKey : "labelProLimitBtn",
      tradeBtnBaseStatus: tradeLimitBtnStatus,
    });
    const propsPrice = React.useMemo(() => {
      return {
        label: t("labelProPrice"),
        subLabel: `\u2248 ${PriceTag[CurrencyToTag[currency]]}`,
        emptyText: t("tokenSelectToken"),
        placeholderText: "0.00",
        size: InputSize.small,
        order: '"right"' as any,
        coinPrecision: 2,
        coinLabelStyle: { color: "var(--color-text-secondary)" },
        isShowCoinIcon: false,
        ...tokenPriceProps,
        handleCountChange,
        maxAllow: false,
        t,
      };
    }, [tradeType, TradeProType, tokenPriceProps, handleCountChange]);

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
        <Box className={"trade-panel"} paddingX={2} paddingTop={2}>
          <Box paddingTop={2}>
            <InputCoin<any, I, CoinInfo<I>>
              ref={priceRef as any}
              name={"price"}
              disabled={false}
              {...({
                ...propsPrice,
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                maxAllow: false,
                isHideError: true,
                inputData: tradeData ? tradeData.price : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              } as any)}
            />
          </Box>
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
                isHideError: true,
                handleCountChange,
                inputData: tradeData ? tradeData.base : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
          <Box alignSelf={"center"} paddingTop={4} paddingX={1}>
            <BtnPercentage
              step={1}
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
                isShowCoinInfo: true,
                isShowCoinIcon: false,
                handleCountChange,
                inputData: tradeData ? tradeData.quote : ({} as any),
                coinMap:
                  tradeCalcProData && tradeCalcProData.coinInfoMap
                    ? tradeCalcProData.coinInfoMap
                    : ({} as CoinMap<I, CoinInfo<I>>),
              }}
            />
          </Box>
        </Box>
        <Box className={"info-panel"} paddingX={2} paddingTop={2}></Box>
        {tradeCalcProData.isNotMatchMarketPrice && (
          <Box paddingX={2} paddingTop={2}>
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
                      TradeBaseType.checkMarketPrice
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
                    i18nKey={"labelExpectSettlementLimitPrice"}
                    interpolation={{ escapeValue: false }}
                    tOptions={{
                      symbolBase: tradeCalcProData.coinBase,
                      symbolQuote: tradeCalcProData.coinQuote,
                      price: tradeData.price.tradeValue,
                      marketPrice: tradeCalcProData.marketPrice,
                      marketRatePrice: tradeCalcProData.marketRatePrice,
                    }}
                  >
                    The expected settlement price from this order is symbol =
                    xxxx, while the current market price from a trusted oracle
                    is symbol = xxx. There is a 10.45% variance observed. To
                    proceed, tap here to confirm you understand and acknowledge
                    the risk.
                  </Trans>
                </Typography>
              }
            />
          </Box>
        )}
        <Box paddingX={2} paddingTop={2}>
          {/*{getDisabled()} {tradeBtnBaseStatus}*/}
          <Button
            variant={"contained"}
            size={"medium"}
            color={tradeType === TradeProType.sell ? "error" : "success"}
            loadingbg={
              tradeType === TradeProType.sell
                ? "var(--color-error)"
                : "var(--color-success)"
            }
            style={tradeLimitBtnStyle}
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
          </Button>
        </Box>
      </Box>
    );
  }
) as <
  L extends LimitTradeData<T>,
  T extends IBData<I>,
  TCD extends TradeCalcProData<I>,
  I = CoinKey<any>
>(
  props: TradeLimitProps<L, T, TCD, I>
) => JSX.Element;
