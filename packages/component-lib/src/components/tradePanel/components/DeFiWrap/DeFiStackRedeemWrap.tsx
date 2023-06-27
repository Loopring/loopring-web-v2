import {
  CheckBoxIcon,
  CheckedIcon,
  DeFiSideRedeemCalcData,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { DeFiStakeRedeemWrapProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { InputCoin } from "../../../basic-lib";
import { ButtonStyle } from "../Styled";
import * as sdk from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
import { useSettings } from "../../../../stores";

const GridStyle = styled(Grid)`
  input::placeholder {
    font-size: ${({ theme }) => theme.fontDefault.h5};
  }

  div {
    textarea,
    .coinInput-wrap,
    .btnInput-wrap,
    .MuiOutlinedInput-root {
      background: var(--field-opacity);
      border-color: var(--opacity);

      :hover {
        border-color: var(--color-border-hover);
      }
    }
  }
`;
export const DeFiStackRedeemWrap = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideRedeemCalcData<T>
>({
  disabled,
  isJoin,
  btnInfo,
  onSubmitClick,
  switchStobEvent,
  onChangeEvent,
  handleError,
  deFiSideRedeemCalcData,
  accStatus,
  tokenSell,
  isLoading,
  btnStatus,
  minSellAmount,
  maxSellAmount,
  isFullTime,
  ...rest
}: DeFiStakeRedeemWrapProps<T, I, ACD>) => {
  // @ts-ignore
  const coinSellRef = React.useRef();
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const { t } = useTranslation();
  const [agree, setAgree] = React.useState(
    !isJoin && !isFullTime ? false : true
  );
  const getDisabled = React.useMemo(() => {
    return disabled || deFiSideRedeemCalcData === undefined;
  }, [btnStatus, deFiSideRedeemCalcData, disabled]);

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (deFiSideRedeemCalcData.coinSell.tradeValue !== ibData.tradeValue) {
        myLog("defi handleCountChange", _name, ibData);
        onChangeEvent({
          tradeData: { ...ibData },
        });
      }
    },
    [deFiSideRedeemCalcData, onChangeEvent]
  );
  const propsSell = {
    label: t("tokenEnterPaymentToken"),
    subLabel: t("tokenMax"),
    emptyText: t("tokenSelectToken"),
    placeholderText: "0.00",
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: true,
    isHideError: false,
    handleError: (data: any) => {
      const value = sdk.toBig(data.balance).minus(data.tradeValue);
      if (data.tradeValue && data.tradeValue > data.balance) {
        return {
          error: true,
          message: t("tokenNotEnough", { belong: data.belong }),
        };
      } else if (value.lt(minSellAmount) && !value.eq(0)) {
        return {
          error: true,
          message: t("labelRemainingAmount", {
            symbol:
              getValuePrecisionThousand(
                minSellAmount,
                tokenSell.precision,
                tokenSell.precision,
                tokenSell.precision,
                false
              ) +
              " " +
              deFiSideRedeemCalcData.coinSell.belong,
          }),
        };
      } else if (
        data.tradeValue &&
        sdk.toBig(data.tradeValue).lt(minSellAmount)
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
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
      );
    } else {
      return t(`labelRedeemBtn`, {
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      });
    }
  }, [t, btnInfo, network]);

  const {
    currentTotalEarnings,
    remainingEarn,
    forfeitedEarn,
    forfeitedEarnColor,
  } = React.useMemo(() => {
    const { remainAmount, totalRewards } = deFiSideRedeemCalcData.stakeViewInfo;
    const tradeVol = sdk
      .toBig(deFiSideRedeemCalcData.coinSell.tradeValue ?? 0)
      .times("1e" + tokenSell.decimals);
    const rateEarn = tradeVol.gt(0)
      ? tradeVol.div(remainAmount).times(totalRewards)
      : sdk.toBig(remainAmount).div(remainAmount).times(totalRewards);
    // .toBig(remainAmount)
    // .div(remainAmount)
    return {
      currentTotalEarnings:
        totalRewards !== "0"
          ? getValuePrecisionThousand(
              sdk.toBig(totalRewards).div("1e" + tokenSell.decimals),
              tokenSell.precision,
              tokenSell.precision,
              undefined,
              false
            ) +
            " " +
            deFiSideRedeemCalcData.coinSell.belong
          : EmptyValueTag,
      ...(tradeVol.gt(remainAmount) ||
      deFiSideRedeemCalcData.coinSell.tradeValue == undefined
        ? {
            forfeitedEarn: EmptyValueTag,
            forfeitedEarnColor: "var(--color-text-primary)",
          }
        : {
            forfeitedEarnColor: "var(--color-error)",
            forfeitedEarn: rateEarn.gt(0)
              ? "-" +
                getValuePrecisionThousand(
                  rateEarn.div("1e" + tokenSell.decimals),
                  tokenSell.precision,
                  tokenSell.precision,
                  undefined,
                  false
                ) +
                " " +
                deFiSideRedeemCalcData.coinSell.belong
              : EmptyValueTag,
          }),

      remainingEarn:
        tradeVol.lte(remainAmount) &&
        rateEarn.gt(0) &&
        sdk.toBig(totalRewards).minus(rateEarn).gt(0)
          ? getValuePrecisionThousand(
              sdk
                .toBig(totalRewards)
                .minus(rateEarn)
                .div("1e" + tokenSell.decimals),
              tokenSell.precision,
              tokenSell.precision,
              undefined,
              false
            ) +
            " " +
            deFiSideRedeemCalcData.coinSell.belong
          : EmptyValueTag,
    };
  }, [
    deFiSideRedeemCalcData.stakeViewInfo,
    deFiSideRedeemCalcData.coinSell.tradeValue,
  ]);
  myLog(
    "deFiSideRedeemCalcData.stakeViewInfo",
    deFiSideRedeemCalcData.stakeViewInfo,
    deFiSideRedeemCalcData.coinSell
  );
  return (
    <GridStyle
      className={deFiSideRedeemCalcData ? "" : "loading"}
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
            order: "right",
            inputData: deFiSideRedeemCalcData
              ? deFiSideRedeemCalcData.coinSell
              : ({} as any),
            coinMap: {},
            coinPrecision: tokenSell.precision,
          }}
        />
      </Grid>
      {isFullTime ? (
        <>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={2}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              {t("labelLRCStakeProduct")}
            </Typography>
            <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
              {(deFiSideRedeemCalcData?.stakeViewInfo as any)?.productId}
            </Typography>
          </Grid>
          <Grid item alignSelf={"stretch"} marginTop={3}>
            <Typography
              component={"p"}
              variant="body1"
              color={"var(--color-text-third)"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeRedeemDes"}>
                The staked LRC is locked in Loopring L2 and won't be able to
                used for other purpose although it can be redeemed any time;
                while if the staking is redeemed before 90 days, the accumulated
                reward will be dismissed.
              </Trans>
            </Typography>
          </Grid>
        </>
      ) : (
        <>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={2}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeCurrentEarn"}>
                Current Total Earnings
              </Trans>
            </Typography>
            <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
              {currentTotalEarnings}
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={2}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeForfeitedReward"}>
                Forfeited Reward
              </Trans>
            </Typography>
            <Typography
              component={"p"}
              variant={"body2"}
              color={forfeitedEarnColor}
            >
              {forfeitedEarn}
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={2}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              <Trans i18nKey={"labelLRCStakeRemainingEarnings"}>
                Remaining Earnings
              </Trans>
            </Typography>
            <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
              {remainingEarn}
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={2}
          >
            <Typography
              component={"p"}
              variant={"body2"}
              color={"textSecondary"}
              display={"inline-flex"}
              alignItems={"center"}
            >
              {t("labelLRCStakeProduct")}
            </Typography>
            <Typography component={"p"} variant={"body2"} color={"textPrimary"}>
              {(deFiSideRedeemCalcData?.stakeViewInfo as any)?.productId}
            </Typography>
          </Grid>
          <Grid
            container
            justifyContent={"space-between"}
            direction={"row"}
            alignItems={"center"}
            marginTop={5}
          >
            <MuiFormControlLabel
              sx={{
                alignItems: "flex-start",
                marginTop: 1 / 2,
              }}
              control={
                <Checkbox
                  checked={agree}
                  onChange={(_event: any, state: boolean) => {
                    setAgree(state);
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={
                <Typography
                  variant={"body1"}
                  color={"textSecondary"}
                  sx={{ wordBreak: "break-all" }}
                >
                  {t("labelLRCStakeRedeemAgree")}
                </Typography>
              }
            />
          </Grid>
        </>
      )}

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
                btnStatus === TradeBtnStatus.DISABLED ||
                !agree
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
