import { NFTMetaBlockProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  FormLabel,
  Grid,
  GridProps,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  FeeInfo,
  MintTradeNFT,
  myLog,
  NFTMETA,
} from "@loopring-web/common-resources";
import { Button, InputSize, TextField } from "../../basic-lib";

import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { NFTInput } from "./BasicANFTTrade";

const TextareaAutosizeStyled = styled(TextareaAutosize)`
  line-height: 1.5em;
  background: (var(--opacity));
  color: var(--color-text-third);
  font-family: inherit;
  width: 100%;
` as typeof TextareaAutosize;
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
    [nftMeta, handleOnMetaChange]
  );
  const _handleOnNFTDataChange = React.useCallback(
    (_mintData: Partial<I>) => {
      debugger;
      handleOnNFTDataChange({ ...mintData, ..._mintData });
    },
    [handleOnNFTDataChange, mintData]
  );
  return (
    <GridStyle
      // className={walletMap ? "" : "loading"}
      container
      isMobile={isMobile}
      spacing={2}
      flex={1}
      //
    >
      <Grid item xs={12} md={6}>
        <TextField
          value={nftMeta.name}
          fullWidth
          required
          label={t("labelMintName")}
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
          label={t("labelMintCollection") + " " + "coming soon"}
          type={"text"}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label={t("labelMintRoyaltyPercentage")}
          inputProps={{ inputMode: "numeric", pattern: "[0-10]" }}
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
            label: t("labelNFTMintInputTitle"),
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
      <Grid item xs={12} md={12}>
        <FormLabel>
          <Typography variant={"body2"} paddingBottom={1}>
            {t("labelMintDescription")}
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

      <Grid item xs={12} md={12}>
        <FormLabel>
          <Typography variant={"body2"} paddingBottom={1}>
            {t("labelMintProperty")}
          </Typography>
        </FormLabel>
        <TextareaAutosizeStyled
          aria-label="NFT Description"
          minRows={5}
          onChange={(event) =>
            _handleOnMetaChange({
              description: event.target.value,
            } as unknown as Partial<T>)
          }
        />
      </Grid>

      {/*<Grid item xs={12} md={6}>*/}
      {/*  <img*/}
      {/*    alt={"NFT"}*/}
      {/*    width={"68"}*/}
      {/*    height={"69"}*/}
      {/*    style={{ objectFit: "contain" }}*/}
      {/*    src={nftMeta?.image?.replace(*/}
      {/*      IPFS_META_URL,*/}
      {/*      LOOPRING_URLs.IPFS_META_URL*/}
      {/*    )}*/}
      {/*  />*/}
      {/*</Grid>*/}

      <Grid item xs={12} marginTop={3} alignSelf={"stretch"}>
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
          disabled={getDisabled || nftMetaBtnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
        </Button>
      </Grid>
    </GridStyle>
  );
};
