import { Trans, WithTranslation } from "react-i18next";
import React, { ChangeEvent, useState } from "react";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  Box,
  FormControlLabel,
  Grid,
  IconProps,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import {
  CloseIcon,
  copyToClipBoard,
  DropDownIcon,
  EmptyValueTag,
  globalSetup,
  HelpIcon,
  IBData,
  TOAST_TIME,
  WithdrawTypes,
} from "@loopring-web/common-resources";
import { PopoverPure, Toast } from "../..";
import { TradeBtnStatus } from "../Interface";
import { Button, IconClearStyled, TextField } from "../../../index";
import { WithdrawViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { ToggleButtonGroup } from "../../basic-lib";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import * as _ from "lodash";
import { NFTTokenInfo } from "@loopring-web/loopring-sdk";
import { NFTInput } from "./BasicANFTTrade";

const FeeTokenItemWrapper = styled(Box)`
  background-color: var(--color-global-bg);
`;

const DropdownIconStyled = styled(DropDownIcon)<IconProps>`
  transform: rotate(
    ${({ status }: any) => {
      return status === "down" ? "0deg" : "180deg";
    }}
  );
` as (props: IconProps & { status: string }) => JSX.Element;

export const WithdrawWrap = <
  T extends IBData<I> | (NFTTokenInfo & IBData<I>),
  I
>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  type,
  withdrawI18nKey,
  addressDefault,
  withdrawTypes = WithdrawTypes,
  withdrawType,
  chargeFeeToken = "ETH",
  chargeFeeTokenList,
  onWithdrawClick,
  withdrawBtnStatus,
  handleFeeChange,
  handleWithdrawTypeChange,
  handleOnAddressChange,
  handleAddressError,
  wait = globalSetup.wait,
  assetsData = [],
  realAddr,
  isThumb,

  ...rest
}: WithdrawViewProps<T, I> & WithTranslation & { assetsData: any[] }) => {
  const [_withdrawType, setWithdrawType] = React.useState<string | undefined>(
    withdrawType
  );
  const [address, setAddress] = React.useState<string | undefined>(
    addressDefault ? addressDefault : ""
  );
  const [addressError, setAddressError] = React.useState<
    | { error: boolean; message?: string | React.ElementType<HTMLElement> }
    | undefined
  >();
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false);
  const [feeToken, setFeeToken] = React.useState("");
  const [toggleData, setToggleData] = React.useState<any[]>([]);
  const { feeChargeOrder } = useSettings();

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-withdraw`,
  });

  React.useEffect(() => {
    if (!!chargeFeeTokenList.length && feeChargeOrder && assetsData) {
      const list = chargeFeeTokenList
        .sort(
          (a, b) =>
            feeChargeOrder.indexOf(a.belong) - feeChargeOrder.indexOf(b.belong)
        )
        .map(({ belong, fee, __raw__ }) => ({
          key: belong,
          value: belong,
          fee,
          __raw__,
        })) as any[];
      setToggleData(list);
      const currFee =
        list.find((o) => o.key === feeToken)?.fee || EmptyValueTag;
      const currFeeRaw =
        list.find((o) => o.key === feeToken)?.__raw__ || EmptyValueTag;
      handleFeeChange({
        belong: feeToken,
        fee: currFee,
        __raw__: currFeeRaw,
      });
    }
  }, [chargeFeeTokenList, feeChargeOrder, feeToken, handleFeeChange]);
  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const onCopy = React.useCallback(
    async (content: string) => {
      copyToClipBoard(content);
      setCopyToastOpen(true);
    },
    [setCopyToastOpen]
  );
  const getTokenFee = React.useCallback(
    (token: string) => {
      return toggleData.find((o) => o.key === token)?.fee || 0;
    },
    [toggleData]
  );

  const inputBtnRef = React.useRef();
  const getDisabled = () => {
    if (
      disabled ||
      tradeData === undefined ||
      walletMap === undefined ||
      coinMap === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };
  const inputButtonDefaultProps = {
    label: t("withdrawLabelEnterToken"),
  };

  React.useEffect(() => {
    if (!!chargeFeeTokenList.length && !feeToken && assetsData) {
      const defaultToken =
        chargeFeeTokenList.find(
          (o) =>
            assetsData.find((item) => item.name === o.belong)?.available > o.fee
        )?.belong || "ETH";
      setFeeToken(defaultToken);
      const currFee =
        toggleData.find((o) => o.key === defaultToken)?.fee || EmptyValueTag;
      const currFeeRaw =
        toggleData.find((o) => o.key === defaultToken)?.__raw__ ||
        EmptyValueTag;
      handleFeeChange({
        belong: defaultToken,
        fee: currFee,
        __raw__: currFeeRaw,
      });
    }
  }, [chargeFeeTokenList, feeToken, assetsData, handleFeeChange, toggleData]);

  const checkFeeTokenEnough = React.useCallback(
    (token: string, fee: number) => {
      const tokenAssets = assetsData.find((o) => o.name === token)?.available;
      return tokenAssets && Number(tokenAssets) > fee;
    },
    [assetsData]
  );

  React.useEffect(() => {
    if (
      !!chargeFeeTokenList.length &&
      assetsData &&
      !checkFeeTokenEnough(feeToken, Number(getTokenFee(feeToken)))
    ) {
      setIsFeeNotEnough(true);
      return;
    }
    setIsFeeNotEnough(false);
  }, [
    chargeFeeTokenList,
    assetsData,
    checkFeeTokenEnough,
    getTokenFee,
    feeToken,
  ]);

  const handleToggleChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
      if (value === null) return;
      setFeeToken(value);
    },
    []
  );

  const _handleWithdrawTypeChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setWithdrawType(e.target?.value);
      if (handleWithdrawTypeChange) {
        handleWithdrawTypeChange(e.target?.value as any);
      }
    },
    [handleWithdrawTypeChange]
  );

  const debounceAddress = React.useCallback(
    _.debounce(({ address, handleOnAddressChange }: any) => {
      if (handleOnAddressChange) {
        handleOnAddressChange(address);
      }
    }, wait),
    []
  );
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

  const handleClear = React.useCallback(() => {
    setAddress("");
    if (handleAddressError) {
      const error = handleAddressError("");
      if (error?.error) {
        setAddressError(error);
      }
    }
  }, [setAddress, setAddressError, handleAddressError]);

  return (
    <Grid
      className={walletMap ? "" : "loading"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
      direction={"column"} /* minHeight={540} */
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
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
            {t("withdrawTitle")}
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

      <Grid
        item
        /* marginTop={2} */ alignSelf={"stretch"}
        position={"relative"}
      >
        <TextField
          value={address}
          error={addressError && addressError.error ? true : false}
          label={t("withdrawLabelAddress")}
          placeholder={t("labelPleaseInputWalletAddress")}
          onChange={_handleOnAddressChange}
          disabled={chargeFeeTokenList.length ? false : true}
          // required={true}
          SelectProps={{ IconComponent: DropDownIcon }}
          helperText={
            <Typography component={"span"} variant={"body2"}>
              {addressError && addressError.error ? addressError.message : ""}
            </Typography>
          }
          fullWidth={true}
        />
        {address !== "" ? (
          <IconClearStyled
            size={"small"}
            color={"inherit"}
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

      {realAddr && (
        <Grid item alignSelf={"stretch"} position={"relative"}>
          {realAddr}
        </Grid>
      )}

      {/* TODO: check whether there's a need to show deposit fee */}
      <Grid item /* marginTop={2} */ alignSelf={"stretch"}>
        {!toggleData?.length ? (
          <Typography>{t("labelCalculating")}</Typography>
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
                {getTokenFee(feeToken) || EmptyValueTag} {feeToken}
                <Typography
                  marginLeft={1}
                  color={"var(--color-text-secondary)"}
                >
                  {t(
                    `withdrawLabel${
                      _withdrawType === "Fast" ? "Fast" : "Standard"
                    }`
                  )}
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
                <ToggleButtonGroup
                  exclusive
                  size={"small"}
                  {...{
                    data: toggleData,
                    value: feeToken,
                    t,
                    ...rest,
                  }}
                  onChange={handleToggleChange}
                />
                <Box marginTop={1}>
                  <RadioGroup
                    aria-label="withdraw"
                    name="withdraw"
                    value={_withdrawType}
                    onChange={(e) => {
                      _handleWithdrawTypeChange(e);
                    }}
                  >
                    {Object.keys(withdrawTypes).map((key) => {
                      return (
                        <FormControlLabel
                          key={key}
                          value={key}
                          control={<Radio />}
                          label={`${t("withdrawTypeLabel" + key)}`}
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
      <Grid item /* marginTop={2} */ alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onWithdrawClick(tradeData);
          }}
          loading={
            !getDisabled() && withdrawBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            withdrawBtnStatus === TradeBtnStatus.DISABLED ||
            withdrawBtnStatus === TradeBtnStatus.LOADING
              ? true
              : false
          }
        >
          {t(withdrawI18nKey ?? `withdrawLabelBtn`)}
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
