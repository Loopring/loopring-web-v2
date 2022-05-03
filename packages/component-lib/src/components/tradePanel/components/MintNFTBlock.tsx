import { NFTMetaBlockProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  FormLabel,
  Grid,
  GridProps,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CoinInfo,
  CoinMap,
  FeeInfo,
  MintTradeNFT,
  myLog,
  NFTMETA,
} from "@loopring-web/common-resources";
import {
  Button,
  InputSize,
  TextField,
  TextareaAutosizeStyled,
  InputCoin,
} from "../../basic-lib";

import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { NFTInput } from "./BasicANFTTrade";
import { Properties } from "./tool/Property";

const GridStyle = styled(Grid)<GridProps & { isMobile: boolean }>`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }
  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
  .main-label,
  .sub-label {
    color: var(--color-text-secondary);
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as (props: GridProps & { isMobile: boolean }) => JSX.Element;

export const MintNFTBlock = <
  T extends Partial<NFTMETA>,
  I extends Partial<MintTradeNFT<any>>,
  C extends FeeInfo
>({
  disabled,
  nftMeta,
  mintData,
  btnInfo,
  nftMetaBtnStatus,
  handleOnMetaChange,
  handleMintDataChange,
  onMetaClick,
}: NFTMetaBlockProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const inputBtnRef = React.useRef();
  const getDisabled = React.useMemo(() => {
    return disabled || nftMetaBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, nftMetaBtnStatus]);
  myLog("mint nftMeta", nftMeta);

  const _handleMintDataChange = React.useCallback(
    (_mintData: Partial<I>) => {
      handleMintDataChange({ ..._mintData });
    },
    [handleMintDataChange]
  );
  // @ts-ignore
  return (
    <Box
      flex={1}
      flexDirection={"column"}
      display={"flex"}
      alignContent={"space-between"}
    >
      <GridStyle
        flex={1}
        display={"flex"}
        container
        isMobile={isMobile}
        spacing={2}
        alignContent={"flex-start"}
      >
        <Grid item xs={12} md={6}>
          <TextField
            value={nftMeta.name}
            fullWidth
            label={
              <Trans i18nKey={"labelMintName"}>
                Name
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"error"}
                >
                  {"\uFE61"}
                </Typography>
              </Trans>
            }
            type={"text"}
            onChange={(event) =>
              handleOnMetaChange({ name: event.target.value } as Partial<T>)
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            value={nftMeta.collection}
            fullWidth
            select
            disabled={true}
            label={
              <Tooltip
                title={t("labelMintCollectionTooltips").toString()}
                placement={"top"}
              >
                <Typography variant={"inherit"}>
                  <Trans i18nKey={"labelMintCollection"}>
                    Collection( "coming soon")
                    <i style={{ verticalAlign: "text" }}>{"\u2139"}</i>
                  </Trans>
                </Typography>
              </Tooltip>
            }
            type={"text"}
          >
            {[].map((_item, index) => (
              <Box key={index} />
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          {/*<TextField*/}
          {/*  sx={{ paddingTop: 1 / 2 }}*/}
          {/*  label={*/}

          {/*  }*/}
          {/*  inputProps={{*/}
          {/*    inputMode: "numeric",*/}
          {/*    pattern: "10|[0-9 ]",*/}
          {/*    startAdornment: <InputAdornment position="end">%</InputAdornment>,*/}
          {/*  }}*/}
          {/*  value={nftMeta.royaltyPercentage}*/}
          {/*  fullWidth*/}
          {/*  onChange={(event) =>*/}

          {/*  }*/}
          {/*/>*/}
          <InputCoin
            handleCountChange={(data) =>
              handleOnMetaChange({
                royaltyPercentage: data.tradeValue,
              } as unknown as Partial<T>)
            }
            {...{
              maxAllow: true,
              placeholderText: "0",
              allowDecimals: false,
              handleError: (data) => {
                if (data.tradeValue && data.tradeValue > data.balance) {
                  return {
                    error: true,
                    // message: `Not enough ${belong} perform a deposit`,
                  };
                }
                return {
                  error: false,
                };
              },
              // size = InputSize.middle,
              isHideError: true,
              isShowCoinInfo: false,
              isShowCoinIcon: false,
              order: "right",
              noBalance: "0",
              coinPrecision: 0,
              subLabel: t("labelMintRoyaltyPercentageRange"),
              label: (
                <Tooltip
                  title={t("labelMintRoyaltyPercentageTooltips").toString()}
                  placement={"top"}
                >
                  <Typography component={"span"} variant={"inherit"}>
                    <Trans i18nKey={"labelMintRoyaltyPercentage"}>
                      Royalty(%)
                      <i style={{ verticalAlign: "text" }}>{"\u2139"}</i>
                    </Trans>
                  </Typography>
                  {/*<Typography*/}
                  {/*  // component={"span"}*/}
                  {/*  variant={"inherit"}*/}
                  {/*  // display={"flex"}*/}
                  {/*  // lineHeight={1.5}*/}
                  {/*  // justifyContent={"space-between"}*/}
                  {/*>*/}
                  {/* */}
                  {/*  /!*<Typography component={"span"} variant={"inherit"}>*!/*/}
                  {/*  /!*  {t("labelMintRoyaltyPercentageRange")}*!/*/}
                  {/*  /!*</Typography>*!/*/}
                  {/*</Typography>*/}
                </Tooltip>
              ),
              size: InputSize.small,
              inputData: {
                balance: 10,
                tradeValue: nftMeta.royaltyPercentage,
                belong: "royaltyPercentage" as any,
              },

              coinMap: {} as CoinMap<I, CoinInfo<I>>,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NFTInput
            {...({ t } as any)}
            isThumb={false}
            isBalanceLimit={true}
            inputNFTDefaultProps={{
              subLabel: t("tokenNFTMaxMINT"),
              size: InputSize.small,
              isHideError: false,
              label: (
                <Trans i18nKey={"labelNFTMintInputTitle"}>
                  Amount
                  <Typography
                    component={"span"}
                    variant={"inherit"}
                    color={"error"}
                  >
                    {"\uFE61"}
                  </Typography>
                </Trans>
              ),
            }}
            // disabled={!(nftMintData.nftId && nftMintData.tokenAddress)}
            type={"NFT"}
            inputNFTRef={inputBtnRef}
            onChangeEvent={(_index, data) =>
              _handleMintDataChange({
                ...data.tradeData,
              } as unknown as Partial<I>)
            }
            handleError={(data) => {
              if (!data.tradeValue || data.tradeValue > data.balance) {
                return {
                  error: true,
                  // message: `Not enough ${belong} perform a deposit`,
                };
              }
              return {
                error: false,
              };
            }}
            // handleError={(data: I, ref) => {
            //   if (amountHandleError) {
            //     amountHandleError(data, ref);
            //   }
            // }}
            tradeData={
              {
                ...mintData,
                belong: mintData.tokenAddress ?? "NFT",
                balance: mintData.nftBalance,
              } as any
            }
            walletMap={{}}
          />
          {/*<TextField*/}
          {/*  value={nftMeta.nftBalance}*/}
          {/*  fullWidth*/}
          {/*  label={t("labelMintAmount")}*/}
          {/*  type={"number"}*/}
          {/*/>*/}
        </Grid>
        <Grid item xs={12} md={12} flex={1}>
          <FormLabel>
            <Tooltip
              title={t("labelMintDescriptionTooltips").toString()}
              placement={"top"}
            >
              <Typography
                variant={"body2"}
                component={"span"}
                lineHeight={"20px"}
              >
                <Trans i18nKey={"labelMintDescription"}>
                  Description
                  <i style={{ verticalAlign: "text" }}>{"\u2139"}</i>
                </Trans>
              </Typography>
            </Tooltip>
          </FormLabel>
          <TextareaAutosizeStyled
            aria-label="NFT Description"
            minRows={5}
            maxLength={2000}
            onChange={(event) =>
              handleOnMetaChange({
                description: event.target.value,
              } as unknown as Partial<T>)
            }
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <FormLabel>
            <Tooltip
              title={t("labelMintPropertyTooltips").toString()}
              placement={"top"}
            >
              <Typography
                component={"span"}
                variant={"body2"}
                lineHeight={"20px"}
              >
                <Trans i18nKey={"labelMintProperty"}>
                  Properties
                  <i style={{ verticalAlign: "text" }}>{"\u2139"}</i>
                </Trans>
              </Typography>
            </Tooltip>
          </FormLabel>
          <Box marginTop={1}>
            <Properties
              handleChange={(properties) =>
                handleOnMetaChange({
                  properties: properties,
                } as unknown as Partial<T>)
              }
              properties={nftMeta.properties ?? [{ key: "", value: "" }]}
            />
          </Box>
        </Grid>
        <Grid item xs={12} display={"flex"}>
          {btnInfo?.label === "labelNFTMintNoMetaBtn" && (
            <Typography
              color={"var(--color-warning)"}
              component={"p"}
              variant={"body1"}
              marginBottom={1}
              style={{ wordBreak: "break-all" }}
            >
              <Trans i18nKey={"labelNFTMintNoMetaDetail"}>
                Your NFT nftMeta should identify
                <em style={{ fontWeight: 600 }}>
                  name, image & royalty_percentage(number from 0 to 10)
                </em>
                .
              </Trans>
            </Typography>
          )}
          <Button
            fullWidth
            variant={"contained"}
            size={"medium"}
            color={"primary"}
            onClick={() => {
              onMetaClick(nftMeta as T);
            }}
            loading={
              !getDisabled && nftMetaBtnStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={
              getDisabled || nftMetaBtnStatus === TradeBtnStatus.LOADING
            }
          >
            {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMetaBtn`)}
          </Button>
        </Grid>
      </GridStyle>
    </Box>
  );
};
