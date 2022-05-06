import {
  CloseIcon,
  globalSetup,
  IBData,
  LoadingIcon,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { WithTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  Button,
  IconClearStyled,
  TextField,
  useSettings,
} from "../../../index";
import { DepositViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";

//SelectReceiveCoin
export const DepositWrap = <
  T extends {
    referAddress?: string;
    toAddress?: string;
    addressError?: { error: boolean; message?: string };
  } & IBData<I>,
  I
>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  title,
  description,
  btnInfo,
  depositBtnStatus,
  onDepositClick,
  isNewAccount,
  handleError,
  addressDefault,
  chargeFeeTokenList,
  onChangeEvent,
  handleClear,
  isAllowInputTokenAddress,
  toIsAddressCheckLoading,
  toIsLoopringAddress,
  realToAddress,
  referIsAddressCheckLoading,
  referIsLoopringAddress,
  realReferAddress,
  // handleOnAddressChange,
  // handleAddressError,
  wait = globalSetup.wait,
  allowTrade,
  ...rest
}: DepositViewProps<T, I> & WithTranslation) => {
  const inputBtnRef = React.useRef();
  let { feeChargeOrder } = useSettings();

  const getDisabled = React.useMemo(() => {
    return disabled || depositBtnStatus === TradeBtnStatus.DISABLED;
  }, [depositBtnStatus, disabled]);

  const inputButtonDefaultProps = {
    label: t("depositLabelEnterToken"),
  };
  const isNewAlert = React.useMemo(() => {
    if (isNewAccount && chargeFeeTokenList && tradeData && tradeData.belong) {
      const index = chargeFeeTokenList?.findIndex(
        ({ belong }) => belong === tradeData.belong
      );

      if (index === -1) {
        return (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelIsNotFeeToken", {
              symbol: chargeFeeTokenList.map((item) => item.belong ?? ""),
            })}
          </Typography>
        );
      }
      const Max: number =
        Number(chargeFeeTokenList[index].fee.toString().replace(",", "")) * 4;
      if (Max > (tradeData.tradeValue ?? 0)) {
        return (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelIsNotEnoughFeeToken", {
              symbol: tradeData.belong,
              fee: Max,
            })}
          </Typography>
        );
      } else {
        return <></>;
      }
    } else if (isNewAccount) {
      return (
        <Typography
          color={"var(--color-text-third)"}
          component={"p"}
          variant={"body1"}
          marginBottom={1}
        >
          {t("labelIsNotFeeToken", {
            symbol:
              chargeFeeTokenList?.map((item) => item.belong ?? "") ??
              feeChargeOrder,
          })}
        </Typography>
      );
    } else {
      return <></>;
    }
  }, [isNewAccount, chargeFeeTokenList, tradeData, t, feeChargeOrder]);

  return (
    <Grid
      className={walletMap ? "depositWrap" : "depositWrap loading"}
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <BasicACoinTrade
          {...{
            ...rest,
            t,
            type: "TOKEN",
            disabled,
            onChangeEvent,
            walletMap,
            tradeData,
            coinMap,
            inputButtonDefaultProps,
            inputBtnRef: inputBtnRef,
          }}
        />
      </Grid>
      {!isAllowInputTokenAddress && isNewAccount ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <TextField
            className={"text-address"}
            value={tradeData.referAddress ? tradeData.referAddress : ""}
            error={!!(tradeData.addressError && tradeData.addressError?.error)}
            label={t("depositLabelRefer")}
            placeholder={t("depositLabelPlaceholder")}
            onChange={(event) => {
              const referAddress = event.target.value;
              //...tradeData,
              onChangeEvent(0, {
                tradeData: { referAddress } as T,
                to: "button",
              });
            }}
            fullWidth={true}
          />
          {tradeData.referAddress !== "" ? (
            referIsAddressCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: "32px", right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: "30px" }}
                aria-label="Clear"
                onClick={handleClear}
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
          <Box marginLeft={1 / 2}>
            {tradeData.addressError?.error || !referIsLoopringAddress ? (
              <Typography
                color={"var(--color-error)"}
                variant={"body2"}
                marginTop={1 / 2}
                alignSelf={"stretch"}
                position={"relative"}
              >
                {t("labelAddressNotLoopring")}
              </Typography>
            ) : tradeData.referAddress &&
              realReferAddress &&
              !referIsAddressCheckLoading ? (
              <Typography
                color={"var(--color-text-primary)"}
                variant={"body2"}
                marginTop={1 / 2}
                style={{ wordBreak: "break-all" }}
              >
                {realReferAddress}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Grid>
      ) : (
        <></>
      )}
      {isAllowInputTokenAddress ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <TextField
            className={"text-address"}
            value={tradeData.toAddress ? tradeData.toAddress : ""}
            error={!!(tradeData.addressError && tradeData.addressError?.error)}
            label={t("depositLabelTo")}
            placeholder={t("depositLabelPlaceholder")}
            onChange={(event) => {
              const toAddress = event.target.value;
              //...tradeData,
              onChangeEvent(0, { tradeData: { toAddress } as T, to: "button" });
            }}
            fullWidth={true}
          />
          {tradeData.toAddress !== "" ? (
            toIsAddressCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: "32px", right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: "30px" }}
                aria-label="Clear"
                onClick={handleClear}
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
          <Box marginLeft={1 / 2}>
            {tradeData.addressError?.error || !toIsLoopringAddress ? (
              <Typography
                color={"var(--color-error)"}
                variant={"body2"}
                marginTop={1 / 2}
                alignSelf={"stretch"}
                position={"relative"}
              >
                {t("labelAddressNotLoopring")}
              </Typography>
            ) : tradeData.toAddress &&
              realToAddress &&
              !toIsAddressCheckLoading ? (
              <Typography
                color={"var(--color-text-primary)"}
                variant={"body2"}
                marginTop={1 / 2}
                style={{ wordBreak: "break-all" }}
              >
                {realToAddress}
              </Typography>
            ) : (
              <></>
            )}
          </Box>
        </Grid>
      ) : (
        <></>
      )}

      <Grid item marginTop={2} alignSelf={"stretch"}>
        {tradeData.belong === "ETH" && (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelIsETHDepositAlert")}
          </Typography>
        )}
        {isNewAlert}
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onDepositClick(tradeData);
          }}
          loading={
            !getDisabled && depositBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || depositBtnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`depositLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
