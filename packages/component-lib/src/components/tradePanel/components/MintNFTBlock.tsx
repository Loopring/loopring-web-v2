import { NFTMintViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, TextareaAutosize, Typography } from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  IPFS_META_URL,
  myLog,
  // MINT_LIMIT,
  TradeNFT,
} from "@loopring-web/common-resources";
import {
  Button,
  TextField,
  // TGItemData
} from "../../basic-lib";

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
const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }
  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid;
// const NFT_TYPE: TGItemData[] = [
//   {
//     value: NFTType.ERC1155,
//     key: "ERC1155",
//     label: "ERC1155",
//     disabled: false,
//   },
// ];
export const MintNFTBlock = <T extends TradeNFT<I>, I, C extends FeeInfo>({
  disabled,
  walletMap,
  tradeData,
  // title,
  // description,
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
}: NFTMintViewProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const styles = isMobile
    ? { flex: 1, width: "var(--swap-box-width)" }
    : { width: "var(--modal-width)" };

  // const popupState = usePopupState({
  //   variant: "popover",
  //   popupId: `popupId-nftMint`,
  // });
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
      className={walletMap ? "" : "loading"}
      style={styles}
      paddingBottom={3}
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
      <Grid item xs={12} height={68} display={"flex"} flexDirection={"row"}>
        <Box display={"flex"} flexDirection={"column"}>
          <Grid item xs={12}>
            <TextField label={"Name"}></TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type={"number"} label={"royalty Percentage"} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type={"number"} label={"amount"} />
          </Grid>
        </Box>
        <Box>
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
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant={"body1"}>description</Typography>
        <TextareaAutosizeStyled
          aria-label="NFT Description"
          minRows={5}
          disabled={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
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
      <Grid item marginTop={3} alignSelf={"stretch"}>
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
