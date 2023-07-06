import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  AddressError,
  AlertIcon,
  CheckBoxIcon,
  CheckedIcon,
  CloseIcon,
  ContactIcon,
  copyToClipBoard,
  DropDownIcon,
  EmptyValueTag,
  EXCHANGE_TYPE,
  FeeInfo,
  globalSetup,
  IBData,
  Info2Icon,
  LoadingIcon,
  myLog,
  NFTWholeINFO,
  TOAST_TIME,
  TradeBtnStatus,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import {
  Button,
  DropdownIconStyled,
  FeeTokenItemWrapper,
  TextField,
  Toast,
  ToastType,
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
  // @ts-ignore
  coinMap,
  transferI18nKey,
  type,
  memo,
  chargeFeeTokenList,
  activeAccountPrice,
  feeInfo,
  lastFailed,
  isFeeNotEnough,
  handleSureItsLayer2,
  handleFeeChange,
  isThumb,
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
  isSmartContractAddress,
  baseURL,
  isActiveAccount,
  isActiveAccountFee,
  feeWithActive,
  handleOnFeeWithActive,
  contact,
  isFromContact,
  onClickContact,
  loopringSmartWalletVersion,
  // addressType,
  ...rest
}: TransferViewProps<T, I, C> &
  WithTranslation & {
    assetsData: any[];
    handleConfirm: (index: number) => void;
  }) => {
  contact;
  const inputBtnRef = React.useRef();
  const { isMobile } = useSettings();
  // addressType

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
    [AddressError.InvalidAddr, AddressError.IsNotLoopringContract].includes(
      addrStatus
    );
  const detectedWalletType =
    loopringSmartWalletVersion === undefined
      ? undefined
      : loopringSmartWalletVersion.isLoopringSmartWallet
      ? WALLET_TYPE.Loopring
      : isSmartContractAddress
      ? WALLET_TYPE.OtherSmart
      : WALLET_TYPE.EOA;

  const isExchange = React.useMemo(() => {
    return !!(sureItsLayer2 && sureItsLayer2 in EXCHANGE_TYPE);
  }, [sureItsLayer2, sureItsLayer2]);

  const isOtherSmartWallet = detectedWalletType === WALLET_TYPE.OtherSmart;
  myLog("transferWrap", realAddr);
  const view = React.useMemo(() => {
    if (isOtherSmartWallet) {
      return (
        <Typography
          color={"var(--color-error)"}
          variant={"body2"}
          marginTop={1 / 4}
          alignSelf={"stretch"}
          position={"relative"}
        >
          {t("labelNotOtherSmartWallet")}
        </Typography>
      );
    } else if (isInvalidAddressOrENS) {
      return (
        <Typography
          color={"var(--color-error)"}
          variant={"body2"}
          marginTop={1 / 4}
          alignSelf={"stretch"}
          position={"relative"}
        >
          {t(`labelL2toL2${addrStatus}`)}
        </Typography>
      );
    } else if (isExchange) {
      return (
        <Typography
          color={"var(--color-error)"}
          variant={"body2"}
          marginTop={1 / 4}
          alignSelf={"stretch"}
          position={"relative"}
        >
          {t("labelNotExchangeEOA")}
        </Typography>
      );
    } else if (isSameAddress) {
      return (
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
      );
    } else {
      return (
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
            isActiveAccount === false && (
              <Box>
                {(isActiveAccount === false) && realAddr && (
                  <Typography
                    color={"var(--color-error)"}
                    lineHeight={1.2}
                    variant={"body2"}
                    marginTop={1 / 2}
                    marginLeft={"-2px"}
                    display={"inline-flex"}
                  >
                    <Trans i18nKey={"labelL2toL2AddressNotLoopring"}>
                      <AlertIcon
                        color={"inherit"}
                        fontSize={"medium"}
                        sx={{ marginRight: 1 }}
                      />
                      This address does not have an activated Loopring L2.
                      Please ensure the recipient can access Loopring L2 before
                      sending.
                    </Trans>
                  </Typography>
                )}
                {!isActiveAccountFee && realAddr ? (
                  <MuiFormControlLabel
                    sx={{
                      alignItems: "flex-start",
                      marginTop: 1 / 2,
                    }}
                    control={
                      <Checkbox
                        checked={feeWithActive}
                        onChange={(_event: any, state: boolean) => {
                          handleOnFeeWithActive(state);
                        }}
                        checkedIcon={<CheckedIcon />}
                        icon={<CheckBoxIcon />}
                        color="default"
                      />
                    }
                    label={
                      <Typography
                        whiteSpace={"pre-line"}
                        component={"span"}
                        variant={"body1"}
                        display={"block"}
                        color={"textSecondary"}
                        paddingTop={1 / 2}
                      >
                        {t("labelL2toL2AddressFeeActiveFee", {
                          value: activeAccountPrice,
                        })}
                      </Typography>
                    }
                  />
                ) : (
                  <></>
                )}
              </Box>
            )}
        </>
      );
    }
  }, [
    addressDefault,
    isActiveAccount,
    isActiveAccountFee,
    feeWithActive,
    addrStatus,
    realAddr,
    isAddressCheckLoading,
    activeAccountPrice,
    isInvalidAddressOrENS,
    isExchange,
    isOtherSmartWallet,
    isSameAddress,
    isLoopringAddress,
    isAddressCheckLoading
  ]);

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
          <Info2Icon
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
            {...({
              ...rest,
              isThumb,
              type,
              onCopy,
              t,
              baseURL: baseURL ?? "",
              getIPFSString: rest.getIPFSString ?? (() => "" as any),
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputNFTDefaultProps: { label: "" },
              inputNFTRef: inputBtnRef,
            } as any)}
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
          InputProps={{
            style: {
              paddingRight: "0",
            },
            endAdornment: isFromContact ? undefined : (
              <InputAdornment
                style={{
                  cursor: "pointer",
                  paddingRight: "0",
                }}
                position="end"
              >
                {addressDefault !== "" ? (
                  isAddressCheckLoading ? (
                    <LoadingIcon width={24} />
                  ) : (
                    <IconButton
                      color={"inherit"}
                      size={"small"}
                      aria-label="Clear"
                      onClick={() => handleOnAddressChange("")}
                    >
                      <CloseIcon />
                    </IconButton>
                  )
                ) : (
                  ""
                )}
                <IconButton
                  color={"inherit"}
                  size={"large"}
                  aria-label="Clear"
                  onClick={() => {
                    onClickContact!();
                  }}
                >
                  <ContactIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box marginLeft={1 / 2}>{view}</Box>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <TransferAddressType
          detectedWalletType={detectedWalletType!}
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
                  : EmptyValueTag + " " + feeInfo?.belong ?? EmptyValueTag}
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
        {lastFailed && (
          <Typography
            paddingBottom={1}
            textAlign={"center"}
            color={"var(--color-warning)"}
          >
            {t("labelConfirmAgainByFailedWithBalance", {
              symbol:
                type === "NFT"
                  ? "NFT"
                  : ` ${tradeData?.belong}` ?? EmptyValueTag,
              count: tradeData?.balance,
            })}
          </Typography>
        )}
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
          disabled={
            getDisabled ||
            transferBtnStatus === TradeBtnStatus.LOADING ||
            isExchange ||
            isOtherSmartWallet
          }
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
        severity={ToastType.success}
      />
    </Grid>
  );
};
