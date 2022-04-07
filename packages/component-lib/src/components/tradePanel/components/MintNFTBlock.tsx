import { NFTMintViewWholeProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  Box,
  FormLabel,
  Grid,
  GridProps,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  IPFS_META_URL,
  myLog,
  NFTMETA,
} from "@loopring-web/common-resources";
import { Button, TextField } from "../../basic-lib";

import {
  LOOPRING_URLs,
  // NFTType
} from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";
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

export const MintNFTBlock = <T extends Partial<NFTMETA>, C extends FeeInfo>({
  disabled,
  tradeData,
  btnInfo,
  handleOnNFTDataChange,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  // isAvaiableId,
  // isNFTCheckLoading,
  onNFTMintClick,
}: NFTMintViewWholeProps<T, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  //
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  const _handleOnNFTDataChange = (_tradeData: T) => {
    if (handleOnNFTDataChange) {
      handleOnNFTDataChange({ ...tradeData, ..._tradeData });
    }
  };
  const getDisabled = React.useMemo(() => {
    return !!(disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED);
  }, [disabled, nftMintBtnStatus]);
  myLog("mint tradeData", tradeData);

  // @ts-ignore
  return (
    <GridStyle
      // className={walletMap ? "" : "loading"}
      container
      isMobile={isMobile}
      spacing={2}
      padding={5 / 2}
      flex={1}
      //
    >
      <Grid item xs={12} md={6}>
        <TextField
          value={tradeData.name}
          fullWidth
          required
          label={t("labelMintName")}
          type={"text"}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          value={tradeData.collection}
          fullWidth
          select
          label={t("labelMintCollection")}
          type={"text"}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          value={tradeData.nftBalance}
          fullWidth
          label={t("labelMintAmount")}
          type={"number"}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          value={tradeData.royaltyPercentage}
          label={t("labelMintRoyaltyPercentage")}
          fullWidth
          type={"number"}
        />
      </Grid>
      <Grid item xs={12}>
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
                {t("transferLabelFee")}：
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
                  : EmptyValueTag + " " + feeInfo?.belong}
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
      <Grid item xs={12} md={6}>
        <FormLabel>
          <Typography variant={"body2"} lineHeight={4}>
            {t("labelMintDescription")}
          </Typography>
        </FormLabel>
        <TextareaAutosizeStyled aria-label="NFT Description" minRows={5} />
      </Grid>

      <Grid item xs={12} md={6}>
        <img
          alt={"NFT"}
          width={"68"}
          height={"69"}
          style={{ objectFit: "contain" }}
          src={tradeData?.image?.replace(
            IPFS_META_URL,
            LOOPRING_URLs.IPFS_META_URL
          )}
        />
      </Grid>

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
              Your NFT metadata should identify
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
            onNFTMintClick(tradeData);
          }}
          loading={
            !getDisabled && nftMintBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || nftMintBtnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
        </Button>
      </Grid>
    </GridStyle>
  );
};
