import {
  AmmInData,
  AmmJoinData,
  defaultSlipage,
  EmptyValueTag,
  IBData,
  LinkedIcon,
  ReverseIcon,
  SlippageTolerance,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import { AmmDepositWrapProps } from "./Interface";
import { InputCoin, LinkActionStyle, PopoverPure } from "../../../basic-lib";
import React from "react";
import { usePopupState } from "material-ui-popup-state/hooks";
import { Box, Grid, Typography } from "@mui/material";
import { bindHover, bindPopover } from "material-ui-popup-state/es";
import { SlippagePanel } from "../tool";
import { SvgStyled } from "./styled";
import { useSettings } from "../../../../stores";
import { ButtonStyle, IconButtonStyled } from "../Styled";

export const AmmDepositWrap = <
  T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
  I,
  ACD extends AmmInData<I>,
  C = IBData<I>
>({
  t,
  disabled,
  isStob,
  switchStobEvent,
  ammDepositBtnStatus,
  ammCalcData,
  ammDepositBtnI18nKey,
  onAmmAddClick,
  tokenAProps,
  tokenBProps,
  onAddChangeEvent,
  ammData,
  propsAExtends = {},
  propsBExtends = {},
  // coinAPrecision,
  // coinBPrecision,
  ...rest
}: AmmDepositWrapProps<T, I, ACD, C> & WithTranslation) => {
  const coinARef = React.useRef();
  const coinBRef = React.useRef();
  const { slippage } = useSettings();
  const slippageArray: Array<number | string> = SlippageTolerance.concat(
    `slippage:${slippage}`
  ) as Array<number | string>;

  const [_isStoB, setIsStoB] = React.useState(isStob ?? true);
  const stob = React.useMemo(() => {
    if (
      ammCalcData &&
      ammCalcData?.lpCoinA &&
      ammCalcData?.lpCoinB &&
      ammCalcData.AtoB
    ) {
      let price: string;
      if (_isStoB) {
        price = `1 ${ammCalcData?.lpCoinA?.belong} \u2248 ${
          ammCalcData.AtoB ? ammCalcData.AtoB : EmptyValueTag
        } ${ammCalcData?.lpCoinB?.belong}`;
      } else {
        price = `1 ${ammCalcData?.lpCoinB?.belong} \u2248 ${
          ammCalcData.BtoA ? ammCalcData.BtoA : EmptyValueTag
        } ${ammCalcData?.lpCoinA?.belong}`;
      }
      return (
        <>
          {price}
          <IconButtonStyled
            size={"small"}
            aria-label={t("tokenExchange")}
            onClick={() => setIsStoB(!_isStoB)}
          >
            <ReverseIcon />
          </IconButtonStyled>
        </>
      );
    } else {
      return EmptyValueTag;
    }
  }, [_isStoB, ammCalcData]);
  const getDisabled = () => {
    return (
      disabled ||
      ammCalcData === undefined ||
      ammCalcData.coinInfoMap === undefined
    );
  };
  const handleError = () => {
    if (
      ammDepositBtnStatus === TradeBtnStatus.DISABLED &&
      ammDepositBtnI18nKey &&
      (/labelAMMNoEnough/.test(ammDepositBtnI18nKey) ||
        /labelAMMMax/.test(ammDepositBtnI18nKey))
    ) {
      return { error: true };
    }
    return { error: false };
  };

  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _name: string, _ref: any) => {
      const focus: "coinA" | "coinB" =
        _ref?.current === coinARef.current ? "coinA" : "coinB";
      if (ammData[focus].tradeValue !== ibData.tradeValue) {
        onAddChangeEvent({
          tradeData: { ...ammData, [focus]: ibData },
          type: focus,
        });
      }
    },
    [ammData, onAddChangeEvent]
  );
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
      onAddChangeEvent({
        tradeData: {
          ...ammData,
          slippage: slippage,
          __cache__: {
            ...ammData.__cache__,
            customSlippage: customSlippage,
          },
        },
        type: "coinA",
      });
    },
    [ammData, onAddChangeEvent]
  );
  const label = React.useMemo(() => {
    if (ammDepositBtnI18nKey) {
      const key = ammDepositBtnI18nKey.split("|");
      return t(key[0], key && key[1] ? { arg: key[1].toString() } : undefined);
    } else {
      return t(`labelAddLiquidityBtn`);
    }
  }, [ammDepositBtnI18nKey]);

  return (
    <Grid
      className={ammCalcData ? "" : "loading"}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
      <Grid
        item
        marginTop={3}
        display={"flex"}
        alignSelf={"stretch"}
        justifyContent={""}
        alignItems={"stretch"}
        flexDirection={"column"}
      >
        <InputCoin<any, I, any>
          ref={coinARef}
          disabled={
            getDisabled() || ammDepositBtnStatus === TradeBtnStatus.LOADING
          }
          {...{
            ...propsA,
            name: "coinA",
            isHideError: true,
            order: "right",
            inputData: ammData ? ammData.coinA : ({} as any),
            coinMap: ammCalcData ? ammCalcData.coinInfoMap : ({} as any),
            ...propsAExtends,
            // coinPrecision: coinAPrecision,
          }}
        />
        <Box alignSelf={"center"} marginY={1}>
          <SvgStyled>
            {/* <LinkedIcon /> */}
            <LinkedIcon
              fontSize={"large"}
              htmlColor={"var(--color-text-third)"}
            />
          </SvgStyled>
        </Box>
        <InputCoin<any, I, any>
          ref={coinBRef}
          disabled={
            getDisabled() || ammDepositBtnStatus === TradeBtnStatus.LOADING
          }
          {...{
            ...propsB,
            name: "coinB",
            isHideError: true,
            order: "right",
            inputData: ammData ? ammData.coinB : ({} as any),
            coinMap: ammCalcData ? ammCalcData.coinInfoMap : ({} as any),
            ...propsBExtends,
            // coinPrecision: coinBPrecision,
          }}
        />
      </Grid>

      <Grid item>
        <Typography
          component={"p"}
          variant={"body1"}
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
                        : ammCalcData.slippage
                        ? ammCalcData.slippage
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
                          slippage: ammData.slippage
                            ? ammData.slippage
                            : ammCalcData.slippage
                            ? ammCalcData.slippage
                            : defaultSlipage,
                        }}
                      />
                    </PopoverPure>
                  </Typography>
                </>
              ) : (
                EmptyValueTag
              )}
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
                {ammCalcData?.fee && ammCalcData?.fee != "0"
                  ? ammCalcData.fee + " " + ammCalcData.myCoinB.belong
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <ButtonStyle
              variant={"contained"}
              size={"large"}
              color={"primary"}
              onClick={() => {
                onAmmAddClick(ammData);
              }}
              loading={
                !getDisabled() && ammDepositBtnStatus === TradeBtnStatus.LOADING
                  ? "true"
                  : "false"
              }
              disabled={
                getDisabled() ||
                ammDepositBtnStatus === TradeBtnStatus.DISABLED ||
                ammDepositBtnStatus === TradeBtnStatus.LOADING
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
