import {
  DeFiSideCalcData,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TradeBtnStatus,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import { DeFiSideType, DeFiSideWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Tooltip, Typography } from "@mui/material";
import { InputCoin, Button } from "../../../basic-lib";
import { ButtonStyle } from "../Styled";
import * as sdk from "@loopring-web/loopring-sdk";
import moment from "moment";
import styled from "@emotion/styled";
import { useSettings } from "../../../../stores";

const GridStyle = styled(Grid)`
  input::placeholder {
    font-size: ${({ theme }) => theme.fontDefault.h5};
  }
`;

export const DeFiSideDetail = ({
  // stakeViewInfo,
  tokenSell,
  order,
  onRedeem,
}: DeFiSideType) => {
  const { t } = useTranslation();
  // myLog(
  //   moment(new Date(order.stakeAt ?? ""))
  //     .utc()
  //     .startOf("days")
  //     .toString()
  // );
  const diff = moment(Date.now()).diff(
    moment(new Date(order.stakeAt ?? ""))
      .utc()
      .startOf("days"),
    "days",
    false
  );
  return (
    <Box flex={1}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        justifyContent={"space-between"}
        paddingX={3}
      >
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSideAmount"}>Amount</Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order.remainAmount && order.remainAmount != "0"
              ? getValuePrecisionThousand(
                  sdk.toBig(order.remainAmount).div("1e" + tokenSell.decimals),
                  tokenSell.precision,
                  tokenSell.precision,
                  tokenSell.precision,
                  false,
                  { floor: false, isAbbreviate: true }
                ) +
                " " +
                tokenSell.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            {t("labelDeFiSideProduct")}
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order?.productId ?? EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            {t("labelDeFiSidePoolShare")}
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order?.remainAmount && order?.staked && order.staked != "0"
              ? getValuePrecisionThousand(
                  sdk.toBig(order.remainAmount).div(order.staked).times(100),
                  2,
                  2,
                  undefined
                ) + "%"
              : EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSidePoolAPR"}>APR</Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order.apr && order.apr !== "0.00"
              ? order.apr + "%"
              : EmptyValueTag}
          </Typography>
        </Typography>{" "}
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSideCumulativeEarnings"}>
              Cumulative Earnings
            </Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order.totalRewards && order.totalRewards != "0"
              ? getValuePrecisionThousand(
                  sdk.toBig(order.totalRewards).div("1e" + tokenSell.decimals),
                  tokenSell.precision,
                  tokenSell.precision,
                  undefined,
                  false,
                  { floor: false, isAbbreviate: true }
                ) +
                " " +
                tokenSell.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSidePreviousEarnings"}>
              Previous Day's Earnings
            </Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {order.lastDayPendingRewards && order.lastDayPendingRewards != "0"
              ? getValuePrecisionThousand(
                  sdk
                    .toBig(order.lastDayPendingRewards)
                    .div("1e" + tokenSell.decimals),
                  tokenSell.precision,
                  tokenSell.precision,
                  undefined,
                  false,
                  { floor: false, isAbbreviate: true }
                ) +
                " " +
                tokenSell.symbol
              : EmptyValueTag}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSideLockDuration"}>
              Lock duration to claim reward
            </Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {"≥ " +
              (order.claimableTime - order.stakeAt) / 86400000 +
              " " +
              t("labelDay")}
          </Typography>
        </Typography>{" "}
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSideSubscribeTime"}>Subscribe Time</Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {moment(new Date(order.stakeAt))
              // .utc()
              // .startOf("days")
              .format(YEAR_DAY_MINUTE_FORMAT)}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingBottom={2}
        >
          <Typography
            component={"span"}
            variant={"inherit"}
            color={"textSecondary"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans i18nKey={"labelDeFiSideHoldingTime"}>Holding Time</Trans>
          </Typography>
          <Typography component={"span"} variant={"inherit"}>
            {diff ? diff + " " + t("labelDays") : "< 1" + " " + t("labelDays")}
          </Typography>
        </Typography>
        <Typography
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          paddingTop={4}
          paddingBottom={2}
        >
          <Button
            fullWidth
            size={"large"}
            variant={"contained"}
            color={"primary"}
            onClick={() => {
              onRedeem(order);
            }}
          >
            {t("labelDefiStakingRedeem")}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};
export const DeFiSideWrap = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideCalcData<T>
>({
  disabled,
  isJoin,
  btnInfo,
  onSubmitClick,
  switchStobEvent,
  onChangeEvent,
  handleError,
  deFiSideCalcData,
  accStatus,
  tokenSell,
  isLoading,
  btnStatus,
  tokenSellProps,
  minSellAmount,
  maxSellAmount,
  ...rest
}: DeFiSideWrapProps<T, I, ACD>) => {
  // @ts-ignore
  const coinSellRef = React.useRef();
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const { t } = useTranslation();
  const getDisabled = React.useMemo(() => {
    return disabled || deFiSideCalcData === undefined;
  }, [btnStatus, deFiSideCalcData, disabled]);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (deFiSideCalcData.coinSell.tradeValue !== ibData.tradeValue) {
        myLog("defi handleCountChange", _name, ibData);
        onChangeEvent({
          tradeData: { ...ibData },
        });
      }
    },
    [deFiSideCalcData, onChangeEvent]
  );
  const propsSell = {
    label: t("tokenEnterPaymentToken"),
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText:
      minSellAmount && maxSellAmount
        ? t("labelInvestMaxDefi", {
            minValue: getValuePrecisionThousand(
              minSellAmount,
              tokenSell.precision,
              tokenSell.precision,
              tokenSell.precision,
              false,
              { floor: false, isAbbreviate: true }
            ),
            maxValue: getValuePrecisionThousand(
              maxSellAmount,
              tokenSell.precision,
              tokenSell.precision,
              tokenSell.precision,
              false,
              { floor: false, isAbbreviate: true }
            ),
          })
        : // <Typography variant={"body1"} color={"var(--color-text-third)"}>
          //
          // </Typography>
          "0.00",
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: true,
    ...tokenSellProps,
    handleError: (data: any) => {
      if (
        data.tradeValue &&
        (data.tradeValue > data.balance ||
          sdk.toBig(data.tradeValue).gt(maxSellAmount) ||
          sdk.toBig(data.tradeValue).lt(minSellAmount))
      ) {
        return {
          error: true,
        };
      }
      return {
        error: false,
      };
    },
    handleCountChange: handleCountChange as any,
    ...rest,
  } as any;

  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split("|");
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
      );
    } else {
      return isJoin
        ? t(`labelInvestBtn`, {
            layer2: L1L2_NAME_DEFINED[network].layer2,
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
        : t(`labelRedeemBtn`, {
            layer2: L1L2_NAME_DEFINED[network].layer2,
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          });
    }
  }, [isJoin, t, btnInfo]);

  const daysDuration = Math.ceil(
    Number(deFiSideCalcData?.stakeViewInfo?.rewardPeriod ?? 0) / 86400000
  );
  let dalyEarn = deFiSideCalcData?.stakeViewInfo?.dalyEarn
    ? getValuePrecisionThousand(
        sdk
          .toBig(deFiSideCalcData.stakeViewInfo.dalyEarn)
          .div("1e" + tokenSell.decimals)
          .div(100),
        tokenSell.precision,
        tokenSell.precision,
        tokenSell.precision,
        false
      )
    : undefined;
  dalyEarn =
    dalyEarn && dalyEarn !== "0"
      ? dalyEarn + " " + tokenSell.symbol
      : EmptyValueTag;
  myLog("deFiSideCalcData.stakeViewInfo", deFiSideCalcData.stakeViewInfo);
  return (
    <GridStyle
      className={deFiSideCalcData ? "" : "loading"}
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
          {t("labelInvestLRCTitle")}
        </Typography>
      </Grid>
      <Grid
        item
        marginTop={1}
        flexDirection={"column"}
        display={"flex"}
        alignSelf={"stretch"}
        alignItems={"stretch"}
      >
        <InputCoin<T, I, any>
          ref={coinSellRef}
          disabled={getDisabled}
          {...{
            ...propsSell,
            name: "coinSell",
            isHideError: true,
            order: "right",
            inputData: deFiSideCalcData
              ? deFiSideCalcData.coinSell
              : ({} as any),
            coinMap: {},
            coinPrecision: tokenSell.precision,
          }}
        />
      </Grid>
      <>
        <Grid item alignSelf={"stretch"} marginTop={1 / 2} marginBottom={2}>
          <Typography
            component={"span"}
            display={"inline-flex"}
            color={"textSecondary"}
            variant={"body2"}
          >
            <Trans i18nKey={"labelInvestLRCStakingLockAlert"}>
              Your assets for investment will be locked until your redemption.
            </Trans>
          </Typography>
        </Grid>
        <Grid
          container
          justifyContent={"space-between"}
          direction={"row"}
          alignItems={"center"}
          marginTop={1}
        >
          <Tooltip
            title={t("labelLRCStakeAPRTooltips").toString()}
            placement={"top"}
            key={"APR"}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeAPR"}>
                APR
                <Info2Icon
                  fontSize={"small"}
                  color={"inherit"}
                  sx={{ marginX: 1 / 2 }}
                />
              </Trans>
            </Typography>
          </Tooltip>
          <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
            {deFiSideCalcData?.stakeViewInfo?.apr &&
            deFiSideCalcData?.stakeViewInfo?.apr !== "0.00"
              ? deFiSideCalcData.stakeViewInfo.apr + "%"
              : EmptyValueTag}
          </Typography>
        </Grid>

        <Grid
          container
          justifyContent={"space-between"}
          direction={"row"}
          alignItems={"center"}
          marginTop={1}
        >
          <Tooltip
            title={t("labelLRCStakeEarnTooltips").toString()}
            placement={"top"}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeEarn"}>
                Earn
                <Info2Icon
                  fontSize={"small"}
                  color={"inherit"}
                  sx={{ marginX: 1 / 2 }}
                />
              </Trans>
            </Typography>
          </Tooltip>
          <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
            {dalyEarn}
          </Typography>
        </Grid>
        <Grid
          container
          justifyContent={"space-between"}
          direction={"row"}
          alignItems={"center"}
          marginTop={1}
        >
          <Tooltip
            title={t("labelLRCStakeDurationTooltips", {
              day: daysDuration ? daysDuration : EmptyValueTag,
            }).toString()}
            placement={"top"}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeDuration"}>
                Duration
                <Info2Icon
                  fontSize={"small"}
                  color={"inherit"}
                  sx={{ marginX: 1 / 2 }}
                />
              </Trans>
            </Typography>
          </Tooltip>
          <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
            {daysDuration
              ? "≥ " + daysDuration + " " + t("labelDay")
              : EmptyValueTag}
          </Typography>
        </Grid>
        <Grid item alignSelf={"stretch"} marginTop={3}>
          <Typography
            component={"p"}
            variant={"body2"}
            color={"var(--color-text-third)"}
            display={"inline-flex"}
            alignItems={"center"}
          >
            <Trans
              i18nKey={"labelLRCStakeRiskDes"}
              tOptions={{
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }}
            >
              The staked LRC is locked in Loopring L2 and won't be able to used
              for other purpose although it can be redeemed any time; while if
              the staking is redeemed before 90 days, the accumulated reward
              will be dismissed.
            </Trans>
          </Typography>
        </Grid>
      </>

      <Grid item alignSelf={"stretch"} marginTop={2}>
        <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
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
        </Grid>
      </Grid>
    </GridStyle>
  );
};
