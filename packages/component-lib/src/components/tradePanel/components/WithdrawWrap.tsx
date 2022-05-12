import { Trans, WithTranslation } from "react-i18next";
import React, { ChangeEvent, useState } from "react";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  Box,
  FormControlLabel,
  Grid,
  Link,
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
  myLog,
  NFTWholeINFO,
  TOAST_TIME,
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
import { AddressError, WithdrawViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { NFTInput } from "./BasicANFTTrade";
import { FeeToggle } from "./tool/FeeList";
import styled from "@emotion/styled";

const LinkStyle = styled(Link)`
  text-decoration: underline dotted;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: ${({ theme }) => theme.fontDefault.body2};
  &:hover {
    color: var(--color-primary);
  }
`;
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
  ...rest
}: WithdrawViewProps<T, I, C> & WithTranslation & { assetsData: any[] }) => {
  // const [_withdrawType, setWithdrawType] = React.useState(withdrawType);
  const [address, setAddress] = React.useState<string | undefined>(
    addressDefault ?? ""
  );
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
  myLog("withdraw accAddr", accAddr, withdrawType);

  const getDisabled = React.useMemo(() => {
    return disabled || withdrawBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, withdrawBtnStatus]);
  myLog("withdrawWrap", getDisabled);
  const inputButtonDefaultProps = {
    label: t("withdrawLabelEnterToken"),
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

  const _handleOnAddressChange = (
    event: ChangeEvent<HTMLInputElement>,
    _myAddress?: string
  ) => {
    let address: string;

    if (_myAddress) {
      address = _myAddress;
    } else {
      address = event.target?.value ?? "";
    }

    setAddress(address);
    if (handleOnAddressChange) {
      handleOnAddressChange(address);
    }
  };

  const isInvalidAddressOrENS =
    !isAddressCheckLoading &&
    address &&
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
    >
      <Grid item>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"} /* marginBottom={2} */
        >
          <Typography component={"h4"} variant={"h3"} marginRight={1}>
            {(tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
            (tradeData as NFTWholeINFO)?.deploymentStatus === "NOT_DEPLOYED"
              ? t("withdrawDeployTitle")
              : t("withdrawTitle")}
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
      <Grid item /* marginTop={3} */ alignSelf={"stretch"}>
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

      <Grid item alignSelf={"stretch"} position={"relative"} marginTop={2}>
        <>
          <Typography
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            marginBottom={1}
          >
            <span> {t("withdrawLabelAddress")}</span>
            {accAddr && (
              <LinkStyle
                onClick={(e) => {
                  _handleOnAddressChange(e as any, accAddr);
                }}
              >
                {t("labelWithdrawMyAddress")}
              </LinkStyle>
            )}
          </Typography>
          <TextField
            className={"text-address"}
            value={address}
            error={!!(isNotAvaiableAddress || isInvalidAddressOrENS)}
            placeholder={t("labelPleaseInputWalletAddress")}
            onChange={_handleOnAddressChange}
            // disabled={chargeFeeTokenList.length ? false : true}
            SelectProps={{ IconComponent: DropDownIcon }}
            fullWidth={true}
          />
          {address !== "" ? (
            isAddressCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: "36px", right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: "35px" }}
                aria-label="Clear"
                onClick={(e) => {
                  _handleOnAddressChange(e as any, "");
                }}
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
                  way: t(`labelWithdraw`),
                })}
              </Typography>
            ) : (
              <>
                {address && realAddr && !isAddressCheckLoading && (
                  <Typography
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    marginTop={1 / 4}
                  >
                    {realAddr}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </>
      </Grid>

      <Grid item /* marginTop={2} */ alignSelf={"stretch"} marginTop={2}>
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
                {t("transferLabelFee")}：
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
                  {t(`withdrawLabel${withdrawTypes[withdrawType]}`)}
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
                  {isFeeNotEnough && t("transferLabelFeeNotEnough")}
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
                  {t("transferLabelFeeChoose")}
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
      <Grid
        item
        /* marginTop={2} */ alignSelf={"stretch"}
        marginTop={2}
        paddingBottom={isMobile ? 0 : 5 / 2}
      >
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onWithdrawClick(tradeData);
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
              ? `withdrawDeployLabelBtn`
              : `withdrawLabelBtn`
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
