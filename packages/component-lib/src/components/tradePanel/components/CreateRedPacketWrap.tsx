import {
  Box,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";
import {
  BtnInfo,
  Button,
  InputCoin,
  PopoverPure,
  TextareaAutosizeStyled,
  // TextField,
} from "../../basic-lib";
import {
  Trans,
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import {
  // LoadingIcon,
  // CloseIcon,
  // CheckedIcon,
  // CheckBoxIcon,
  BackIcon,
  LuckyRedPacketList,
  LuckyRedPacketItem,
  // RedPacketSend,
  IBData,
  FeeInfo,
  Info2Icon,
  // DropDownIcon,
  // LoadingIcon,
  // CloseIcon,
  // AddressError,
  EmptyValueTag,
  // TOAST_TIME,
  // htmlDecode,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import {
  CreateRedPacketViewProps,
  RedPacketStep,
  TradeBtnStatus,
} from "../Interface";
// import { MintStep } from "./MintAdvanceNFTWrap";
import { MenuBtnStyled } from "../../styled";
import * as sdk from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper } from "material-ui-popup-state/hooks";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";

const RedPacketBoxStyle = styled(Box)`
  .MuiFormGroup-root {
    align-items: flex-start;
  }

  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }

  .MuiButtonBase-root.step {
    padding-left: ${({ theme }) => theme.unit * 4}px;
    padding-right: ${({ theme }) => theme.unit * 4}px;
  }
`;

const BtnMain = React.memo(
  ({
    defaultLabel = "labelMintNext",
    btnInfo,
    disabled,
    onClick,
    btnStatus,
    fullWidth,
  }: {
    defaultLabel?: string;
    btnInfo?: BtnInfo;
    disabled: () => boolean;
    onClick: () => void;
    fullWidth?: boolean;
    btnStatus: TradeBtnStatus;
  }) => {
    const { t } = useTranslation();
    return (
      <Button
        variant={"contained"}
        size={"medium"}
        color={"primary"}
        fullWidth={fullWidth}
        className={"step"}
        endIcon={
          <BackIcon fontSize={"small"} sx={{ transform: "rotate(180deg)" }} />
        }
        loading={
          !disabled() && btnStatus === TradeBtnStatus.LOADING ? "true" : "false"
        }
        disabled={disabled() || btnStatus === TradeBtnStatus.LOADING}
        onClick={onClick}
      >
        {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
      </Button>
    );
  }
);
export const CreateRedPacketStepType = withTranslation()(
  <T extends IBData<I>, I, C = FeeInfo, LuckInfo = any>({
    handleOnSelectedType,
    handleOnDataChange,
    redPacketStepValue,
    selectedType,
    setActiveStep,
    disabled,
    btnStatus,
    btnInfo,
    t,
  }: CreateRedPacketViewProps<T, I, C, LuckInfo> & WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    return (
      <Box
        marginTop={3}
        display={"flex"}
        justifyContent={"flex-start"}
        flexDirection={"column"}
        alignItems={"flex-start"}
        width={"100%"}
        maxWidth={"760px"}
      >
        <Typography component={"h4"} variant={"h5"} marginBottom={2}>
          {t("labelADMintSelect")}
        </Typography>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          flex={1}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          className="modalContent"
          marginTop={3}
          paddingX={isMobile ? 7 : 10}
          paddingBottom={4}
        >
          {LuckyRedPacketList.map((item: LuckyRedPacketItem) => (
            <Box key={item.value.value} marginTop={1.5}>
              <MenuBtnStyled
                variant={"outlined"}
                size={"large"}
                className={`${isMobile ? "isMobile" : ""} ${
                  selectedType.value.value === item.value.value
                    ? "selected redPacketType "
                    : "redPacketType"
                }`}
                fullWidth
                onClick={(_e) => {
                  handleOnSelectedType(item);
                }}
              >
                {t(item.labelKey)}
              </MenuBtnStyled>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <RadioGroup
            aria-label="withdraw"
            name="withdraw"
            value={redPacketStepValue?.type?.scope}
            onChange={(_e, value) => {
              handleOnDataChange({
                type: {
                  scope: value,
                },
              } as any);
            }}
          >
            {Object.keys(sdk.LuckyTokenViewType).map((key) => {
              return (
                <FormControlLabel
                  key={key}
                  value={key.toString()}
                  control={<Radio />}
                  label={
                    <>
                      <Typography>
                        `${t("labelLuckyTokenViewType" + key)}`
                      </Typography>
                      <Typography>
                        `${t("labelLuckyTokenViewTypeDes" + key)}`
                      </Typography>
                    </>
                  }
                />
              );
            })}
          </RadioGroup>
        </Box>
        <Box>
          <BtnMain
            {...{
              defaultLabel: "labelContinue",
              fullWidth: true,
              btnInfo: btnInfo,
              btnStatus,
              disabled: () => {
                return getDisabled || btnStatus === TradeBtnStatus.DISABLED;
              },
              onClick: () => {
                setActiveStep(RedPacketStep.Main);
                // onNFTMintClick(tradeData);
              },
            }}
          />
        </Box>
      </Box>
    );
  }
);

export const CreateRedPacketStepWrap = <
  T extends IBData<I>,
  I,
  F = FeeInfo,
  LuckInfo = any
>({
  btnStatus,
  btnInfo,
  disabled,
  type,
  handleOnSelectedType,
  handleOnDataChange,
  redPacketStepValue,
  onSubmitClick,
  walletMap,
  tradeData,
  coinMap,
  redPacketStepValue,
  isFeeNotEnough,
  selectedType,
  feeInfo,
  chargeFeeTokenList,
  handleToggleChange,
  lastFailed,
  ...rest
}: CreateRedPacketViewProps<T, I, F, LuckInfo>) => {
  const { t } = useTranslation("common");
  const inputButtonDefaultProps = {
    label: t("labelInputRedPacketBtnLabel"),
  };
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, btnStatus]);
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const inputBtnRef = React.useRef();
  const inputSplitRef = React.useRef();

  const inputSplitProps: any = {
    label: "", //t("labelTokenAmount"),
    subLabel: "", //t("labelAvailable"),
    placeholderText: "0",
    maxAllow: true,
    handleError: () => {},
    // ...tokenAProps,
    // handleError,
    // handleCountChange,
    // ...rest,
  };
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, btnStatus]);

  // const panelList: Array<{
  //   view: JSX.Element;
  //   onBack?: undefined | (() => void);
  //   height?: any;
  //   width?: any;
  // }> = React.useMemo(() => {
  //
  // }, [t]);
  const { isMobile } = useSettings();
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
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <InputCoin<any, I, any>
          ref={inputSplitRef}
          disabled={getDisabled}
          {...{
            ...inputSplitProps,
            name: "Split",
            isHideError: true,
            order: "right",
            inputData: {
              // belong: t("labelSplit"),
              count: redPacketStepValue.split,
            },
            coinMap: {},
            coinPrecision: undefined,
          }}
        />
        {/*<TextField*/}
        {/*  className={"text-address"}*/}
        {/*  value={addressDefault}*/}
        {/*  error={!!(isInvalidAddressOrENS || isSameAddress)}*/}
        {/*  label={t("labelL2toL2Address")}*/}
        {/*  placeholder={t("labelL2toL2AddressInput")}*/}
        {/*  onChange={(event) => handleOnAddressChange(event?.target?.value)}*/}
        {/*  disabled={!chargeFeeTokenList.length}*/}
        {/*  SelectProps={{ IconComponent: DropDownIcon }}*/}
        {/*  fullWidth={true}*/}
        {/*/>*/}
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <TextareaAutosizeStyled
          aria-label="Best Wish"
          maxRows={2}
          maxLength={25}
          disabled={true}
          style={{ padding: 0, height: "auto" }}
          value={""}
        />
      </Grid>

      {/*<Grid item alignSelf={"stretch"} position={"relative"}>*/}
      {/*  <TextField*/}
      {/*    value={memo}*/}
      {/*    // error={addressError && addressError.error ? true : false}*/}
      {/*    label={t("labelL2toL2Memo")}*/}
      {/*    placeholder={t("labelL2toL2MemoPlaceholder")}*/}
      {/*    onChange={handleOnMemoChange}*/}
      {/*    fullWidth={true}*/}
      {/*  />*/}
      {/*</Grid>*/}

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
            {t("labelConfirmAgainByFailed")}
          </Typography>
        )}
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            const tradeDataWithMemo = { ...tradeData };
            // onTransferClick(tradeData)
            onSubmitClick();
          }}
          loading={
            !getDisabled && btnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
        >
          {t(btnInfo?.label ?? `labelL2toL2Btn`)}
        </Button>
      </Grid>

      {/*<Toast*/}
      {/*  alertText={t("labelCopyAddClip")}*/}
      {/*  open={copyToastOpen}*/}
      {/*  autoHideDuration={TOAST_TIME}*/}
      {/*  onClose={() => {*/}
      {/*    setCopyToastOpen(false);*/}
      {/*  }}*/}
      {/*  severity={"success"}*/}
      {/*/>*/}
    </Grid>
    // <Box
    //   className={walletMap ? "" : "loading"}
    //   display={"flex"}
    //   flex={1}
    //   flexDirection={"column"}
    //   padding={5 / 2}
    //   alignItems={"center"}
    // >
    //   <RedPacketBoxStyle
    //     flex={1}
    //     marginTop={2}
    //     paddingX={isMobile ? 2 : 5}
    //     display={"flex"}
    //     justifyContent={"center"}
    //     alignItems={"flex-start"}
    //     width={"100%"}
    //   >
    //     {/*{panelList.map((panel, index) => {*/}
    //     {/*  return (*/}
    //     {/*    <React.Fragment key={index}>*/}
    //     {/*      {activeStep === index ? panel.view : <></>}*/}
    //     {/*    </React.Fragment>*/}
    //     {/*  );*/}
    //     {/*})}*/}
    //   </RedPacketBoxStyle>
    // </Box>
  );
};
