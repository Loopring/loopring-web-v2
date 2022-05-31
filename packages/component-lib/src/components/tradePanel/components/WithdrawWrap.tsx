import { Trans, WithTranslation } from "react-i18next";
import React, { ChangeEvent, useState } from "react";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  Box,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import {
  CloseIcon,
  copyToClipBoard,
  DropDownIcon,
  EmptyValueTag,
  FeeInfo,
  globalSetup,
  HelpIcon,
  IBData,
  LoadingIcon,
  NFTWholeINFO,
  TOAST_TIME,
  AddressError,
  AssetsRawDataItem,
} from "@loopring-web/common-resources";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  PopoverPure,
  Toast,
} from "../..";
import { TradeBtnStatus } from "../Interface";
import {
  Button,
  IconClearStyled,
  TextField,
  useSettings,
} from "../../../index";
import { WithdrawViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { NFTInput } from "./BasicANFTTrade";
import { FeeToggle } from "./tool/FeeList";
import { WithdrawAddressType } from "./AddressType";

// const LinkStyle = styled(Link)`
//   text-decoration: underline dotted;
//   cursor: pointer;
//   color: var(--color-text-secondary);
//   font-size: ${({ theme }) => theme.fontDefault.body2};
//   &:hover {
//     color: var(--color-primary);
//   }
// `;
export const WithdrawWrap = <
  T extends IBData<I> | (NFTWholeINFO & IBData<I>),
  I,
  C extends FeeInfo
>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  type,
  withdrawI18nKey,
  addressDefault,
  accAddr,
  isNotAvaiableAddress,
  withdrawTypes,
  withdrawType,
  chargeFeeTokenList = [],
  feeInfo,
  handleConfirm,
  isFeeNotEnough,
  onWithdrawClick,
  withdrawBtnStatus,
  handleFeeChange,
  handleWithdrawTypeChange,
  handleOnAddressChange,
  isAddressCheckLoading,
  isCFAddress,
  isContractAddress,
  addrStatus,
  disableWithdrawList = [],
  wait = globalSetup.wait,
  assetsData = [],
  realAddr,
  isThumb,
  isToMyself = false,
  sureIsAllowAddress,
  handleSureIsAllowAddress,
  ...rest
}: WithdrawViewProps<T, I, C> &
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

  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const onCopy = React.useCallback(
    async (content: string) => {
      copyToClipBoard(content);
      setCopyToastOpen(true);
    },
    [setCopyToastOpen]
  );

  const inputBtnRef = React.useRef();

  const getDisabled = React.useMemo(() => {
    return disabled || withdrawBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, withdrawBtnStatus]);
  const inputButtonDefaultProps = {
    label: t("labelL2toL1EnterToken"),
  };

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };

  const _handleWithdrawTypeChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (handleWithdrawTypeChange) {
        handleWithdrawTypeChange(e.target?.value as any);
      }
    },
    [handleWithdrawTypeChange]
  );

  const isInvalidAddressOrENS =
    !isAddressCheckLoading &&
    addressDefault &&
    addrStatus === AddressError.InvalidAddr;

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
            {(tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
            (tradeData as NFTWholeINFO)?.deploymentStatus === "NOT_DEPLOYED"
              ? t("labelL2ToL1DeployTitle")
              : isToMyself
              ? t("labelL2ToMyL1Title")
              : t("labelL2ToOtherL1Title")}
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
        {!isToMyself ? (
          <>
            <TextField
              className={"text-address"}
              value={addressDefault}
              error={!!(isNotAvaiableAddress || isInvalidAddressOrENS)}
              placeholder={t("labelPleaseInputWalletAddress")}
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
        ) : (
          <Typography
            variant={"body2"}
            lineHeight={"20px"}
            color={"var(--color-text-third)"}
          >
            {t("labelL2toL1MyAddress")}

            {!!isAddressCheckLoading && (
              <LoadingIcon
                width={24}
                style={{ top: 20, right: "8px", position: "absolute" }}
              />
            )}
          </Typography>
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
              {t("labelInvalidAddress")}
            </Typography>
          ) : isNotAvaiableAddress ? (
            <Typography
              color={"var(--color-error)"}
              variant={"body2"}
              marginTop={1 / 4}
              alignSelf={"stretch"}
              position={"relative"}
            >
              {t(`labelInvalid${isNotAvaiableAddress}`, {
                token: type === "NFT" ? "NFT" : tradeData.belong,
                way: t(`labelL2toL1`),
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
            </>
          )}
        </Box>
      </Grid>
      {!isToMyself && (
        <Grid item alignSelf={"stretch"} position={"relative"}>
          <WithdrawAddressType
            selectedValue={sureIsAllowAddress}
            handleSelected={handleSureIsAllowAddress}
            disabled={
              isAddressCheckLoading ||
              addrStatus !== AddressError.NoError ||
              !realAddr
            }
          />
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
                overflow={"hidden"}
                alignItems={"center"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setDropdownStatus((prev) => (prev === "up" ? "down" : "up"))
                }
              >
                {feeInfo && feeInfo.belong && feeInfo.fee
                  ? feeInfo.fee + " " + feeInfo.belong
                  : EmptyValueTag + " " + feeInfo?.belong}
                <Typography
                  marginLeft={1}
                  color={"var(--color-text-secondary)"}
                >
                  {t(`labelL2toL1${withdrawTypes[withdrawType]}`)}
                </Typography>
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
                <Box marginTop={1}>
                  <RadioGroup
                    aria-label="withdraw"
                    name="withdraw"
                    value={withdrawType.toString()}
                    onChange={(e) => {
                      _handleWithdrawTypeChange(e);
                    }}
                  >
                    {Object.keys(withdrawTypes).map((key) => {
                      return (
                        <FormControlLabel
                          key={key}
                          value={key.toString()}
                          control={<Radio />}
                          label={`${t(
                            "withdrawTypeLabel" + withdrawTypes[key]
                          )}`}
                        />
                      );
                    })}
                  </RadioGroup>
                </Box>
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
          {t(
            withdrawI18nKey ??
              ((tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
                (tradeData as NFTWholeINFO)?.deploymentStatus ===
                  "NOT_DEPLOYED")
              ? `labelSendL1DeployBtn`
              : `labelSendL1Btn`
          )}
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
