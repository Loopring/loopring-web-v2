import {
  AmmExitData,
  AmmInData,
  AvatarCoinStyled,
  CoinInfo,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  myLog,
  SlippageTolerance,
  SoursURL,
} from "@loopring-web/common-resources";
import { AmmWithdrawWrapProps } from "./Interface";
import { WithTranslation } from "react-i18next";
import React from "react";
import { usePopupState } from "material-ui-popup-state/hooks";
import { Avatar, Box, Grid, Link, Typography } from "@mui/material";
import {
  BtnPercentage,
  ButtonStyle,
  InputCoin,
  LinkActionStyle,
  PopoverPure,
  TradeBtnStatus,
} from "../../../index";
import { bindHover, bindPopover } from "material-ui-popup-state/es";
import { SlippagePanel } from "../tool";
import { useSettings } from "../../../../stores";
import { SvgStyled } from "./styled";
import * as sdk from "@loopring-web/loopring-sdk";
import { toBig } from "@loopring-web/loopring-sdk";

import { useAmmViewData } from "./ammViewHook";

import _ from "lodash";

export const AmmWithdrawWrap = <
  T extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
  I,
  ACD extends AmmInData<I>,
  C = IBData<I>
>({
  t,
  disabled,
  isStob,
  switchStobEvent,
  ammWithdrawBtnStatus,
  ammCalcData,
  onAmmRemoveClick,
  tokenLPProps,
  anchors,
  ammWithdrawBtnI18nKey,
  onRemoveChangeEvent,
  handleError,
  ammData,
  ...rest
}: AmmWithdrawWrapProps<T, I, ACD, C> & WithTranslation) => {
  const { coinJson, slippage } = useSettings();
  const coinLPRef = React.useRef();
  const tokenAIcon: any = coinJson[ammCalcData?.lpCoinA?.belong];
  const tokenBIcon: any = coinJson[ammCalcData?.lpCoinB?.belong];
  const slippageArray: Array<number | string> = SlippageTolerance.concat(
    `slippage:${slippage}`
  ) as Array<number | string>;
  const [isPercentage, setIsPercentage] = React.useState(true);

  const percentage =
    ammData?.coinLP?.tradeValue && ammCalcData?.lpCoin?.tradeValue
      ? (ammData.coinLP.tradeValue / ammCalcData.lpCoin.tradeValue) * 100
      : 0;
  const [_selectedPercentage, setSelectedPercentage] =
    React.useState(percentage);

  const [_isStoB, setIsStoB] = React.useState(
    typeof isStob !== "undefined" ? isStob : true
  );
  const [error, setError] = React.useState<{
    error: boolean;
    message?: string | React.ElementType;
  }>({
    error: false,
    message: "",
  });
  const _onSwitchStob = React.useCallback(
    (_event: any) => {
      setIsStoB(!_isStoB);
      if (typeof switchStobEvent === "function") {
        switchStobEvent(!_isStoB);
      }
    },
    [switchStobEvent, _isStoB]
  );

  const getDisabled = () => {
    return (
      disabled ||
      ammCalcData === undefined ||
      ammCalcData.coinInfoMap === undefined
    );
  };
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

  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _ref: any) => {
      if (_ref) {
        if (
          ammData?.coinLP.tradeValue !== ibData.tradeValue &&
          ammData?.coinLP.balance
        ) {
          const percentageValue = toBig(ibData.tradeValue ?? 0)
            .div(ammData.coinLP.balance)
            .times(100)
            .toFixed(2);
          if (!isNaN(Number(percentageValue))) {
            setSelectedPercentage(Number(percentageValue));
          }
          onRemoveChangeEvent({
            tradeData: { ...ammData, coinLP: ibData },
            type: "lp",
          });
        }
      } else {
        onRemoveChangeEvent({
          tradeData: { ...ammData, coinLP: ibData },
          type: "lp",
        });
      }
    },
    [ammData, onRemoveChangeEvent]
  );

  const onPercentage = (value: any) => {
    if (ammData?.coinLP && ammData?.coinLP?.belong) {
      setSelectedPercentage(value);
      const cloneLP = _.cloneDeep(ammData.coinLP);

      cloneLP.tradeValue = sdk
        .toBig(cloneLP?.balance ?? 0)
        .times(value)
        .div(100)
        .toNumber();

      myLog("onPercentage:", value, " :", cloneLP.balance, cloneLP.tradeValue);

      handleCountChange(cloneLP, null);
    }
  };

  const _onSlippageChange = React.useCallback(
    (
      slippage: number | string,
      customSlippage: number | string | undefined
    ) => {
      popupState.close();
      onRemoveChangeEvent({
        tradeData: {
          ...ammData,
          slippage: slippage,
          __cache__: {
            ...ammData.__cache__,
            customSlippage: customSlippage,
          },
        },
        type: "lp",
      });
    },
    [ammData, onRemoveChangeEvent]
  );

  const propsLP: any = {
    label: t("labelTokenAmount"),
    subLabel: t("labelAvailable"),
    placeholderText: "0.00",
    maxAllow: true,
    ...tokenLPProps,
    handleError,
    handleCountChange,
    ...rest,
  };

  const popupState = usePopupState({
    variant: "popover",
    popupId: "slippagePop",
  });

  const { label, stob } = useAmmViewData({
    error,
    i18nKey: ammWithdrawBtnI18nKey,
    t,
    _isStoB,
    ammCalcData,
    _onSwitchStob,
    isAdd: false,
  });

  const showPercentage =
    _selectedPercentage < 0 || _selectedPercentage > 100
      ? EmptyValueTag + "%"
      : `${_selectedPercentage}%`;
  const lpTradeValue = ammData?.coinLP?.tradeValue;
  let lpBalance: any = ammData?.coinLP?.balance;
  lpBalance = parseFloat(lpBalance);
  const showLP =
    lpBalance && lpTradeValue && lpTradeValue > 0 && lpTradeValue <= lpBalance
      ? getValuePrecisionThousand(lpTradeValue, 2, 6)
      : "0";

  const miniA = ammData?.coinA?.tradeValue
    ? getValuePrecisionThousand(ammData?.coinA?.tradeValue)
    : EmptyValueTag;

  const miniB = ammData?.coinB?.tradeValue
    ? getValuePrecisionThousand(ammData?.coinB?.tradeValue)
    : EmptyValueTag;

  return (
    <Grid
      className={ammCalcData ? "" : "loading"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
      overflow={"hidden"}
    >
      <Grid
        item
        display={"flex"}
        alignSelf={"stretch"}
        alignItems={"stretch"}
        flexDirection={"column"}
      >
        <Typography alignSelf={"flex-end"}>
          <Link onClick={() => setIsPercentage(!isPercentage)}>
            {t("labelAmmSwitch")}
          </Link>
        </Typography>
        <Typography alignSelf={"center"} variant={"h2"}>
          {showPercentage}
        </Typography>
        <Grid item xs={12} hidden={!isPercentage} height={87}>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography
              alignSelf={"center"}
              variant={"body1"}
              marginTop={1}
              lineHeight={"22px"}
            >
              {showLP}
            </Typography>
            <Box alignSelf={"stretch"} marginTop={1} marginX={1} height={49}>
              <BtnPercentage
                selected={_selectedPercentage}
                anchors={[
                  {
                    value: 0,
                    label: "0",
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
                    label: t("labelAvaiable:") + "100%",
                  },
                ]}
                handleChanged={onPercentage}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} hidden={isPercentage} minHeight={86} paddingTop={1}>
          <InputCoin<IBData<I>, I, CoinInfo<I>>
            ref={coinLPRef}
            disabled={getDisabled()}
            {...{
              ...propsLP,
              isHideError: true,
              isShowCoinInfo: false,
              order: "right",
              inputData: ammData ? ammData.coinLP : ({} as any),
              coinMap: ammCalcData ? ammCalcData.coinInfoMap : ({} as any),
            }}
          />
        </Grid>

        <Box alignSelf={"center"} marginY={1}>
          <SvgStyled>
            <ExchangeIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-third)"}
            />
          </SvgStyled>
        </Box>
        <Box
          borderRadius={1}
          style={{ background: "var(--color-table-header-bg)" }}
          alignItems={"stretch"}
          display={"flex"}
          paddingY={1}
          paddingX={2}
          flexDirection={"column"}
        >
          <Typography
            variant={"body1"}
            color={"textSecondary"}
            alignSelf={"flex-start"}
          >
            {t("labelMinReceive")}
          </Typography>
          <Box
            marginTop={1}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box
              component={"span"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              className={"logo-icon"}
              height={"var(--withdraw-coin-size)"}
              justifyContent={"flex-start"}
              marginRight={1 / 2}
            >
              {tokenAIcon ? (
                <AvatarCoinStyled
                  imgx={tokenAIcon.x}
                  imgy={tokenAIcon.y}
                  imgheight={tokenAIcon.height}
                  imgwidth={tokenAIcon.width}
                  size={16}
                  variant="circular"
                  style={{ marginLeft: "-8px" }}
                  alt={ammCalcData?.lpCoinA?.belong as string}
                  src={
                    "data:image/svg+xml;utf8," +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant="circular"
                  alt={ammCalcData?.lpCoinA?.belong as string}
                  style={{
                    width: "var(--withdraw-coin-size)",
                    height: "var(--withdraw-coin-size)",
                  }}
                  src={SoursURL + "images/icon-default.png"}
                />
              )}
              <Typography variant={"body1"}>
                {ammData?.coinA?.belong}
              </Typography>
            </Box>
            <Typography variant={"body1"}>{miniA}</Typography>
          </Box>
          <Box
            marginTop={1}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box
              component={"span"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              className={"logo-icon"}
              height={"var(--withdraw-coin-size"}
              justifyContent={"flex-start"}
              width={"var(--withdraw-coin-size)"}
              marginRight={1 / 2}
            >
              {tokenBIcon ? (
                <AvatarCoinStyled
                  imgx={tokenBIcon.x}
                  imgy={tokenBIcon.y}
                  imgheight={tokenBIcon.height}
                  imgwidth={tokenBIcon.width}
                  size={16}
                  variant="circular"
                  style={{ marginLeft: "-8px" }}
                  alt={ammCalcData?.lpCoinB?.belong as string}
                  src={
                    "data:image/svg+xml;utf8," +
                    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                  }
                />
              ) : (
                <Avatar
                  variant="circular"
                  alt={ammCalcData?.lpCoinB?.belong as string}
                  style={{
                    width: "var(--withdraw-coin-size)",
                    height: "var(--withdraw-coin-size)",
                  }}
                  src={SoursURL + "images/icon-default.png"}
                />
              )}
              <Typography variant={"body1"}>
                {ammData?.coinB?.belong}
              </Typography>
            </Box>
            <Typography variant={"body1"}>{miniB}</Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item>
        <Typography
          component={"p"}
          variant="body2"
          height={24}
          lineHeight={"24px"}
        >
          {stob}
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
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {ammCalcData ? (
                  <>
                    <Typography
                      {...bindHover(popupState)}
                      component={"span"}
                      variant="body2"
                      color={"textPrimary"}
                    >
                      <LinkActionStyle>
                        {ammData.slippage
                          ? ammData.slippage
                          : ammCalcData?.slippage
                          ? ammCalcData?.slippage
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
                            slippage:
                              ammData && ammData.slippage
                                ? ammData.slippage
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
                {" "}
                {t("swapFee")}{" "}
              </Typography>
              <Typography component={"p"} variant="body2" color={"textPrimary"}>
                {ammCalcData ? ammCalcData?.fee : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <ButtonStyle
              variant={"contained"}
              size={"large"}
              color={"primary"}
              onClick={() => {
                onAmmRemoveClick(ammData);
                setSelectedPercentage(0);
              }}
              loading={
                !getDisabled() &&
                ammWithdrawBtnStatus === TradeBtnStatus.LOADING
                  ? "true"
                  : "false"
              }
              disabled={
                getDisabled() ||
                ammWithdrawBtnStatus === TradeBtnStatus.DISABLED ||
                ammWithdrawBtnStatus === TradeBtnStatus.LOADING ||
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
