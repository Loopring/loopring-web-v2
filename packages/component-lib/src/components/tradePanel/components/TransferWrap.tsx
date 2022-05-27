import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  CloseIcon,
  copyToClipBoard,
  DropDownIcon,
  globalSetup,
  HelpIcon,
  IBData,
  NFTWholeINFO,
  TOAST_TIME,
  LoadingIcon,
  EmptyValueTag,
  FeeInfo,
  AddressError,
} from "@loopring-web/common-resources";
import {
  Button,
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IconClearStyled,
  TextField,
  Toast,
  TradeBtnStatus,
} from "../../index";
import { PopoverPure } from "../../";
import { TransferViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { NFTInput } from "./BasicANFTTrade";
import { FeeToggle } from "./tool/FeeList";
import { useSettings } from "../../../stores";
import { TransferAddressType } from "./AddressType";

export const TransferWrap = <
  T extends IBData<I> & Partial<NFTWholeINFO>,
  I,
  C extends FeeInfo
>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  transferI18nKey,
  type,
  memo,
  chargeFeeTokenList,
  feeInfo,
  isFeeNotEnough,
  onTransferClick,
  handleSureItsLayer2,
  handleFeeChange,
  isThumb,
  // isConfirmTransfer,
  transferBtnStatus,
  addressDefault,
  handleOnAddressChange,
  sureItsLayer2,
  wait = globalSetup.wait,
  assetsData = [],
  realAddr,
  isLoopringAddress,
  addrStatus,
  handleConfirm,
  handleOnMemoChange,
  isAddressCheckLoading,
  isSameAddress,
  ...rest
}: TransferViewProps<T, I, C> &
  WithTranslation & {
    assetsData: any[];
    handleConfirm: (index: number) => void;
  }) => {
  const inputBtnRef = React.useRef();
  const { isMobile } = useSettings();

  const inputButtonDefaultProps = {
    label: t("labelL2toL2EnterToken"),
  };

  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-transfer`,
  });

  const getDisabled = React.useMemo(() => {
    return disabled || transferBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, transferBtnStatus]);

  const [copyToastOpen, setCopyToastOpen] = React.useState(false);
  const onCopy = React.useCallback(
    async (content: string) => {
      await copyToClipBoard(content);
      setCopyToastOpen(true);
    },
    [setCopyToastOpen]
  );
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  const isInvalidAddressOrENS =
    !isAddressCheckLoading &&
    addressDefault &&
    addrStatus === AddressError.InvalidAddr;

  return (
    <Grid
      className={walletMap ? "transfer-wrap" : "loading"}
      container
      paddingLeft={isMobile ? 2 : 5 / 2}
      paddingRight={isMobile ? 2 : 5 / 2}
      direction={"column"}
      alignItems={"stretch"}
      flex={1}
      height={"100%"}
      minWidth={240}
      spacing={2}
      flexWrap={"nowrap"}
    >
      <Grid item>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            {t("labelL2toL2Title")}
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
            maxWidth={450}
            variant={"body1"}
            whiteSpace={"pre-line"}
          >
            <Trans i18nKey="transferDescription">
              Transfer to any valid Ethereum addresses instantly. Please make
              sure the recipient address accepts Loopring layer-2 payments
              before you proceed.
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        {type === "NFT" ? (
          <NFTInput
            {...{
              ...rest,
              isThumb,
              type,
              onCopy,
              t,
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputNFTDefaultProps: { label: "" },
              inputNFTRef: inputBtnRef,
            }}
          />
        ) : (
          <BasicACoinTrade
            {...{
              ...rest,
              type,
              t,
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputButtonDefaultProps,
              inputBtnRef: inputBtnRef,
            }}
          />
        )}
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <TextField
          className={"text-address"}
          value={addressDefault}
          error={!!(isInvalidAddressOrENS || isSameAddress)}
          label={t("labelL2toL2Address")}
          placeholder={t("labelL2toL2AddressInput")}
          onChange={(event) => handleOnAddressChange(event?.target?.value)}
          disabled={!chargeFeeTokenList.length}
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
        <Box marginLeft={1 / 2}>
          {isInvalidAddressOrENS ? (
            <Typography
              color={"var(--color-error)"}
              variant={"body2"}
              marginTop={1 / 4}
              alignSelf={"stretch"}
              position={"relative"}
            >
              {t("labelL2toL2InvalidAddress")}
            </Typography>
          ) : isSameAddress ? (
            <Typography
              color={"var(--color-error)"}
              variant={"body2"}
              marginTop={1 / 4}
              alignSelf={"stretch"}
              position={"relative"}
            >
              {t("labelInvalidisSameAddress", {
                way: t("labelL2toL2"),
              })}
            </Typography>
          ) : (
            <>
              {addressDefault && realAddr && !isAddressCheckLoading && (
                <Typography
                  color={"var(--color-text-primary)"}
                  variant={"body2"}
                  marginTop={1 / 4}
                  whiteSpace={"pre-line"}
                  style={{ wordBreak: "break-all" }}
                >
                  {realAddr}
                </Typography>
              )}
              {!isAddressCheckLoading &&
                addressDefault &&
                addrStatus === AddressError.NoError &&
                !isLoopringAddress && (
                  <Typography
                    color={"var(--color-error)"}
                    lineHeight={1}
                    variant={"body2"}
                    marginTop={1 / 4}
                  >
                    {t("labelL2toL2AddressNotLoopring")}
                  </Typography>
                )}
            </>
          )}
        </Box>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <TransferAddressType
          selectedValue={sureItsLayer2}
          handleSelected={handleSureItsLayer2}
          disabled={
            isSameAddress ||
            isAddressCheckLoading ||
            addrStatus !== AddressError.NoError ||
            !realAddr
          }
        />
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <TextField
          value={memo}
          // error={addressError && addressError.error ? true : false}
          label={t("labelL2toL2Memo")}
          placeholder={t("labelL2toL2MemoPlaceholder")}
          onChange={handleOnMemoChange}
          fullWidth={true}
        />
      </Grid>

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
                <Typography
                  marginLeft={1}
                  component={"span"}
                  color={"var(--color-error)"}
                >
                  {isFeeNotEnough && t("labelL2toL2FeeNotEnough")}
                </Typography>
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
          }}
          loading={
            !getDisabled && transferBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || transferBtnStatus === TradeBtnStatus.LOADING}
        >
          {t(transferI18nKey ?? `labelL2toL2Btn`)}
        </Button>
      </Grid>

      <Toast
        alertText={t("labelCopyAddClip")}
        open={copyToastOpen}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setCopyToastOpen(false);
        }}
        severity={"success"}
      />
    </Grid>
  );
};
