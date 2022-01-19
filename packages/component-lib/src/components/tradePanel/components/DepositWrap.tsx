import { CloseIcon, globalSetup, IBData } from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { WithTranslation } from "react-i18next";
import React, { ChangeEvent } from "react";
import { Grid, Typography } from "@mui/material";
import { Button, IconClearStyled, TextField } from "../../../index";
import { DepositViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import * as _ from "lodash";
import { NFTWholeINFO } from "@loopring-web/common-resources";

//SelectReceiveCoin
export const DepositWrap = <T extends IBData<I> & Partial<NFTWholeINFO>, I>({
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
  handleOnAddressChange,
  handleAddressError,
  wait = globalSetup.wait,
  allowTrade,
  ...rest
}: DepositViewProps<T, I> & WithTranslation) => {
  const inputBtnRef = React.useRef();

  const getDisabled = React.useMemo(() => {
    if (
      disabled ||
      tradeData === undefined ||
      walletMap === undefined ||
      coinMap === undefined ||
      depositBtnStatus === TradeBtnStatus.DISABLED
    ) {
      return true;
    } else {
      if (isNewAccount && chargeFeeTokenList) {
        const index = chargeFeeTokenList?.findIndex(
          ({ belong }) => belong === tradeData.belong
        );
        if (index === -1) {
          return true;
        }
      }
      return false;
    }
  }, [
    chargeFeeTokenList,
    coinMap,
    depositBtnStatus,
    disabled,
    isNewAccount,
    tradeData,
    walletMap,
  ]);
  const [address, setAddress] = React.useState<string | undefined>(
    addressDefault || ""
  );
  const [addressError, setAddressError] = React.useState<
    | { error: boolean; message?: string | React.ElementType<HTMLElement> }
    | undefined
  >();

  const debounceAddress = _.debounce(({ address }: any) => {
    if (handleOnAddressChange) {
      handleOnAddressChange(address);
    }
  }, wait);
  const handleClear = React.useCallback(() => {
    // @ts-ignore
    setAddress("");
  }, []);
  const _handleOnAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    if (handleAddressError) {
      const error = handleAddressError(address);
      if (error?.error) {
        setAddressError(error);
      }
    }
    setAddress(address);
    debounceAddress({ address });
  };

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
      } else if (chargeFeeTokenList[index].fee > (tradeData.tradeValue ?? 0)) {
        return (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
          >
            {t("labelIsNotEnoughFeeToken", {
              symbol: tradeData.belong,
              fee: chargeFeeTokenList[index].fee,
            })}
          </Typography>
        );
      } else {
        return <></>;
      }
    } else if (isNewAccount) {
      return (
        <Typography
          color={"var(--color-warning)"}
          component={"p"}
          variant={"body1"}
          marginBottom={1}
        >
          {t("labelIsNotFeeToken")}
        </Typography>
      );
    } else {
      return <></>;
    }
  }, [
    isNewAccount,
    chargeFeeTokenList,
    tradeData.belong,
    tradeData.tradeValue,
  ]);

  return (
    <Grid
      className={walletMap ? "depositWrap" : "depositWrap loading"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
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
            walletMap,
            tradeData,
            coinMap,
            inputButtonDefaultProps,
            inputBtnRef: inputBtnRef,
          }}
        />
      </Grid>
      {isNewAccount ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <TextField
            value={address}
            error={addressError && addressError.error ? true : false}
            label={t("depositLabelRefer")}
            placeholder={t("depositLabelPlaceholder")}
            onChange={_handleOnAddressChange}
            helperText={
              <Typography variant={"body2"} component={"span"}>
                {addressError && addressError.error ? addressError.message : ""}
              </Typography>
            }
            fullWidth={true}
          />
          {address !== "" ? (
            <IconClearStyled
              color={"inherit"}
              size={"small"}
              style={{ top: "28px" }}
              aria-label="Clear"
              onClick={handleClear}
            >
              <CloseIcon />
            </IconClearStyled>
          ) : (
            ""
          )}
        </Grid>
      ) : (
        <></>
      )}
      <Grid item marginTop={2} alignSelf={"stretch"}>
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
          disabled={
            getDisabled || depositBtnStatus === TradeBtnStatus.LOADING
              ? true
              : false
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`depositLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
