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
  LuckyRedPacketList,
  LuckyRedPacketItem,
  FeeInfo,
  EmptyValueTag,
  BackIcon,
  myLog,
  IBData,
  getValuePrecisionThousand,
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
import { RedPacketOrderData } from "@loopring-web/core";
import { BtnMain } from "./tool";
import * as sdk from "@loopring-web/loopring-sdk";
import moment, { Moment } from "moment";

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
export const CreateRedPacketStepWrap = withTranslation()(
  <T extends Partial<RedPacketOrderData<I>>, I, F extends FeeInfo>({
    btnStatus,
    btnInfo,
    disabled,
    tradeType = "TOKEN",
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
      // label: t("labelInputRedPacketBtnLabel"),
      label:
        selectedType.value.value == 2
          ? t("labelAmountEach")
          : t("labelTotalAmount"), //t("labelTokenAmount"),
      decimalsLimit:
        (tokenMap && tokenMap[tradeData?.belong as string])?.precision ?? 8,
      placeholderText: tradeData?.belong
        ? selectedType.value.value == 2
          ? t("labelRedPacketsMinDual", { value: minimum })
          : t("labelRedPacketsMinDual", { value: minimum }) +
            (sdk.toBig(maximum ?? 0).lt(sdk.toBig(tradeData.balance ?? 0))
              ? " - " + t("labelRedPacketsMaxDual", { value: maximum })
              : "")
        : "0.00",
    };
    const [dayValue, setDayValue] = React.useState<Moment | null>(moment());

    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const inputBtnRef = React.useRef();
    const inputSplitRef = React.useRef();
    const redPacketTotalValue = React.useMemo(() => {
      const value =
        selectedType.value.value == 2
          ? (tradeData?.tradeValue ?? 0) * (tradeData?.numbers ?? 0)
          : tradeData?.tradeValue ?? 0;
      if (value && tradeData.belong && tokenMap) {
        // coinMap[tradeData.belong].
        return (
          getValuePrecisionThousand(
            value,
            tokenMap[tradeData?.belong as string].precision,
            tokenMap[tradeData?.belong as string].precision,
            tokenMap[tradeData?.belong as string].precision,
            false
            // { isFait: true }
          ) +
          " " +
          tradeData.belong
        );
      } else {
        return EmptyValueTag;
      }
    }, [tradeData, selectedType.value.value, coinMap]);

    const inputSplitProps = React.useMemo(() => {
      const inputSplitProps: any = {
        label:
          selectedType.value.value == 2 ? t("labelQuantity") : t("labelSplit"), //t("labelTokenAmount"),
        placeholderText: t("labelQuantity"),
        isHideError: true,
        isShowCoinInfo: false,
        handleCountChange: (ibData: IBData<any>, _name: string, _ref: any) => {
          handleOnDataChange({
            numbers: ibData.tradeValue,
          } as unknown as Partial<T>);
        },
      };
      if (
        selectedType.value.value !== 2 &&
        tradeData?.tradeValue &&
        Number(tradeData?.tradeValue) &&
        maximum
      ) {
        return {
          ...inputSplitProps,
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
            belong:
              selectedType.value.value == 2
                ? t("labelAmountEach")
                : t("labelSplit"),
            tradeValue: tradeData?.numbers,
            balance: sdk
              .toBig(tradeData.tradeValue)
              .div(Number(minimum) ?? 1)
              .toFixed(0, 1),
          },
        };
      } else {
        return {
          ...inputSplitProps,
          maxAllow: false,
          subLabel: "",
          handleError: () => undefined,
          inputData: {
            belong:
              selectedType.value.value == 2
                ? t("labelAmountEach")
                : t("labelSplit"),
            tradeValue: tradeData?.numbers,
            // count: tradeData?.numbers,
          },
        };
      }
    }, [tradeData, selectedType.value.value, maximum, minimum]);

    const handleToggleChange = (value: F) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    };
    const _balance = React.useMemo(() => {
      if (
        selectedType.value.value == 2 &&
        tradeData?.numbers &&
        // @ts-ignore
        tradeData.numbers !== "0" &&
        tradeData.balance
      ) {
        return tradeData.balance / tradeData.numbers;
      } else {
        return tradeData.balance;
      }
    }, [selectedType.value.value, tradeData.balance, tradeData?.numbers]);
    const { isMobile } = useSettings();
    myLog(
      "CreateRedPacketStepWrap tradeData",
      tradeData,
      disabled,
      walletMap,
      coinMap
    );

    return (
      <RedPacketBoxStyle
        display={"flex"}
        flex={1}
        className={"redPacket"}
        justifyContent={"center"}
        width={"100%"}
        marginTop={2}
      >
        <Grid
          className={walletMap ? "transfer-wrap" : "loading"}
          container
          direction={"column"}
          alignItems={"stretch"}
          justifyContent={"start"}
          flex={1}
          height={"100%"}
          spacing={2}
          width={"100%"}
          minWidth={240}
          maxWidth={"760px"}
          flexWrap={"nowrap"}
          paddingX={isMobile ? 2 : 10}
        >
          <Grid item>
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
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid
            item
            alignSelf={"stretch"}
            position={"relative"}
            display={"flex"}
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
                  tradeData:
                    selectedType.value.value == 2 && tradeData?.numbers
                      ? {
                          ...tradeData,
                          balance: _balance,
                        }
                      : (tradeData as T),
                  coinMap,
                  inputButtonDefaultProps,
                  inputBtnRef: inputBtnRef,
                }}
              />
            )}
            {selectedType.value.value == 2 && (
              <Typography
                display={"inline-flex"}
                width={"100%"}
                justifyContent={"flex-end"}
                color={"textSecondary"}
              >
                {t("labelAssetAmount", {
                  value: getValuePrecisionThousand(
                    tradeData.balance,
                    8,
                    8,
                    8,
                    false
                  ),
                })}
              </Typography>
            )}
          </Grid>

          <Grid item alignSelf={"stretch"} position={"relative"}>
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
                  <Trans i18nKey={"labelRedPacketMemo"}>Memo</Trans>
                </Typography>
              </Tooltip>
            </FormLabel>
            <TextareaAutosizeStyled
              aria-label="Redpacket Description"
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
              <Typography
                variant={"body1"}
                component={"span"}
                lineHeight={"20px"}
                display={"inline-flex"}
                alignItems={"center"}
                className={"main-label"}
                color={"var(--color-text-third)"}
              >
                <Trans i18nKey={"labelRedPacketStart"}>Send Time</Trans>
              </Typography>
            </FormLabel>
            {/*year' | 'day' | 'month' | 'hours' | 'minutes' | 'seconds*/}
            <Box marginTop={1}>
              <DateTimePicker
                value={
                  dayValue
                  // tradeData.validSince
                  //   ? tradeData.validSince < Date.now()
                  //     ? moment(new Date(tradeData.validSince))
                  //     : moment()
                  //   : moment()
                }
                fullWidth={true}
                disableFuture={false}
                minDate={moment()}
                // minDateTime={moment().add(q, "minutes").toDate()}
                // maxDateTime={moment().add(1.5, "days")}
                maxDateTime={moment().add(1, "days")}
                onChange={(monent: any) => {
                  // myLog("selectionState", monent.toDate());
                  setDayValue(monent);
                  handleOnDataChange({
                    validSince: monent.toDate().getTime(),
                  } as unknown as Partial<T>);
                }}
                disabled={disabled}
              />
            </Box>
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
            ></Typography>
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
                  setActiveStep(RedPacketStep.ChooseType);
                  handleOnDataChange({
                    numbers: undefined,
                    tradeValue: undefined,
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
          </Grid>
          <Grid item alignSelf={"stretch"}>
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
          </Grid>
        </Grid>
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
          width={"100%"}
          minWidth={240}
          maxWidth={"760px"}
          flexWrap={"nowrap"}
          paddingX={isMobile ? 2 : 10}
          className="modalConte"
          paddingTop={2}
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
          <Box marginBottom={2}>
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
          <Box width={"100%"}>
            <BtnMain
              {...{
                defaultLabel: "labelContinue",
                fullWidth: true,
                btnInfo: btnInfo,
                // btnStatus,
                disabled: () => getDisabled,
                onClick: () => {
                  setActiveStep(RedPacketStep.Main);
                  // onNFTMintClick(tradeData);
                },
              }}
            />
          </Box>
        </Box>
      </RedPacketBoxStyle>
    );
  }
);
