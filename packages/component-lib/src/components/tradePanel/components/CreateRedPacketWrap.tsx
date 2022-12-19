import {
  Box,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Button,
  DateTimePicker,
  InputCoin,
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
  LuckyRedPacketList,
  LuckyRedPacketItem,
  // RedPacketSend,
  FeeInfo,
  // DropDownIcon,
  // LoadingIcon,
  // CloseIcon,
  // AddressError,
  EmptyValueTag,
  BackIcon,
  // TOAST_TIME,
  // htmlDecode,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import {
  CreateRedPacketProps,
  CreateRedPacketViewProps,
  RedPacketStep,
  TradeBtnStatus,
} from "../Interface";
// import { MintStep } from "./MintAdvanceNFTWrap";
import { MenuBtnStyled } from "../../styled";
import * as sdk from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";
import { RedPacketOrderData } from "@loopring-web/core";
import { BtnMain } from "./tool";

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
  //width: 100%;
  //display: flex;
  textarea {
    background: var(--field-opacity);
    border-color: var(--opacity);
    :hover {
      border-color: var(--color-border-hover);
    }
  }
`;

export const CreateRedPacketStepType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo, LuckInfo = any>({
    // handleOnSelectedType,
    tradeData,
    handleOnDataChange,
    // handleFeeChange,
    // redPacketStepValue,
    // selectedType,
    setActiveStep,
    disabled,
    btnStatus,
    btnInfo,
    t,
  }: // ...rest
  CreateRedPacketViewProps<T, I, C, LuckInfo> & WithTranslation) => {
    const { isMobile } = useSettings();
    // const [selectedType,setSelect] = React
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const selectedType = React.useMemo(() => {
      if (tradeData?.type) {
        if (
          tradeData.type.partition == sdk.LuckyTokenAmountType.RANDOM &&
          tradeData.type.mode == sdk.LuckyTokenClaimType.COMMON
        ) {
          return LuckyRedPacketList[1];
        } else if (
          tradeData.type.partition == sdk.LuckyTokenAmountType.RANDOM &&
          tradeData.type.mode == sdk.LuckyTokenClaimType.COMMON
        ) {
          return LuckyRedPacketList[2];
        } else {
          return LuckyRedPacketList[0];
        }
      } else {
        return LuckyRedPacketList[0];
      }
    });

    // {
    //   labelKey: "labelLuckyRelayToken",
    //     desKey: "labelLuckyRelayTokenDes",
    //   value: {
    //   value: 0,
    //     partition: sdk.LuckyTokenAmountType.AVERAGE,
    //     mode: sdk.LuckyTokenClaimType.RELAY,
    // },
    // },
    return (
      <RedPacketBoxStyle
        marginTop={3}
        display={"flex"}
        justifyContent={"flex-start"}
        flexDirection={"column"}
        alignItems={"center"}
        width={"100%"}
        maxWidth={"760px"}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          flex={1}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          className="modalContent"
          marginY={1}
          paddingX={isMobile ? 2 : 10}
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
                  handleOnDataChange({
                    type: {
                      ...tradeData.type,
                      // scope: value,
                      partition: item.value.partition,
                      mode: item.value.mode,
                    },
                  } as any);
                }}
              >
                <Typography
                  variant={"h5"}
                  display={"inline-flex"}
                  marginBottom={1 / 2}
                  alignItems={"flex-start"}
                  component={"span"}
                  // className={"mainTitle"}
                  // color={"var(--color-text-secondary)"}
                >
                  {t(item.labelKey)}
                </Typography>
                <Typography
                  variant={"body1"}
                  display={"inline-flex"}
                  justifyContent={"flex-start"}
                  component={"span"}
                  color={"var(--color-text-secondary)"}
                >
                  {t(item.desKey)}
                </Typography>
              </MenuBtnStyled>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <RadioGroup
            aria-label="withdraw"
            name="withdraw"
            value={tradeData?.type?.scope ?? sdk.LuckyTokenViewType.PRIVATE}
            onChange={(_e, value) => {
              handleOnDataChange({
                type: {
                  ...tradeData.type,
                  scope: value,
                },
              } as any);
            }}
          >
            {[0, 1].map((key) => {
              return (
                <FormControlLabel
                  key={key}
                  sx={{ marginTop: 2 }}
                  value={key.toString()}
                  control={<Radio />}
                  label={
                    <>
                      <Typography>
                        {t("labelLuckyTokenViewType" + key)}
                      </Typography>
                      <Typography>
                        {t("labelLuckyTokenViewTypeDes" + key)}
                      </Typography>
                    </>
                  }
                />
              );
            })}
          </RadioGroup>
        </Box>
        <Box
          marginTop={3}
          width={"100%"}
          maxWidth={"760px"}
          paddingX={isMobile ? 2 : 10}
        >
          <BtnMain
            {...{
              defaultLabel: "labelContinue",
              fullWidth: true,
              btnInfo: btnInfo,
              // btnStatus,
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
      </RedPacketBoxStyle>
    );
  }
);

export const CreateRedPacketStepWrap = withTranslation()(
  <
    T extends Partial<RedPacketOrderData<I>>,
    I,
    F extends FeeInfo,
    LuckInfo = any
  >({
    btnStatus,
    btnInfo,
    disabled,
    tradeType = "TOKEN",
    handleFeeChange,
    handleOnDataChange,
    onSubmitClick,
    walletMap,
    tradeData,
    coinMap,
    isFeeNotEnough,
    setActiveStep,
    // selectedType,
    feeInfo,
    chargeFeeTokenList,
    lastFailed,
    onBack,
    ...rest
  }: CreateRedPacketProps<T, I, F, LuckInfo> & WithTranslation) => {
    const { t } = useTranslation("common");
    const inputButtonDefaultProps = {
      label: t("labelInputRedPacketBtnLabel"),
    };
    // const popupState = usePopupState({
    //   variant: "popover",
    //   popupId: `popupId-deposit`,
    // });
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const inputBtnRef = React.useRef();
    const inputSplitRef = React.useRef();

    const inputSplitProps: any = {
      label: t("labelSplit"), //t("labelTokenAmount"),
      subLabel: "", //t("labelAvailable"),
      placeholderText: "Quantity",
      maxAllow: true,
      handleError: () => {},
      isShowCoinInfo: false,

      // ...tokenAProps,
      // handleError,
      // handleCountChange,
      // ...rest,
    };
    // const panelList: Array<{
    //   view: JSX.Element;
    //   onBack?: undefined | (() => void);
    //   height?: any;
    //   width?: any;
    // }> = React.useMemo(() => {
    //
    // }, [t]);
    const handleToggleChange = (value: F) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    };
    const { isMobile } = useSettings();
    return (
      <RedPacketBoxStyle
        display={"flex"}
        flex={1}
        className={"redPacket"}
        justifyContent={"center"}
        width={"100%"}
      >
        <Grid
          className={walletMap ? "transfer-wrap" : "loading"}
          container
          paddingX={isMobile ? 2 : 10}
          direction={"column"}
          alignItems={"stretch"}
          justifyContent={"center"}
          flex={1}
          height={"100%"}
          spacing={2}
          width={"100%"}
          minWidth={240}
          maxWidth={"760px"}
          flexWrap={"nowrap"}
        >
          <Grid item marginTop={2}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
              marginY={2}
            >
              <Typography
                component={"h4"}
                variant={isMobile ? "body1" : "h5"}
                whiteSpace={"pre"}
                marginRight={1}
              >
                {t("labelRedPacketSendTitle")}
              </Typography>
              {/*<Info2Icon*/}
              {/*  {...bindHover(popupState)}*/}
              {/*  fontSize={"large"}*/}
              {/*  htmlColor={"var(--color-text-third)"}*/}
              {/*/>*/}
            </Box>
            {/*<PopoverPure*/}
            {/*  className={"arrow-center"}*/}
            {/*  {...bindPopper(popupState)}*/}
            {/*  anchorOrigin={{*/}
            {/*    vertical: "bottom",*/}
            {/*    horizontal: "center",*/}
            {/*  }}*/}
            {/*  transformOrigin={{*/}
            {/*    vertical: "top",*/}
            {/*    horizontal: "center",*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <Typography*/}
            {/*    padding={2}*/}
            {/*    maxWidth={450}*/}
            {/*    variant={"body1"}*/}
            {/*    whiteSpace={"pre-line"}*/}
            {/*  >*/}
            {/*    <Trans i18nKey="transferDescription">*/}
            {/*      Transfer to any valid Ethereum addresses instantly. Please*/}
            {/*      make sure the recipient address accepts Loopring layer-2*/}
            {/*      payments before you proceed.*/}
            {/*    </Trans>*/}
            {/*  </Typography>*/}
            {/*</PopoverPure>*/}
          </Grid>

          <Grid item alignSelf={"stretch"} position={"relative"}>
            <BasicACoinTrade
              {...{
                ...rest,
                t,
                type: tradeType,
                disabled,
                walletMap,
                tradeData: tradeData as T,
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
                  count: tradeData?.numbers,
                },
                coinMap: {},
                coinPrecision: undefined,
              }}
            />
          </Grid>

          <Grid item alignSelf={"stretch"}>
            <FormLabel>
              <Tooltip
                title={t("labelMintDescriptionTooltips").toString()}
                placement={"top"}
              >
                <Typography
                  variant={"body1"}
                  component={"span"}
                  lineHeight={"20px"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  className={"main-label"}
                  color={"var(--color-text-third)"}
                >
                  <Trans i18nKey={"labelRedPacketMemo"}>
                    Memo
                    {/*<Info2Icon*/}
                    {/*  fontSize={"small"}*/}
                    {/*  color={"inherit"}*/}
                    {/*  sx={{ marginX: 1 / 2 }}*/}
                    {/*/>*/}
                  </Trans>
                </Typography>
              </Tooltip>
            </FormLabel>
            <TextareaAutosizeStyled
              aria-label="NFT Description"
              maxRows={5}
              minRows={5}
              disabled={disabled}
              style={{
                overflowX: "hidden",
                resize: "vertical",
              }}
              maxLength={25}
              onChange={(event) =>
                handleOnDataChange({
                  description: event.target.value,
                } as unknown as Partial<T>)
              }
              draggable={true}
            />
          </Grid>
          <Grid
            item
            alignSelf={"stretch"}
            display={"flex"}
            flexDirection={"column"}
          >
            <FormLabel>
              <Tooltip
                title={t("labelMintDescriptionTooltips").toString()}
                placement={"top"}
              >
                <Typography
                  variant={"body1"}
                  component={"span"}
                  lineHeight={"20px"}
                  display={"inline-flex"}
                  alignItems={"center"}
                  className={"main-label"}
                  color={"var(--color-text-third)"}
                >
                  <Trans i18nKey={"labelRedPacketMemo"}>
                    Send Time
                    {/*<Info2Icon*/}
                    {/*  fontSize={"small"}*/}
                    {/*  color={"inherit"}*/}
                    {/*  sx={{ marginX: 1 / 2 }}*/}
                    {/*/>*/}
                  </Trans>
                </Typography>
              </Tooltip>
            </FormLabel>
            {/*year' | 'day' | 'month' | 'hours' | 'minutes' | 'seconds*/}
            <DateTimePicker
              views={["day", "hours", "minutes"]}
              onChange={() => {
                handleOnDataChange({ validUntil: "" } as any);
              }}
            />
            {/*{...props}*/}
            {/*label="Basic example"*/}
            {/*value={value}*/}
            {/*views={["day", "time"]}*/}
            {/*onChange={(newValue: any) => setValue(newValue)}*/}
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
                  <Typography
                    component={"span"}
                    color={"inherit"}
                    minWidth={28}
                  >
                    {t("labelL2toL2Fee")}：
                  </Typography>
                  <Box
                    component={"span"}
                    display={"flex"}
                    alignItems={"center"}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setDropdownStatus((prev) =>
                        prev === "up" ? "down" : "up"
                      )
                    }
                  >
                    {feeInfo && feeInfo.belong && feeInfo.fee
                      ? feeInfo.fee + " " + feeInfo.belong
                      : EmptyValueTag + " " + feeInfo?.belong ?? EmptyValueTag}
                    <DropdownIconStyled
                      status={dropdownStatus}
                      fontSize={"medium"}
                    />
                    {isFeeNotEnough?.isOnLoading ? (
                      <Typography
                        color={"var(--color-warning)"}
                        marginLeft={1}
                        component={"span"}
                      >
                        {t("labelFeeCalculating")}
                      </Typography>
                    ) : (
                      isFeeNotEnough?.isFeeNotEnough && (
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
          <Grid item alignSelf={"stretch"}>
            {lastFailed && (
              <Typography
                paddingBottom={1}
                textAlign={"center"}
                color={"var(--color-warning)"}
              >
                {t("labelConfirmAgainByFailed")}
              </Typography>
            )}
          </Grid>

          <Grid
            item
            alignSelf={"stretch"}
            paddingBottom={0}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
          >
            <Box width={"48%"}>
              <Button
                variant={"outlined"}
                size={"medium"}
                fullWidth
                className={"step"}
                startIcon={<BackIcon fontSize={"small"} />}
                color={"primary"}
                sx={{ height: "var(--btn-medium-height)" }}
                onClick={() => {
                  setActiveStep(RedPacketStep.ChooseType);
                }}
              >
                {t(`labelMintBack`)}
              </Button>
            </Box>
            <Box width={"50%"}>
              <Button
                fullWidth
                variant={"contained"}
                size={"medium"}
                color={"primary"}
                onClick={() => {
                  // const tradeDataWithMemo = { ...tradeData };
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
            </Box>
          </Grid>
        </Grid>
      </RedPacketBoxStyle>

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
  }
);
