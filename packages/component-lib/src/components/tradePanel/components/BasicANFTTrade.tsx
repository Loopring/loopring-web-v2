import {
  CoinInfo,
  CoinMap,
  getFormattedHash,
  IBData,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  myLog,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import React from "react";
import { BasicANFTTradeProps } from "./Interface";
import { InputCoin, InputSize } from "../../basic-lib";
import { Box, Link, Typography } from "@mui/material";
import styled from "@emotion/styled";

const BoxInput = styled(Box)`
  & .main-label {
    color: var(--color-text-secondary);
    font-size: ${({ theme }) => theme.fontDefault.body1};
  }
` as typeof Box;
export const BasicANFTTrade = <T extends IBData<I> & Partial<NFTWholeINFO>, I>({
  t,
  tradeData,
  onChangeEvent,
  disabled,
  isBalanceLimit = true,
  handleError,
  inputNFTRef,
  inputNFTProps,
  inputNFTDefaultProps,
  ...rest
}: BasicANFTTradeProps<T, I> & Omit<WithTranslation, "tReady" | "i18n">) => {
  const getDisabled = () => {
    if (disabled || tradeData === undefined) {
      return true;
    } else {
      return false;
    }
  };
  // myLog(tradeData)
  const handleCountChange: any = React.useCallback(
    (_tradeData: T, _name: string, _ref: any) => {
      //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
      if (tradeData.tradeValue !== _tradeData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...tradeData, ..._tradeData },
          to: "button",
        });
      }

      // onCoinValueChange(ibData);
    },
    [onChangeEvent, tradeData]
  );

  myLog("isBalanceLimit", isBalanceLimit, tradeData?.balance);
  if (typeof handleError !== "function") {
    handleError = ({ balance, tradeValue }: T) => {
      if (
        (isBalanceLimit &&
          !balance &&
          typeof tradeValue !== "undefined" &&
          isBalanceLimit &&
          balance < tradeValue) ||
        !tradeValue ||
        tradeValue < 1
      ) {
        return {
          error: true,
          message: t("tokenNotEnough", { belong: "NFT" }),
        };
      }
      return { error: false, message: "" };
    };
  }
  myLog("isBalanceLimit", isBalanceLimit);
  const inputCoinProps = {
    subLabel: t("labelAvailable"),
    placeholderText: "0",
    decimalsLimit: 0,
    allowDecimals: false,
    // size = InputSize.middle,
    isHideError: true,
    isShowCoinInfo: false,
    isShowCoinIcon: false,
    order: "right",
    noBalance: "0",
    // coinLabelStyle ,
    coinPrecision: 0,
    maxAllow: isBalanceLimit,
    handleError,
    handleCountChange,
    ...inputNFTDefaultProps,
    ...inputNFTProps,
    ...rest,
  };

  return (
    // @ts-ignore
    <InputCoin<T, I, CoinInfo<I>>
      ref={inputNFTRef}
      disabled={getDisabled()}
      {...{
        ...inputCoinProps,
        inputData: tradeData ? tradeData : ({} as T),
        coinMap: {} as CoinMap<I, CoinInfo<I>>,
      }}
    />
  );
};

export const NFTInput = React.memo(
  <T extends IBData<I> & Partial<NFTWholeINFO>, I>({
    isThumb,
    tradeData,
    t,
    isBalanceLimit,
    onCopy,
    inputNFTDefaultProps,
    inputNFTRef,
    type,
    disabled,
    ...rest
  }: BasicANFTTradeProps<T, I> &
    Omit<WithTranslation, "tReady" | "i18n"> & {
      onCopy?: (content: string) => Promise<void>;
      type?: "TOKEN" | "NFT";
    }) => {
    return (
      <>
        {isThumb ? (
          <Box
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            height={80}
            width={"100%"}
          >
            <Box display={"flex"} flexDirection={"column"}>
              <Typography
                variant={"body1"}
                color={"var(--color-text-secondary)"}
                className={"main-label"}
                paddingBottom={1 / 2}
              >
                {t(
                  typeof inputNFTDefaultProps?.label === "string"
                    ? inputNFTDefaultProps?.label
                    : "labelNFTTitle"
                )}
              </Typography>
              <Box
                display={"flex"}
                marginTop={1 / 2}
                flexDirection={"row"}
                alignItems={"center"}
              >
                {/*<img alt={'NFT'} width={'100%'} height={'100%'} src={popItem.image}/>*/}

                <Box
                  height={48}
                  minWidth={48}
                  borderRadius={1 / 2}
                  style={{ background: "var(--field-opacity)" }}
                  display={"flex-inline"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <img
                    alt={"NFT"}
                    width={"100%"}
                    height={"100%"}
                    src={tradeData?.image?.replace(
                      IPFS_META_URL,
                      IPFS_LOOPRING_SITE
                    )}
                  />
                </Box>
                <Box marginLeft={1}>
                  <Link
                    variant={"h5"}
                    onClick={() => {
                      window.open(
                        `${tradeData.etherscanBaseUrl}tx/${tradeData.tokenAddress}`
                      );
                      window.opener = null;
                    }}
                  >
                    {getFormattedHash(tradeData.tokenAddress)}
                  </Link>
                  <Typography variant={"body1"} paddingBottom={1 / 2}>
                    <Typography component={"span"} color={"text.secondary"}>
                      {t("labelNFTName")}
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"text.secondary"}
                      title={tradeData.nftId}
                    >
                      {tradeData.name}
                    </Typography>
                  </Typography>
                  <Typography variant={"body1"} paddingBottom={1 / 2}>
                    <Typography component={"span"} color={"text.secondary"}>
                      {t("labelNFTDescribe")}
                    </Typography>
                    <Typography
                      component={"span"}
                      color={"text.secondary"}
                      textOverflow={"ellipsis"}
                      whiteSpace={"break-spaces"}
                    >
                      {tradeData.description}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box maxWidth={120} marginLeft={1}>
              <BasicANFTTrade
                {...{
                  ...rest,
                  type,
                  t,
                  disabled,
                  walletMap: {},
                  tradeData,
                  isBalanceLimit,
                  // coinMap,
                  inputNFTDefaultProps: { label: "" },
                  // inputButtonDefaultProps,
                  inputNFTRef,
                }}
              />
            </Box>
          </Box>
        ) : (
          <BoxInput>
            <BasicANFTTrade
              {...{
                ...rest,
                type,
                t,
                disabled,
                walletMap: {},
                tradeData,
                inputNFTDefaultProps: {
                  ...{ size: InputSize.small, label: t("labelTokenAmount") },
                  ...inputNFTDefaultProps,
                },
                isBalanceLimit,
                inputNFTRef,
              }}
            />
          </BoxInput>
        )}
      </>
    );
  }
) as <T extends IBData<I> & Partial<NFTWholeINFO>, I>(
  props: BasicANFTTradeProps<T, I> &
    Omit<WithTranslation, "tReady" | "i18n"> & {
      onCopy?: (content: string) => Promise<void>;
      type?: "TOKEN" | "NFT";
    }
) => JSX.Element;
