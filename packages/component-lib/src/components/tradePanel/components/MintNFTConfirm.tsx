import { NFTMintViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography, Link } from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  IBData,
  IPFS_META_URL,
  MintTradeNFT,
  myLog,
  NFTMETA,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import {
  Button,
  EmptyDefault,
  InputSize,
  TextareaAutosizeStyled,
  TGItemData,
} from "../../basic-lib";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import { LOOPRING_URLs, NFTType } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { FeeToggle } from "./tool/FeeList";
import { useSettings } from "../../../stores";

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }
  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid;
const NFT_TYPE: TGItemData[] = [
  {
    value: NFTType.ERC1155,
    key: "ERC1155",
    label: "ERC1155",
    disabled: false,
  },
];
export const MintNFTConfirm = <
  // T extends NFT_MINT_VALUE<I>,
  ME extends Partial<NFTMETA>,
  MI extends Partial<MintTradeNFT<any>>,
  I,
  C extends FeeInfo
>({
  disabled,
  walletMap,
  tradeData: nftMintData,
  metaData,
  title,
  btnInfo,
  handleOnNFTDataChange,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  onNFTMintClick,
}: NFTMintViewProps<ME, MI, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const styles = isMobile
    ? { flex: 1, width: "var(--swap-box-width)" }
    : { width: "var(--modal-width)" };

  const inputBtnRef = React.useRef();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const getDisabled = React.useMemo(() => {
    return !!(disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED);
  }, [disabled, nftMintBtnStatus]);

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };

  myLog("mint nftMintData", nftMintData);

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
      <Grid item xs={12}>
        <Typography
          component={"h4"}
          variant={"h3"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          {title ? title : t("nftMintTitle")}
        </Typography>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Typography
          display={"inline-flex"}
          flexDirection={isMobile ? "column" : "row"}
          variant={"body1"}
          marginTop={2}
        >
          <Typography color={"var(--color-text-third)"} width={150}>
            {t("labelNFTName")}
          </Typography>
          <Typography
            color={"var(--color-text-secondary)"}
            title={metaData.name}
          >
            {metaData.name ?? EmptyValueTag}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          flexDirection={isMobile ? "column" : "row"}
          variant={"body1"}
          marginTop={2}
        >
          <Typography color={"var(--color-text-third)"} width={150}>
            {t("labelNFTID")}
          </Typography>
          <Link
            fontSize={"inherit"}
            whiteSpace={"break-spaces"}
            style={{ wordBreak: "break-all" }}
            target="_blank"
            rel="noopener noreferrer"
            href={`${LOOPRING_URLs.IPFS_META_URL} ${nftMintData.cid}`}
            title={nftMintData.nftId}
            width={"fit-content"}
          >
            {nftMintData.nftId ? nftMintData?.nftIdView : ""}
          </Link>
        </Typography>

        {/*<Typography*/}
        {/*  display={"inline-flex"}*/}
        {/*  flexDirection={isMobile ? "column" : "row"}*/}
        {/*  variant={"body1"}*/}
        {/*  marginTop={2}*/}
        {/*>*/}
        {/*  <Typography color={"var(--color-text-third)"} width={150}>*/}
        {/*    {t("labelNFTTYPE")}*/}
        {/*  </Typography>*/}
        {/*  <Typography*/}
        {/*    color={"var(--color-text-secondary)"}*/}
        {/*    title={nftMintData.nftType}*/}
        {/*  >*/}
        {/*    {nftMintData.nftType}*/}
        {/*  </Typography>*/}
        {/*</Typography>*/}
        <Typography
          display={"inline-flex"}
          flexDirection={isMobile ? "column" : "row"}
          variant={"body1"}
          marginTop={2}
        >
          <Typography color={"var(--color-text-third)"} width={150}>
            {t("labelNFTContractAddress")}
          </Typography>
          <Typography
            fontSize={"inherit"}
            whiteSpace={"break-spaces"}
            style={{ wordBreak: "break-all" }}
          >
            {nftMintData.tokenAddress}
          </Typography>
        </Typography>

        <Typography
          display={"inline-flex"}
          flexDirection={isMobile ? "column" : "row"}
          variant={"body1"}
          marginTop={2}
          flex={1}
        >
          <Typography color={"var(--color-text-third)"} width={150}>
            {t("labelNFTDescription")}
          </Typography>
          <Box flex={1}>
            <TextareaAutosizeStyled
              aria-label="NFT Description"
              minRows={5}
              disabled={true}
              value={metaData.description ?? EmptyValueTag}
            />
          </Box>
        </Typography>
      </Grid>
      <Grid item /* marginTop={2} */ alignSelf={"stretch"} marginTop={2}>
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

      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignContent={"center"}
        >
          <Box>
            <Box>
              <Typography
                color={"textSecondary"}
                marginBottom={2}
                variant={"body1"}
                display={"flex"}
                flexDirection={"column"}
                whiteSpace={"pre-line"}
                maxWidth={240}
              >
                {t("labelNFTName") +
                  " " +
                  (nftMintData.nftId
                    ? metaData.name ?? t("labelUnknown").toUpperCase()
                    : EmptyValueTag)}
              </Typography>
              <Typography
                color={"textSecondary"}
                marginBottom={2}
                variant={"body1"}
              >
                {t("labelNFTType") + " "} {NFT_TYPE[0].label}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"flex-start"}
            >
              <NFTInput<
                MI extends IBData<I> & Partial<NFTWholeINFO>
                  ? MI
                  : IBData<I> & Partial<NFTWholeINFO>,
                I
              >
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
                  handleOnNFTDataChange({
                    ...data.tradeData,
                  } as MI)
                }
                nftMintData={
                  {
                    ...nftMintData,
                    belong: nftMintData.tokenAddress ?? "NFT",
                  } as any
                }
                walletMap={walletMap}
              />
            </Box>
          </Box>
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {nftMintData.nftId && metaData.image ? (
              <img
                alt={"NFT"}
                width={"100%"}
                height={"100%"}
                src={metaData.image?.replace(
                  IPFS_META_URL,
                  LOOPRING_URLs.IPFS_META_URL
                )}
              />
            ) : (
              <EmptyDefault
                height={"100%"}
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {t("labelNoContent")}
                  </Box>
                )}
              />
            )}
          </Box>
        </Box>
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
            onNFTMintClick(nftMintData);
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
