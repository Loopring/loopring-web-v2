import {
  Avatar,
  Box,
  CardContent,
  Checkbox,
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
  InputButtonProps,
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
  CoinInfo,
  EmptyValueTag,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  LuckyRedPacketItem,
  LuckyRedPacketList,
  REDPACKET_ORDER_LIMIT,
  RedPacketOrderData,
  SoursURL,
  TRADE_TYPE,
  TradeBtnStatus,
  GoodIcon,
  REDPACKET_ORDER_NFT_LIMIT,
  REDPACKET_SHOW_NFTS,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import {
  CreateRedPacketViewProps,
  RedPacketStep,
  SwitchData,
} from "../Interface";
import { MenuBtnStyled } from "../../styled";
import styled from "@emotion/styled";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";
import { BtnMain } from "./tool";
import * as sdk from "@loopring-web/loopring-sdk";
import moment from "moment";
import { NFTInput } from "./BasicANFTTrade";
import { DateTimeRangePicker } from "../../datetimerangepicker";
import BigNumber from "bignumber.js";

const StyledTextFiled = styled(TextField)``;

const RedPacketBoxStyle = styled(Box)`
  padding-top: ${({ theme }) => theme.unit}px;

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
    ...rest
  }: CreateRedPacketViewProps<T, I, F> & {
    selectedType: LuckyRedPacketItem;
  } & WithTranslation) => {
    const { t } = useTranslation("common");

    const inputButtonDefaultProps = {
      label:
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
          ? t("labelAmountEach")
          : t("labelRedPacketTotalAmount"),
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

    const inputNFTButtonDefaultProps: Partial<
      InputButtonProps<T, I, CoinInfo<I>>
    > = {
      label:
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
          ? t("labelAmountEach")
          : t("labelRedPacketTotalAmount"),
      decimalsLimit: 0,
      minimum,
      placeholderText: "0",
    };
    // const [dayValue, setDayValue] = React.useState<Moment | null>(moment());
    // const [durationValue, setDurationValue] = React.useState<number>(1);

    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const inputBtnRef = React.useRef();
    const inputSplitRef = React.useRef();
    const { total: redPacketTotalValue, splitValue } = React.useMemo(() => {
      // if (tradeType == TRADE_TYPE.TOKEN) {
      //
      // } else {
      //   const splitValue =
      //     selectedType.value.value == 2
      //       ? (tradeData?.tradeValue ?? 0) / (tradeData?.numbers ?? 1)
      //       : tradeData?.tradeValue ?? 0;
      //   return {
      //     total: tradeData.tradeValue ?? EmptyValueTag,
      //     splitValue: splitValue && EmptyValueTag,
      //   };
      // }
      if (tradeData?.tradeValue && tradeData.belong && tokenMap) {
        const splitValue =
          selectedType.value.partition == sdk.LuckyTokenAmountType.RANDOM
            ? sdk.toBig(tradeData?.tradeValue ?? 0).div(tradeData?.numbers ?? 1)
            : sdk.toBig(tradeData?.tradeValue ?? 0);
        const total =
          selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
            ? sdk
                .toBig(tradeData?.tradeValue ?? 0)
                .times(tradeData?.numbers ?? 0)
            : sdk.toBig(tradeData?.tradeValue ?? 0);
        if (tradeType == TRADE_TYPE.TOKEN) {
          return {
            total:
              getValuePrecisionThousand(
                total,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                tokenMap[tradeData?.belong as string].precision,
                false
                // { isFait: true }
              ) +
              " " +
              tradeData.belong,
            splitValue:
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
            total:
              getValuePrecisionThousand(
                total,
                0,
                0,
                1,
                false
                // { isFait: true }
              ) +
              " " +
              (total.gt(1) ? "NFTs" : "NFT"),
            splitValue:
              getValuePrecisionThousand(
                splitValue.toFixed(0, 1),
                0,
                0,
                1,
                false
                // { isFait: true }
              ) +
              " " +
              "NFT",
          };
        }
      } else {
        return {
          total: EmptyValueTag,
          splitValue:
            selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE &&
            EmptyValueTag,
        };
      }
    }, [
      tradeData,
      tradeData?.numbers,
      selectedType.value.partition,
      coinMap,
      tradeType,
    ]);
    const inputSplitProps = React.useMemo(() => {
      const inputSplitProps: any = {
        label:
          selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
            ? t("labelQuantity")
            : t("labelSplit"), //t("labelTokenAmount"),
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
      let inputSplitExtendProps = {},
        balance: any = undefined;
      if (tradeData?.tradeValue && Number(tradeData?.tradeValue) && maximum) {
        if (selectedType.value.partition === sdk.LuckyTokenAmountType.AVERAGE) {
          balance = sdk
            .toBig(tradeData?.balance ?? 0)
            .div(tradeData.tradeValue)
            .toFixed(0, 1);
        } else {
          balance = sdk
            .toBig(tradeData.tradeValue)
            .div(Number(minimum) ?? 1)
            .toFixed(0, 1);
        }

        balance = sdk.toBig(balance).lte(REDPACKET_ORDER_LIMIT)
          ? balance
          : REDPACKET_ORDER_LIMIT;

        inputSplitExtendProps = {
          // maxAllow: true,
          // subLabel: t("labelAvailable"),
          // handleError: (data: any) => {
          //   handleOnDataChange({
          //     numbers: data.tradeValue,
          //   } as unknown as Partial<T>);
          //   if (data.tradeValue && data.tradeValue > data.balance) {
          //     return {
          //       error: true,
          //     };
          //   }
          //   return {
          //     error: false,
          //   };
          // },
          inputData: {
            belong:
              selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                ? t("labelQuantity")
                : t("labelSplit"),
            tradeValue: tradeData?.numbers,
            balance: balance,
          },
        };
      } else {
        inputSplitExtendProps = {
          // maxAllow: false,
          // subLabel: "",
          // handleError: () => undefined,
          inputData: {
            belong:
              selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
                ? t("labelAmountEach")
                : t("labelSplit"),
            tradeValue: tradeData?.numbers,
            // count: tradeData?.numbers,
          },
        };
      }
      return {
        ...inputSplitProps,
        ...inputSplitExtendProps,
      };
    }, [
      tradeData?.numbers,
      selectedType.value.partition,
      maximum,
      minimum,
      tradeType,
    ]);
    const handleToggleChange = (value: F) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    };
    const _balance = React.useMemo(() => {
      if (
        tradeData.belong !== undefined &&
        // tradeData?.numbers &&
        // @ts-ignore
        // tradeData.numbers !== "0" &&
        tradeData.balance &&
        tradeType === TRADE_TYPE.NFT
      ) {
        if (selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE) {
          const value = BigNumber.min(
            tradeData.balance,
            REDPACKET_ORDER_NFT_LIMIT
          ).toString();
          return sdk
            .toBig(value)
            .div(
              tradeData?.numbers && tradeData?.numbers != 0
                ? tradeData?.numbers
                : 1
            )
            .toFixed(0, 1);
        } else {
          return BigNumber.min(
            tradeData.balance,
            REDPACKET_ORDER_NFT_LIMIT
          ).toString();
        }
      } else if (
        selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE &&
        tradeData.belong !== undefined &&
        tradeData?.numbers &&
        // @ts-ignore
        tradeData.numbers !== "0" &&
        tradeData.balance
      ) {
        return sdk.toBig(tradeData.balance).div(tradeData.numbers).toString();
      } else {
        return tradeData.balance;
      }
    }, [selectedType.value.partition, tradeData.balance, tradeData?.numbers]);
    const { isMobile } = useSettings();

    const startDateTime = tradeData.validSince
      ? moment(tradeData.validSince)
      : null;
    const endDateTime = tradeData.validUntil
      ? moment(tradeData.validUntil)
      : null;
    const now = moment();

    const startMinDateTime = endDateTime
      ? moment.max(now, endDateTime.clone().subtract(7, "days"))
      : now;
    const startMaxDateTime = endDateTime
      ? endDateTime.clone()
      : now.clone().add(1, "days");

    const endMinDateTime = startDateTime
      ? moment.max(now, startDateTime.clone())
      : now;
    const endMaxDateTime = startDateTime
      ? startDateTime.clone().add(7, "days")
      : undefined;

    // @ts-ignore
    return (
      <RedPacketBoxStyle className={"redPacket"} justifyContent={"center"}>
        <Box marginY={1} display={"flex"}>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            marginBottom={1}
          >
            <Typography
              component={"h4"}
              variant={isMobile ? "body1" : "h5"}
              whiteSpace={"pre"}
              marginRight={1}
            >
              {t(
                selectedType.value.mode == sdk.LuckyTokenClaimType.BLIND_BOX
                  ? "labelLuckyBlindBox"
                  : selectedType.value.mode == sdk.LuckyTokenClaimType.RELAY
                  ? "labelRelayRedPacket"
                  : selectedType.value.partition ==
                    sdk.LuckyTokenAmountType.AVERAGE
                  ? "labelRedPacketSendCommonTitle"
                  : "labelRedPacketSenRandomTitle"
              ) +
                " — " +
                t(`labelRedPacketViewType${tradeData?.type?.scope ?? 0}`)}
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
          {tradeType === "TOKEN" ? (
            <BasicACoinTrade
              {...{
                ...rest,
                t,

                type: tradeType ?? "TOKEN",
                disabled,
                walletMap,
                tradeData:
                  selectedType.value.partition ==
                    sdk.LuckyTokenAmountType.AVERAGE && tradeData?.numbers
                    ? {
                        ...tradeData,
                        balance: _balance,
                      }
                    : (tradeData as T),
                coinMap,
                inputButtonDefaultProps,
                inputBtnRef,
              }}
            />
          ) : (
            <NFTInput
              {...({
                ...rest,
                t,
                fullwidth: true,
                isThumb: true,
                isSelected: true,
                type: tradeType,
                subLabel: t("labelTokenNFTMaxRedPack"),
                disabled,
                tradeData: {
                  ...tradeData,
                  balance:
                    tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                      ? Math.min(
                          (tradeData.giftNumbers ?? 1) *
                            REDPACKET_ORDER_NFT_LIMIT,
                          tradeData.balance ?? 0
                        )
                      : Math.min(
                          (tradeData.numbers ?? 1) * REDPACKET_ORDER_NFT_LIMIT,
                          tradeData.balance ?? 0
                        ),
                },
                // @ts-ignore
                handleError: ({ belong, balance: _balance, tradeValue }: T) => {
                  // if (
                  //   (typeof tradeValue !== "undefined" &&
                  //     tradeData.balance &&
                  //     tradeData.balance < tradeValue) ||
                  //   (tradeValue && !tradeData?.balance)
                  // ) {
                  //   return {
                  //     error: true,
                  //     message: t("tokenNotEnough", { belong: belong }),
                  //   };
                  // } else if (
                  //   typeof tradeValue !== "undefined" &&
                  //   tradeData.balance &&
                  //   sdk
                  //     .toBig(tradeValue)
                  //     .div(
                  //       tradeData?.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                  //         ? (tradeData?.giftNumbers ?? 1)
                  //         : (tradeData.numbers ?? 1)
                  //       )
                  //     .gt(REDPACKET_ORDER_NFT_LIMIT)
                  // ) {
                  //   return {
                  //     error: true,
                  //     message: t("errorNFTRedPacketMaxError", {
                  //       value: REDPACKET_ORDER_NFT_LIMIT,
                  //       ns: ["error", "common"],
                  //     }),
                  //   };
                  // } else if (
                  //   typeof tradeValue !== "undefined" &&
                  //   sdk.toBig(tradeValue).gt(tradeData.balance ?? 0)
                  // ) {
                  //   return {
                  //     error: true,
                  //     message: t("tokenNotEnough", { belong: belong }),
                  //   };
                  // }
                  return { error: false, message: "" };
                },

                onChangeEvent: (
                  _index: 0 | 1,
                  { to, tradeData: newTradeData }: SwitchData<T>
                ) => {
                  if (_index === 1) {
                    handleOnDataChange({
                      collectionInfo: undefined,
                      tokenId: undefined,
                      tradeValue: undefined,
                      balance: undefined,
                      nftData: undefined,
                      belong: undefined,
                      image: undefined,
                    } as T);
                    setActiveStep(RedPacketStep.NFTList);
                  } else if (to === "button") {
                    handleOnDataChange({
                      tradeValue: newTradeData.tradeValue,
                      belong: newTradeData.belong,
                      balance: tradeData.balance,
                      nftData: newTradeData.nftData,
                    } as any);
                  }
                },
                inputNFTDefaultProps: inputNFTButtonDefaultProps,
                inputNFTRef: inputBtnRef,
              } as any)}
            />
          )}

          <Typography
            display={"flex"}
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
        </Box>
        {tradeType === TRADE_TYPE.NFT &&
          selectedType.value.mode === sdk.LuckyTokenClaimType.BLIND_BOX && (
            <Box
              marginY={1}
              display={"flex"}
              alignSelf={"stretch"}
              justifyContent={"stretch"}
              flexDirection={"column"}
              position={"relative"}
            >
              <InputCoin<any, I, any>
                // ref={inputSplitRef}
                label={t("labelBlindBoxRedPacketWithGift")}
                placeholderText={t("labelQuantity")}
                isHideError={false}
                isShowCoinInfo={false}
                // handleError={(data: any) => {
                //   handleOnDataChange({
                //     giftNumbers: data.tradeValue,
                //   } as unknown as Partial<T>);
                //   return {
                //     error:
                //       tradeData.giftNumbers &&
                //       tradeData.numbers &&
                //       tradeData.giftNumbers > tradeData.numbers
                //         ? true
                //         : false,
                //   };
                // }}
                name={"giftnumbers"}
                order={"right"}
                handleCountChange={(data) => {
                  handleOnDataChange({
                    giftNumbers: data.tradeValue,
                  } as unknown as Partial<T>);
                }}
                inputData={{
                  belong:
                    selectedType.value.partition ==
                    sdk.LuckyTokenAmountType.AVERAGE
                      ? t("labelQuantity")
                      : t("labelSplit"),
                  tradeValue: tradeData?.giftNumbers,
                }}
                coinMap={{}}
                coinPrecision={undefined}
                disabled={disabled}
                // inputError={
                //   tradeData.giftNumbers &&
                //   tradeData.numbers &&
                //   tradeData.giftNumbers > tradeData.numbers
                //     ? { error: true }
                //     : { error: false }
                // }
              />
            </Box>
          )}
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
          <StyledTextFiled
            label={
              <Typography component={"span"} color={"var(--color-text-third)"}>
                {t("labelRedPacketMemo")}
              </Typography>
            }
            value={tradeData.memo}
            onChange={(event) =>
              handleOnDataChange({
                memo: event.target.value, //event?.target?.value,
              } as unknown as Partial<T>)
            }
            size={"large"}
            inputProps={{
              placeholder: t("labelRedPacketMemoPlaceholder"),
              maxLength: 25,
            }}
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
              <Trans i18nKey={"labelRedPacketStart111"}>Active Time</Trans>
            </Typography>
          </FormLabel>
          <Box marginTop={1}>
            <DateTimeRangePicker
              startValue={startDateTime}
              startMinDateTime={startMinDateTime}
              startMaxDateTime={startMaxDateTime}
              onStartChange={(m) => {
                handleOnDataChange({
                  validSince: m ? m.toDate().getTime() : undefined,
                } as unknown as Partial<T>);
              }}
              onStartOpen={() => {
                handleOnDataChange({
                  validUntil: undefined,
                } as unknown as Partial<T>);
              }}
              endValue={endDateTime}
              endMinDateTime={endMinDateTime}
              endMaxDateTime={endMaxDateTime}
              onEndChange={(m) => {
                // debugger
                const maximunTimestamp = startDateTime
                  ? moment(startDateTime).add(7, "days").toDate().getTime()
                  : 0;
                handleOnDataChange({
                  validUntil: m
                    ? m.toDate().getTime() > maximunTimestamp
                      ? maximunTimestamp
                      : m.toDate().getTime()
                    : undefined,
                } as unknown as Partial<T>);
              }}
              customeEndInputPlaceHolder={
                tradeData.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX
                  ? t("labelBlindBoxEndDate2")
                  : undefined
              }
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
            <Typography component={"span"}>
              {t("labelFeeCalculating")}
            </Typography>
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
                        component={"span"}
                        marginLeft={1}
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
                  <Box display={"flex"} flexDirection={"column"}>
                    <Typography
                      component={"span"}
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
                  </Box>
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
            {selectedType.value.partition == sdk.LuckyTokenAmountType.AVERAGE
              ? t("labelRedPacketsSplitCommonDetail", { value: splitValue })
              : t("labelRedPacketsSplitLuckyDetail")}
          </Typography>
        </Box>
        <Box marginY={1} display={"flex"} alignSelf={"stretch"}>
          {lastFailed && (
            <Typography
              component={"span"}
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
                  validUntil: undefined,
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

        <Box marginTop={4} display={"flex"} alignSelf={"stretch"}>
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
            {tradeType === TRADE_TYPE.TOKEN
              ? t("labelBlindBoxExpirationExplainationForToken")
              : t("labelBlindBoxExpirationExplainationForNFT")}
          </Typography>
        </Box>
      </RedPacketBoxStyle>
    );
  }
) as <T extends Partial<RedPacketOrderData<I>>, I, F extends FeeInfo>(
  props: CreateRedPacketViewProps<T, I, F> & {
    selectedType: LuckyRedPacketItem;
  }
) => JSX.Element;

export const CreateRedPacketStepType = withTranslation()(
  <T extends RedPacketOrderData<I>, I, C = FeeInfo>({
    // handleOnSelectedType,
    tradeType,
    tradeData,
    handleOnDataChange,
    setActiveStep,
    selectedType,
    disabled = false,
    btnInfo,
    t,
  }: Omit<CreateRedPacketViewProps<T, I, C>, "tokenMap"> & {
    selectedType: LuckyRedPacketItem;
    // setSelectType: (value: LuckyRedPacketItem) => void;
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled;
    }, [disabled]);

    return (
      <RedPacketBoxStyle
        className={isMobile ? "mobile redPacket" : ""}
        justifyContent={"flex-start"}
        flexDirection={"column"}
        alignItems={"center"}
        width={"100%"}
        maxWidth={720}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          marginY={2}
        >
          {LuckyRedPacketList.filter((item) =>
            tradeType == TRADE_TYPE.NFT ? item.showInNFTS : item.showInERC20
          ).map((item: LuckyRedPacketItem, index) => {
            return (
              <React.Fragment key={index}>
                <Box key={item.value.value} marginBottom={1}>
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
              </React.Fragment>
            );
          })}
        </Box>
        {tradeType === TRADE_TYPE.NFT ? (
          <>
            <Box
              // onClick={() => {
              //   onChangePrivateChecked!();
              // }}
              style={{ cursor: "pointer" }}
              position={"relative"}
              marginBottom={10}
              display={"flex"}
              alignItems={"start"}
            >
              <Box position={"absolute"} left={8} top={5}>
                <Checkbox
                  style={{
                    padding: "0",
                  }}
                  checked
                  checkedIcon={
                    <GoodIcon htmlColor={"var(--color-primary)"}></GoodIcon>
                  }
                  icon={<GoodIcon htmlColor={"var(--color-third)"}></GoodIcon>}
                  color="default"
                />
              </Box>
              {/* <GoodIcon htmlColor={"var(--color-third)"}></GoodIcon> */}
              <Box display={"flex"} marginLeft={4} flexDirection={"column"}>
                <Typography
                  variant={"h5"}
                  display={"inline-flex"}
                  marginBottom={1 / 2}
                  alignItems={"flex-start"}
                  component={"span"}
                  style={{ cursor: "pointer" }}
                >
                  {t("labelBlindBoxPrivate")}
                </Typography>
                <Typography
                  variant={"body1"}
                  display={"inline-flex"}
                  justifyContent={"flex-start"}
                  component={"span"}
                  color={"var(--color-text-secondary)"}
                >
                  {t("labelBlindBoxPrivateDes")}
                </Typography>
              </Box>
            </Box>
            <Typography marginBottom={3} color={"var(--color-text-secondary)"}>
              {t("labelBlindBoxClaimWarning")}
            </Typography>
          </>
        ) : (
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
                      <Box display={"flex"} flexDirection={"column"}>
                        <Typography component={"span"}>
                          {t("labelLuckyTokenViewType" + key)}
                        </Typography>
                        <Typography
                          color={"var(--color-text-secondary)"}
                          variant={"body2"}
                          component={"span"}
                        >
                          {t("labelLuckyTokenViewTypeDes" + key)}
                        </Typography>
                      </Box>
                    }
                  />
                );
              })}
            </RadioGroup>
          </Box>
        )}
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
  }: Omit<CreateRedPacketViewProps<T, I, C>, "tradeData" | "tokenMap"> &
    WithTranslation) => {
    const { isMobile } = useSettings();
    const getDisabled = React.useMemo(() => {
      return disabled;
    }, [disabled]);

    return (
      <RedPacketBoxStyle
        display={"flex"}
        flexDirection={"column"}
        width={"100%"}
        maxWidth={720}
        paddingX={isMobile ? 2 : 10}
        className="modalConte"
        position={"absolute"}
        height={"100%"}
        maxHeight={"480px"}
        justifyContent={"space-evenly"}
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

                <Typography component={"span"} variant={"h5"} marginTop={2}>
                  {t("labelRedpacketTokens")}
                </Typography>
              </CardContent>
            </CardStyleItem>
          </Grid>
          <Grid item xs={6} display={"flex"} marginBottom={2}>
            {REDPACKET_SHOW_NFTS && (
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
                  <Typography component={"span"} variant={"h5"} marginTop={2}>
                    {t("labelRedpacketNFTS")}
                  </Typography>
                </CardContent>
              </CardStyleItem>
            )}
          </Grid>
        </Grid>
        <Box width={"100%"}>
          <BtnMain
            {...{
              defaultLabel: "labelContinue",
              fullWidth: true,
              btnInfo: btnInfo,
              disabled: () => getDisabled,
              onClick: () => {
                setActiveStep(RedPacketStep.ChooseType);
              },
            }}
          />
        </Box>
      </RedPacketBoxStyle>
    );
  }
);
