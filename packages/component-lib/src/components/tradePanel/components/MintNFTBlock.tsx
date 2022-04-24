import { NFTMetaBlockProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, FormLabel, Grid, GridProps, Typography } from "@mui/material";
import {
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
} from "../../basic-lib";

import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { NFTInput } from "./BasicANFTTrade";

const GridStyle = styled(Grid)<GridProps & { isMobile: boolean }>`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }
  .MuiInputLabel-root {
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
  // isFeeNotEnough,
  // handleFeeChange,
  // chargeFeeTokenList,
  // feeInfo,
  // isAvaiableId,
  // isNFTCheckLoading,
  amountHandleError,
  handleOnNFTDataChange,
  handleOnMetaChange,
  onMetaClick,
}: NFTMetaBlockProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const inputBtnRef = React.useRef();
  const getDisabled = React.useMemo(() => {
    return !!(disabled || nftMetaBtnStatus === TradeBtnStatus.DISABLED);
  }, [disabled, nftMetaBtnStatus]);
  myLog("mint nftMeta", nftMeta);
  const _handleOnMetaChange = React.useCallback(
    (_nftMeta: Partial<T>) => {
      handleOnMetaChange({ ..._nftMeta });
    },
    [handleOnMetaChange]
  );
  const _handleOnNFTDataChange = React.useCallback(
    (_mintData: Partial<I>) => {
      handleOnNFTDataChange({ ..._mintData });
    },
    [handleOnNFTDataChange]
  );
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
              _handleOnMetaChange({ name: event.target.value } as Partial<T>)
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
              <Trans i18nKey={"labelMintCollection"}>
                Collection( "coming soon")
              </Trans>
            }
            type={"text"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label={
              <Trans i18nKey={"labelMintRoyaltyPercentage"}>
                Royalty Percentage
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"error"}
                >
                  {"\uFE61"}
                </Typography>
              </Trans>
            }
            inputProps={{ inputMode: "numeric", pattern: "[0-9]|10" }}
            value={nftMeta.royaltyPercentage}
            fullWidth
            onChange={(event) =>
              _handleOnMetaChange({
                royaltyPercentage: event.target.value,
              } as unknown as Partial<T>)
            }
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
              label: (
                <Trans i18nKey={"labelNFTMintInputTitle"}>
                  Mint Amount
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
              _handleOnNFTDataChange({
                tradeData: data.tradeData,
              } as unknown as Partial<I>)
            }
            handleError={(data: I, ref) => {
              if (amountHandleError) {
                amountHandleError(data, ref);
              }
            }}
            tradeData={
              {
                ...mintData,
                belong: mintData.tokenAddress ?? "NFT",
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
            <Typography variant={"body2"} lineHeight={"20px"}>
              <Trans i18nKey={"labelMintDescription"}>Description</Trans>
            </Typography>
          </FormLabel>
          <TextareaAutosizeStyled
            aria-label="NFT Description"
            minRows={5}
            maxLength={2000}
            onChange={(event) =>
              _handleOnMetaChange({
                description: event.target.value,
              } as unknown as Partial<T>)
            }
          />
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
            {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
          </Button>
        </Grid>
        {/* TODO: Properties*/}
        {/*<Grid item xs={12} md={12}>*/}
        {/*  <FormLabel>*/}
        {/*    <Typography variant={"body2"} lineHeight={"20px"}>*/}
        {/*      <Trans i18nKey={"labelMintProperty"}>Properties</Trans>*/}
        {/*    </Typography>*/}
        {/*  </FormLabel>*/}
        {/*  <TextareaAutosizeStyled*/}
        {/*    aria-label="NFT Description"*/}
        {/*    minRows={5}*/}
        {/*    onChange={(event) =>*/}
        {/*      _handleOnMetaChange({*/}
        {/*        description: event.target.value,*/}
        {/*      } as unknown as Partial<T>)*/}
        {/*    }*/}
        {/*  />*/}
        {/*</Grid>*/}
      </GridStyle>
    </Box>
  );
};
