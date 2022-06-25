import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { Box, Grid, Typography } from "@mui/material";
import {
  CloseIcon,
  DropDownIcon,
  EmptyValueTag,
  FeeInfo,
  globalSetup,
  HelpIcon,
  IBData,
  LoadingIcon,
  AssetsRawDataItem,
  myLog,
} from "@loopring-web/common-resources";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  ForceWithdrawViewProps,
  InputButtonDefaultProps,
  PopoverPure,
} from "../..";
import { TradeBtnStatus } from "../Interface";
import {
  Button,
  IconClearStyled,
  TextField,
  useSettings,
} from "../../../index";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { FeeToggle } from "./tool/FeeList";

// const LinkStyle = styled(Link)`
//   text-decoration: underline dotted;
//   cursor: pointer;
//   color: var(--color-text-secondary);
//   font-size: ${({ theme }) => theme.fontDefault.body2};
//   &:hover {
//     color: var(--color-primary);
//   }
// `;
export const ForceWithdrawWrap = <T extends IBData<I>, I, C extends FeeInfo>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  withdrawI18nKey,
  addressDefault,
  isNotAvaiableAddress,
  chargeFeeTokenList = [],
  feeInfo,
  handleConfirm,
  isFeeNotEnough,
  onWithdrawClick,
  withdrawBtnStatus,
  handleFeeChange,
  handleOnAddressChange,
  isAddressCheckLoading,
  addrStatus,
  realAddr,
  wait = globalSetup.wait,
  assetsData = [],
  ...rest
}: ForceWithdrawViewProps<T, I, C> &
  WithTranslation & {
    assetsData: AssetsRawDataItem[];
    handleConfirm: (index: number) => void;
  }) => {
  const { isMobile } = useSettings();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-withdraw`,
  });

  const inputBtnRef = React.useRef();

  const getDisabled = React.useMemo(() => {
    return disabled || withdrawBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, withdrawBtnStatus]);
  const inputButtonDefaultProps: InputButtonDefaultProps<T, I> = {
    label: t("labelForceWithdrawEnterToken"),
    disableInputValue: true,
    maxAllow: false,
    subLabel: "",
  };

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  myLog("walletMap", walletMap);
  // @ts-ignore
  return (
    <Grid
      className={walletMap ? "" : "loading"}
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={"column"} /* minHeight={540} */
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      minWidth={240}
      height={"100%"}
      flexWrap={"nowrap"}
      spacing={2}
    >
      <Grid item>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"} /* marginBottom={2} */
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            {t("labelForceWithdrawTitle")}
          </Typography>
          <HelpIcon
            {...bindHover(popupState)}
            fontSize={"large"}
            htmlColor={"var(--color-text-third)"}
          />
        </Box>
        <PopoverPure
          className={"arrow-center"}
          {...bindPopper(popupState)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Typography
            padding={2}
            maxWidth={490}
            variant={"body2"}
            whiteSpace={"pre-line"}
          >
            <Trans i18nKey="withdrawDescription">
              Your withdrawal will be processed in the next batch, which usually
              takes 30 minutes to 2 hours. (There will be a large delay if the
              Ethereum gas price exceeds 500 GWei.）
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>
      <Grid item alignSelf={"stretch"} position={"relative"}>
        <>
          <TextField
            className={"text-address"}
            value={addressDefault}
            error={!!isNotAvaiableAddress}
            placeholder={t("labelPleaseInputAddress")}
            onChange={(event) => handleOnAddressChange(event?.target?.value)}
            label={t("labelL2toL1Address")}
            SelectProps={{ IconComponent: DropDownIcon }}
            fullWidth={true}
          />

          {addressDefault !== "" ? (
            isAddressCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: 48, right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: 46 }}
                aria-label="Clear"
                onClick={() => handleOnAddressChange("")}
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
        </>
      </Grid>

      {!isAddressCheckLoading && !isNotAvaiableAddress && (
        <Grid item alignSelf={"stretch"} position={"relative"}>
          {
            // @ts-ignore
            <BasicACoinTrade
              {...{
                ...rest,
                type: "TOKEN",
                t,
                disabled: !Object.keys(walletMap).length,
                walletMap,
                tradeData: {
                  ...tradeData,
                  tradeValue: tradeData.balance,
                },
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
              }}
            />
          }
        </Grid>
      )}

      <Grid item alignSelf={"stretch"} position={"relative"}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t("labelFeeCalculating")}</Typography>
        ) : (
          <>
            <Typography
              component={"span"}
              display={"flex"}
              flexWrap={"wrap"}
              alignItems={"center"}
              variant={"body1"}
              color={"var(--color-text-secondary)"}
              marginBottom={1}
            >
              <Typography component={"span"} color={"inherit"} minWidth={28}>
                {t("labelL2toL2Fee")}：
              </Typography>
              <Box
                component={"span"}
                display={"flex"}
                alignItems={"center"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setDropdownStatus((prev) => (prev === "up" ? "down" : "up"))
                }
              >
                {feeInfo && feeInfo.belong && feeInfo.fee
                  ? feeInfo.fee + " " + feeInfo.belong
                  : EmptyValueTag + " " + feeInfo?.belong}
                <DropdownIconStyled
                  status={dropdownStatus}
                  fontSize={"medium"}
                />
                {isFeeNotEnough.isOnLoading ? (
                  <Typography
                    color={"var(--color-warning)"}
                    marginLeft={1}
                    component={"span"}
                  >
                    {t("labelFeeCalculating")}
                  </Typography>
                ) : (
                  isFeeNotEnough.isFeeNotEnough && (
                    <Typography
                      marginLeft={1}
                      component={"span"}
                      color={"var(--color-error)"}
                    >
                      {t("labelL2toL2FeeNotEnough")}
                    </Typography>
                  )
                )}
              </Box>
            </Typography>
            {dropdownStatus === "up" && (
              <FeeTokenItemWrapper padding={2}>
                <Typography
                  variant={"body2"}
                  color={"var(--color-text-third)"}
                  marginBottom={1}
                >
                  {t("labelL2toL2FeeChoose")}
                </Typography>
                <FeeToggle
                  chargeFeeTokenList={chargeFeeTokenList}
                  handleToggleChange={handleToggleChange}
                  feeInfo={feeInfo}
                />
              </FeeTokenItemWrapper>
            )}
          </>
        )}
      </Grid>

      <Grid item alignSelf={"stretch"} paddingBottom={0}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            handleConfirm(0);
            // onWithdrawClick(tradeData);
          }}
          loading={
            withdrawBtnStatus === TradeBtnStatus.LOADING && !getDisabled
              ? "true"
              : "false"
          }
          disabled={getDisabled || withdrawBtnStatus === TradeBtnStatus.LOADING}
        >
          {t(withdrawI18nKey ?? "labelWithdrawBtn")}
        </Button>
      </Grid>
    </Grid>
  );
};
