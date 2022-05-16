import {
  Bridge,
  CloseIcon,
  globalSetup,
  IBData,
  LoadingIcon,
  SoursURL,
  AddressError,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import {
  Button,
  DepositTitle,
  IconClearStyled,
  TextField,
  useSettings,
} from "../../../index";
import { DepositViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";

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
  isAllowInputToAddress,
  toIsAddressCheckLoading,
  // toIsLoopringAddress,
  realToAddress,
  referIsAddressCheckLoading,
  referIsLoopringAddress,
  realReferAddress,
  isToAddressEditable,
  toAddressStatus,
  referStatus,
  wait = globalSetup.wait,
  allowTrade,
  ...rest
}: DepositViewProps<T, I> & WithTranslation) => {
  const inputBtnRef = React.useRef();
  let { feeChargeOrder, isMobile } = useSettings();

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
      paddingTop={isMobile ? 1 : "0"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
      minWidth={"220px"}
    >
      <DepositTitle title={title ? t(title) : undefined} />
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
      {!isAllowInputToAddress && isNewAccount ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <TextField
            className={"text-address"}
            value={tradeData.referAddress ? tradeData.referAddress : ""}
            error={
              (!!tradeData.referAddress &&
                referStatus !== AddressError.NoError) ||
              !referIsLoopringAddress
            }
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
            {referStatus !== AddressError.NoError || !referIsLoopringAddress ? (
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
      {isAllowInputToAddress ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <Box display={isToAddressEditable ? "inherit" : "none"}>
            <TextField
              className={"text-address"}
              value={tradeData.toAddress ? tradeData.toAddress : ""}
              error={toAddressStatus !== AddressError.NoError}
              label={t("depositLabelTo")}
              disabled={!isToAddressEditable}
              placeholder={t("depositLabelPlaceholder")}
              onChange={(_event) => {
                const toAddress = _event.target.value;
                //...tradeData,
                onChangeEvent(0, {
                  tradeData: { toAddress } as T,
                  to: "button",
                });
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
                isToAddressEditable && (
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
              )
            ) : (
              ""
            )}
            <Box marginLeft={1 / 2}>
              {toAddressStatus !== AddressError.NoError ? (
                <Typography
                  color={"var(--color-error)"}
                  variant={"body2"}
                  marginTop={1 / 2}
                  alignSelf={"stretch"}
                  position={"relative"}
                >
                  {t("labelInvalidAddress")}
                </Typography>
              ) : tradeData.toAddress &&
                realToAddress &&
                !toIsAddressCheckLoading ? (
                <Typography
                  color={"var(--color-text-primary)"}
                  variant={"body2"}
                  marginTop={1 / 2}
                  style={{ wordBreak: "break-all" }}
                  whiteSpace={"pre-line"}
                >
                  {realToAddress}
                </Typography>
              ) : (
                <></>
              )}
            </Box>
          </Box>
          {!isToAddressEditable && (
            <>
              <Typography color={"var(--color-text-third)"} variant={"body1"}>
                {t("labelBridgeSendTo")}
              </Typography>
              <Box>
                <Typography
                  display={"inline-flex"}
                  variant={
                    tradeData.toAddress?.startsWith("0x") ? "body2" : "body1"
                  }
                  style={{ wordBreak: "break-all" }}
                  color={"textSecondary"}
                >
                  {tradeData.toAddress}
                </Typography>
              </Box>
              {toIsAddressCheckLoading ? (
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <img
                    className="loading-gif"
                    alt={"loading"}
                    width="36"
                    src={`${SoursURL}images/loading-line.gif`}
                  />
                </Box>
              ) : realToAddress ? (
                <>
                  <Box>
                    <Typography color={"var(--color-text-third)"} minWidth={40}>
                      {t("labelReceiveAddress")}
                    </Typography>
                    <Typography
                      display={"inline-flex"}
                      variant={"body2"}
                      style={{ wordBreak: "break-all" }}
                      whiteSpace={"pre-line"}
                      color={"textSecondary"}
                    >
                      {realToAddress}
                    </Typography>
                  </Box>
                </>
              ) : (
                !!tradeData.toAddress &&
                toAddressStatus !== AddressError.NoError && (
                  <Typography variant={"body1"} color={"var(--color-warning)"}>
                    {/*This is wrong address, I want input address*/}
                    {toAddressStatus === AddressError.ENSResolveFailed ? (
                      <>{t("labelENSShouldConnect")}</>
                    ) : (
                      <Trans
                        i18nKey={"labelInvalidAddressClick"}
                        tOptions={{
                          way: "Pay Loopring L2",
                          token: "ERC20 ",
                        }}
                      >
                        Invalid Wallet Address, Pay Loopring L2 of ERC20 is
                        disabled!
                        <Link
                          alignItems={"center"}
                          display={"inline-flex"}
                          href={Bridge}
                          target={"_blank"}
                          rel={"noopener noreferrer"}
                          color={"textSecondary"}
                        >
                          Click to input another receive address
                        </Link>
                        ,
                      </Trans>
                    )}
                  </Typography>
                )
              )}
            </>
          )}
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
