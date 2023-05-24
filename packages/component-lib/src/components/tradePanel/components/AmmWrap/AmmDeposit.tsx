import {
  AmmInData,
  AmmJoinData,
  defaultSlipage,
  EmptyValueTag,
  IBData,
  LinkedIcon,
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
import { useAmmViewData } from "./ammViewHook";
import { ButtonStyle } from "../Styled";

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
  handleError,
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

  const [errorA, setErrorA] = React.useState<{
    error: boolean;
    message?: string | JSX.Element;
  }>({
    error: false,
    message: "",
  });
  const [errorB, setErrorB] = React.useState<{
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

  const getDisabled = () => {
    return (
      disabled ||
      ammCalcData === undefined ||
      ammCalcData.coinInfoMap === undefined
    );
  };

  if (typeof handleError !== "function") {
    handleError = ({ belong, balance, tradeValue }: any) => {
      if (ammCalcData?.myCoinA?.belong && ammCalcData?.myCoinB?.belong) {
        const isCoinA = belong === ammCalcData.myCoinA.belong;
        if (balance < tradeValue || (tradeValue && !balance)) {
          const _error = {
            error: true,
            message: t("tokenNotEnough", { belong: belong }),
          };
          if (isCoinA) {
            setErrorA(_error);
          } else {
            setErrorB(_error);
          }
          return _error;
        }

        if (isCoinA) {
          setErrorA({ error: false, message: "" });
        } else {
          setErrorB({ error: false, message: "" });
        }
      }
      return { error: false, message: "" };
    };
  }
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

  const { label, stob } = useAmmViewData({
    error: { errorA, errorB },
    i18nKey: ammDepositBtnI18nKey,
    t,
    _isStoB,
    ammCalcData,
    _onSwitchStob,
    isAdd: true,
  });

  // myLog('amm deposit ammData:', ammData)

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
