import {
  Avatar,
  Box,
  CardContent,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React from "react";
import {
  Button,
  CardStyleItem,
  DateTimePicker,
  InputCoin,
  TextField,
} from "../../basic-lib";
import {
  Trans,
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import {
  BackIcon,
  EmptyValueTag,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  LuckyRedPacketItem,
  LuckyRedPacketList,
  RedPacketOrderData,
  REDPACKET_ORDER_LIMIT,
  SoursURL,
  TRADE_TYPE,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import {
  CreateRedPacketViewProps,
  RedPacketStep,
  TradeBtnStatus,
} from "../Interface";
import { MenuBtnStyled } from "../../styled";
import styled from "@emotion/styled";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";
import { BtnMain } from "./tool";
import * as sdk from "@loopring-web/loopring-sdk";
import moment, { Moment } from "moment";

const RedPacketBoxStyle = styled(Box)`
  //position: absolute;
  padding-top: ${({ theme }) => theme.unit}px;
  //width: 100%;
  //min-width: 240px;
  //max-width: 720px;
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
export const CreateRedPacketStepWrap = withTranslation()(
  <T extends Partial<RedPacketOrderData<I>>, I, F extends FeeInfo>({
    btnStatus,
    btnInfo,
    disabled,
    tradeType,
    handleFeeChange,
    handleOnDataChange,
    onCreateRedPacketClick,
    walletMap,
    tradeData,
    coinMap,
    tokenMap,
    isFeeNotEnough,
    setActiveStep,
    feeInfo,
    chargeFeeTokenList,
    lastFailed,
    selectedType,
    minimum,
    maximum,
    onBack,
    ...rest
  }: CreateRedPacketViewProps<T, I, F> & {
    selectedType: LuckyRedPacketItem;
  } & WithTranslation) => {
    const { t } = useTranslation("common");

    const inputButtonDefaultProps = {
      label: t("labelRedPacketTotalAmount"),
      decimalsLimit:
        (tokenMap && tokenMap[tradeData?.belong as string])?.precision ?? 8,
      minimum,
      placeholderText: tradeData?.belong
        ? t("labelRedPacketsMinRange", { value: minimum }) +
          (sdk.toBig(maximum ?? 0).lt(sdk.toBig(tradeData.balance ?? 0))
            ? " - " + t("labelRedPacketsMaxRange", { value: maximum })
            : "")
        : "0.00",
    };
    const [dayValue, setDayValue] = React.useState<Moment | null>(moment());
    const [durationValue, setDurationValue] = React.useState<number>(1);

    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const inputBtnRef = React.useRef();
    const inputSplitRef = React.useRef();
    const { total: redPacketTotalValue, splitValue } = React.useMemo(() => {
      if (tradeData?.tradeValue && tradeData.belong && tokenMap) {
        const splitValue =
          selectedType.value.value == 2
            ? (tradeData?.tradeValue ?? 0) / (tradeData?.numbers ?? 1)
            : tradeData?.tradeValue ?? 0;
        return {
          total:
            getValuePrecisionThousand(
              tradeData?.tradeValue,
              tokenMap[tradeData?.belong as string].precision,
              tokenMap[tradeData?.belong as string].precision,
              tokenMap[tradeData?.belong as string].precision,
              false
              // { isFait: true }
            ) +
            " " +
            tradeData.belong,
          splitValue:
            selectedType.value.value == 2 &&
            getValuePrecisionThousand(
              splitValue,
              tokenMap[tradeData?.belong as string].precision,
              tokenMap[tradeData?.belong as string].precision,
              tokenMap[tradeData?.belong as string].precision,
              false
              // { isFait: true }
            ) +
              " " +
              tradeData.belong,
        };
      } else {
        return {
          total: EmptyValueTag,
          splitValue: selectedType.value.value == 2 && EmptyValueTag,
        };
      }
    }, [tradeData, selectedType.value.value, coinMap]);
    const inputSplitProps = React.useMemo(() => {
      const inputSplitProps: any = {
        label: t("labelSplit"),
        placeholderText: t("labelQuantity"),
        isHideError: true,
        isShowCoinInfo: false,
        handleCountChange: (ibData: IBData<any>, _name: string, _ref: any) => {
          handleOnDataChange({
            numbers: ibData.tradeValue,
          } as unknown as Partial<T>);
        },
        fullWidth: true,
      };
      let inputSplitExtendProps = {};
      if (tradeData?.tradeValue && Number(tradeData?.tradeValue) && maximum) {
        let balance = sdk
          .toBig(tradeData.tradeValue)
          .div(Number(minimum) ?? 1)
          .toFixed(0, 1);

        inputSplitExtendProps = {
          maxAllow: true,
          subLabel: t("labelAvailable"),
          handleError: (data: any) => {
            if (data.tradeValue && data.tradeValue > data.balance) {
              return {
                error: true,
              };
            }
            return {
              error: false,
            };
          },
          inputData: {
            belong: "Split",
            tradeValue: tradeData?.numbers,
            balance:
              Number(balance) <= REDPACKET_ORDER_LIMIT
                ? balance
                : REDPACKET_ORDER_LIMIT,
          },
        };
      } else {
        inputSplitExtendProps = {
          maxAllow: false,
          subLabel: "",
          handleError: () => undefined,
          inputData: {
            belong: "Split",
            tradeValue: tradeData?.numbers,
            // count: tradeData?.numbers,
          },
        };
      }
      return {
        ...inputSplitProps,
        ...inputSplitExtendProps,
      };
    }, [tradeData, maximum, minimum]);

    const durationProps = {
      label: (
        <Typography color={"var(--color-text-third)"}>
          {t("labelRedpacketDurationTitle")}
        </Typography>
      ),
      placeholderText: t("labelRedpacketDurationPlaceHold"),
      isHideError: true,
      isShowCoinInfo: false,
      handleCountChange: (ibData: IBData<any>, _name: string, _ref: any) => {
        handleOnDataChange({
          numbers: ibData.tradeValue,
        } as unknown as Partial<T>);
      },
      handleError: (data: any) => {
        if (data.tradeValue && data.tradeValue > data.balance) {
          return {
            error: true,
          };
        }
        return {
          error: false,
        };
      },
      size: "small",
      maxAllow: true,
      subLabel: t("labelAvailable"),
      inputData: {
        belong: "Split",
        tradeValue: durationValue as any,
        balance: 30,
      } as any,
    };
    const handleToggleChange = (value: F) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    };
    const { isMobile } = useSettings();

    // @ts-ignore
    return (
      <RedPacketBoxStyle
        className={"redPacket"}
        justifyContent={"center"}
        marginTop={2}
      >
        <Box marginY={1} display={"flex"}>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            marginBottom={2}
          >
            <Typography
              component={"h4"}
              variant={isMobile ? "body1" : "h5"}
              whiteSpace={"pre"}
              marginRight={1}
            >
              {t(
                selectedType.value.value == 2
                  ? "labelRedPacketSendCommonTitle"
                  : "labelRedPacketSenRandomTitle"
              ) +
                " (" +
                t(`labelRedPacketViewType${tradeData?.type?.scope ?? 0}`) +
                ")"}
            </Typography>
          </Box>
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          alignSelf={"stretch"}
          position={"relative"}
          flexDirection={"column"}
        >
          {tradeType === "TOKEN" && (
            <BasicACoinTrade
              {...{
                ...rest,
                t,
                type: tradeType ?? "TOKEN",
                disabled,
                walletMap,
                tradeData,
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef: inputBtnRef,
              }}
            />
          )}
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          alignSelf={"stretch"}
          justifyContent={"stretch"}
          flexDirection={"column"}
          position={"relative"}
        >
          <InputCoin<any, I, any>
            ref={inputSplitRef}
            {...{
              ...inputSplitProps,
              name: "numbers",
              order: "right",
              handleCountChange: (data) => {
                handleOnDataChange({
                  numbers: data.tradeValue,
                } as unknown as Partial<T>);
              },
              coinMap: {},
              coinPrecision: undefined,
            }}
            disabled={disabled}
          />
        </Box>
        <Box marginY={1} display={"flex"} alignSelf={"stretch"}>
          <TextField
            label={
              <Typography component={"span"} color={"var(--color-text-third)"}>
                {t("labelRedPacketMemo")}
              </Typography>
            }
            onChange={(event) =>
              handleOnDataChange({
                memo: event.target.value, //event?.target?.value,
              } as unknown as Partial<T>)
            }
            size={"large"}
            inputProps={{ maxLength: 25 }}
            fullWidth={true}
          />
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          alignSelf={"stretch"}
          flexDirection={"column"}
        >
          <FormLabel>
            <Typography
              variant={"body1"}
              component={"span"}
              lineHeight={"20px"}
              display={"inline-flex"}
              alignItems={"center"}
              className={"main-label"}
              color={"var(--color-text-third)"}
            >
              <Trans i18nKey={"labelRedPacketStart"}>Active Time</Trans>
            </Typography>
          </FormLabel>
          <Box marginTop={1}>
            <DateTimePicker
              value={dayValue}
              fullWidth={true}
              disableFuture={false}
              minDate={moment()}
              maxDateTime={moment().add(1, "days")}
              onChange={(monent: any) => {
                setDayValue(monent);
                handleOnDataChange({
                  validSince: monent.toDate().getTime(),
                } as unknown as Partial<T>);
              }}
              textFiledProps={{ size: "large" }}
              disabled={disabled}
            />
          </Box>
          <Box marginTop={1}>
            <InputCoin
              {...{
                ...durationProps,
                name: "numbers",
                order: "right",
                handleCountChange: (data) => {
                  // @ts-ignore
                  setDurationValue(data.tradeValue ?? "");
                  handleOnDataChange({
                    validUntil: data.tradeValue,
                  } as unknown as Partial<T>);
                },
                size: "middle" as any,
                coinMap: {},
                coinPrecision: undefined,
              }}
              disabled={disabled}
            />
          </Box>
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          alignSelf={"stretch"}
          position={"relative"}
          flexDirection={"column"}
        >
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
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          flexDirection={"column"}
          alignSelf={"stretch"}
        >
          <Typography
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"center"}
            variant={"h3"}
            component={"span"}
            color={"textPrimary"}
            width={"100%"}
            textAlign={"center"}
          >
            {redPacketTotalValue}
          </Typography>
          <Typography
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"center"}
            variant={"body2"}
            component={"span"}
            color={"textThird"}
            width={"100%"}
            textAlign={"center"}
          >
            {selectedType.value.value == 2
              ? t("labelRedPacketsSplitCommonDetail", { value: splitValue })
              : t("labelRedPacketsSplitLuckyDetail")}
          </Typography>
        </Box>
        <Box marginY={1} display={"flex"} alignSelf={"stretch"}>
          {lastFailed && (
            <Typography
              paddingBottom={1}
              textAlign={"center"}
              color={"var(--color-warning)"}
            >
              {t("labelConfirmAgainByFailed")}
            </Typography>
          )}
        </Box>
        <Box
          marginY={1}
          display={"flex"}
          alignSelf={"stretch"}
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
                handleOnDataChange({
                  numbers: undefined,
                  tradeValue: undefined,
                  validSince: Date.now(),
                  validUntil: 1,
                  memo: "",
                } as any);
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
                onCreateRedPacketClick();
              }}
              loading={
                !getDisabled && btnStatus === TradeBtnStatus.LOADING
                  ? "true"
                  : "false"
              }
              disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            >
              {btnInfo?.label
                ? t(btnInfo.label, btnInfo.params)
                : t(`labelCreateRedPacketBtn`)}
            </Button>
          </Box>
        </Box>
        <Box display={"flex"} alignSelf={"stretch"}>
          <Typography
            paddingBottom={0}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"center"}
            variant={"body2"}
            component={"span"}
            color={"textSecondary"}
            width={"100%"}
            textAlign={"center"}
          >
            {t("labelRedPacketsExpireDes")}
          </Typography>
        </Box>
      </RedPacketBoxStyle>
    );
  }
);

export const CreateRedPacketStepType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo>({
    // handleOnSelectedType,
    tradeData,
    handleOnDataChange,
    setActiveStep,
    selectedType,
    disabled = false,
    btnInfo,
    t,
  }: CreateRedPacketViewProps<T, I, C> & {
    selectedType: LuckyRedPacketItem;
    // setSelectType: (value: LuckyRedPacketItem) => void;
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled;
    }, [disabled]);

    return (
      <RedPacketBoxStyle
        display={"flex"}
        justifyContent={"flex-start"}
        flexDirection={"column"}
        alignItems={"center"}
        className={isMobile ? "mobile" : ""}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          marginBottom={2}
        >
          {LuckyRedPacketList.map((item: LuckyRedPacketItem) => (
            <Box key={item.value.value} marginBottom={1.5}>
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
                      ...tradeData?.type,
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
        <Box marginBottom={2} display={"flex"} alignItems={"stretch"}>
          <RadioGroup
            aria-label="withdraw"
            name="withdraw"
            value={tradeData?.type?.scope as sdk.LuckyTokenViewType}
            onChange={(_e, value) => {
              handleOnDataChange({
                type: {
                  ...tradeData.type,
                  scope: value,
                },
              } as any);
            }}
          >
            {[1, 0].map((key) => {
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
          width={"100%"}
          alignSelf={"stretch"}
          paddingBottom={1}
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
                setActiveStep(RedPacketStep.TradeType);
              }}
            >
              {t(`labelMintBack`)}
            </Button>
          </Box>
          <Box width={"48%"}>
            <BtnMain
              {...{
                defaultLabel: "labelContinue",
                fullWidth: true,
                btnInfo: btnInfo,
                disabled: () => getDisabled,
                onClick: () => {
                  setActiveStep(RedPacketStep.Main);
                },
              }}
            />
          </Box>
        </Box>
      </RedPacketBoxStyle>
    );
  }
);

export const CreateRedPacketStepTokenType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo>({
    tradeType,
    setActiveStep,
    disabled = false,
    handleOnDataChange,
    btnInfo,
    t,
  }: CreateRedPacketViewProps<T, I, C> & {
    selectedType: LuckyRedPacketItem;
    // setSelectType: (value: LuckyRedPacketItem) => void;
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled;
    }, [disabled]);

    return (
      <RedPacketBoxStyle
        display={"flex"}
        flexDirection={"column"}
        width={"100%"}
        flexWrap={"nowrap"}
        paddingX={isMobile ? 2 : 10}
        className="modalConte"
        paddingTop={2}
        position={"absolute"}
      >
        <Grid container spacing={2}>
          <Grid item xs={6} display={"flex"} marginBottom={2}>
            <CardStyleItem
              className={
                tradeType === "TOKEN"
                  ? "btnCard column selected"
                  : "btnCard column"
              }
              sx={{ height: "100%" }}
              onClick={() =>
                handleOnDataChange({ tradeType: TRADE_TYPE.TOKEN } as any)
              }
            >
              <CardContent sx={{ alignItems: "center" }}>
                <Typography component={"span"} display={"inline-flex"}>
                  <Avatar
                    variant="rounded"
                    style={{
                      height: "var(--redPacket-avatar)",
                      width: "var(--redPacket-avatar)",
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + "images/redPacketERC20.webp"}
                  />
                </Typography>

                <Typography variant={"h5"} marginTop={2}>
                  {t("labelRedpacketTokens")}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
          <Grid item xs={6} display={"flex"} marginBottom={2}>
            <CardStyleItem
              className={
                tradeType === "NFT"
                  ? "btnCard column selected"
                  : "btnCard column"
              }
              sx={{ height: "100%" }}
              onClick={() =>
                handleOnDataChange({ tradeType: TRADE_TYPE.NFT } as any)
              }
            >
              <CardContent sx={{ alignItems: "center" }}>
                <Typography component={"span"} display={"inline-flex"}>
                  <Typography component={"span"} display={"inline-flex"}>
                    <Avatar
                      variant="rounded"
                      style={{
                        height: "var(--redPacket-avatar)",
                        width: "var(--redPacket-avatar)",
                      }}
                      // src={sellData?.icon}
                      src={SoursURL + "images/redPacketNFT.webp"}
                    />
                  </Typography>
                </Typography>
                <Typography variant={"h5"} marginTop={2}>
                  {t("labelRedpacketNFTS")}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
        </Grid>
        <Box width={"100%"}>
          <BtnMain
            {...{
              defaultLabel: "labelContinue",
              fullWidth: true,
              btnInfo: btnInfo,
              // btnStatus,
              disabled: () => getDisabled,
              onClick: () => {
                setActiveStep(RedPacketStep.ChooseType);
                // onNFTMintClick(tradeData);
              },
            }}
          />
        </Box>
      </RedPacketBoxStyle>
      // <RedPacketBoxStyle
      //   display={"flex"}
      //   justifyContent={"flex-start"}
      //   flexDirection={"column"}
      //   alignItems={"center"}
      //   className={isMobile ? "mobile" : ""}
      // >
      //
      // </RedPacketBoxStyle>
    );
  }
);
