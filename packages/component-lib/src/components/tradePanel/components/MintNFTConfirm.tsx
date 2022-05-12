import { NFTMintViewProps } from "./Interface";
import { useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography, Link, Tooltip } from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  getShortAddr,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  LinkIcon,
  MetaProperty,
  MintTradeNFT,
  myLog,
  NFTMETA,
  RowConfig,
  SoursURL,
} from "@loopring-web/common-resources";
import {
  Button,
  EmptyDefault,
  TextareaAutosizeStyled,
  Table,
  Column,
  NftImage,
} from "../../basic-lib";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
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
const TableStyle = styled(Table)`
  &.rdg {
    min-height: 60px;
    height: ${(props: any) => {
      if (props.currentheight) {
        return props.currentheight + 2 + "px";
      } else {
        return "100%";
      }
    }};
  }
` as typeof Table;

export const MintNFTConfirm = <
  // T extends NFT_MINT_VALUE<I>,
  ME extends Partial<NFTMETA>,
  MI extends Partial<MintTradeNFT<any>>,
  I,
  C extends FeeInfo
>({
  disabled,
  tradeData: nftMintData,
  metaData,
  btnInfo,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  onNFTMintClick,
  mintService,
}: NFTMintViewProps<ME, MI, I, C>) => {
  const { t, ...rest } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const getDisabled = React.useMemo(() => {
    return disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, nftMintBtnStatus]);

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  const rawData =
    metaData.properties?.reduce((prev, item) => {
      if (!!item.key?.trim() && !!item.value?.trim()) {
        return [...prev, item];
      } else {
        return prev;
      }
    }, [] as Array<MetaProperty>) ?? [];

  myLog("mint nftMintData", nftMintData);

  // @ts-ignore
  return (
    <Box
      flex={1}
      flexDirection={"column"}
      display={"flex"}
      alignContent={"space-between"}
      padding={5 / 2}
    >
      <GridStyle container flex={1} spacing={2}>
        <Grid item xs={12} md={5} alignItems={"center"}>
          <Box>
            <Grid container maxWidth={"inherit"} spacing={2}>
              <Grid item xs={12}>
                <Box
                  flex={1}
                  display={"flex"}
                  position={"relative"}
                  width={"auto"}
                  minHeight={200}
                >
                  <img
                    style={{
                      opacity: 0,
                      width: "100%",
                      padding: 16,
                      height: "100%",
                      display: "block",
                    }}
                    alt={"ipfs"}
                    src={SoursURL + "svg/ipfs.svg"}
                  />
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0,
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    {metaData.image ? (
                      <Box
                        alignSelf={"stretch"}
                        flex={1}
                        display={"flex"}
                        style={{ background: "var(--field-opacity)" }}
                        alignItems={"center"}
                        height={"100%"}
                        justifyContent={"center"}
                      >
                        <NftImage
                          alt={"NFT"}
                          src={metaData?.image?.replace(
                            IPFS_META_URL,
                            IPFS_LOOPRING_SITE
                          )}
                          onError={() => undefined}
                        />
                      </Box>
                    ) : (
                      <Box
                        flex={1}
                        display={"flex"}
                        alignItems={"center"}
                        height={"100%"}
                        justifyContent={"center"}
                      >
                        <EmptyDefault
                          // width={"100%"}
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
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
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
                        {t("transferLabelFee")}：
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
                          color={"textSecondary"}
                          marginRight={2}
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
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography component={"h4"} variant={"h5"} marginBottom={2}>
            {t("labelConfirmMint")}
          </Typography>
          <Box>
            <Grid container maxWidth={"inherit"} spacing={2}>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography
                  display={"inline-flex"}
                  flexDirection={isMobile ? "column" : "row"}
                  variant={"body1"}
                >
                  <Typography color={"textSecondary"} marginRight={1}>
                    {t("labelNFTName")}
                  </Typography>
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    title={metaData.name}
                  >
                    {metaData.name ?? EmptyValueTag}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography
                  display={"inline-flex"}
                  flexDirection={isMobile ? "column" : "row"}
                  variant={"body1"}
                >
                  <Typography color={"textSecondary"} marginRight={1}>
                    {t("labelNFTID")}
                  </Typography>
                  <Tooltip title={() => nftMintData.nftId}>
                    <Link
                      whiteSpace={"break-spaces"}
                      style={{
                        wordBreak: "break-all",
                        color: "var(--color-text-third)",
                      }}
                      display={"inline-flex"}
                      title={nftMintData.nftId}
                      href={`${IPFS_LOOPRING_SITE}${nftMintData.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      #
                      {" " +
                        getShortAddr(
                          nftMintData?.nftIdView
                            ? nftMintData.nftIdView
                            : nftMintData.nftId ?? ""
                        )}{" "}
                      <LinkIcon color={"inherit"} fontSize={"medium"} />
                    </Link>
                  </Tooltip>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography
                  display={"inline-flex"}
                  flexDirection={isMobile ? "column" : "row"}
                  variant={"body1"}
                >
                  <Typography color={"textSecondary"} marginRight={1}>
                    {t("labelNFTContractAddress")}
                  </Typography>
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                  >
                    {nftMintData.tokenAddress}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography
                  display={"inline-flex"}
                  flexDirection={isMobile ? "column" : "row"}
                  variant={"body1"}
                >
                  <Typography color={"textSecondary"} marginRight={1}>
                    {t("labelNFTType")}
                  </Typography>
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    title={"ERC1155"}
                  >
                    {"ERC1155"}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  display={"inline-flex"}
                  flexDirection={isMobile ? "column" : "row"}
                  variant={"body1"}
                >
                  <Typography color={"textSecondary"} marginRight={1}>
                    {t("labelNFTAmount")}
                  </Typography>
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    title={"ERC1155"}
                  >
                    {nftMintData.tradeValue}
                  </Typography>
                </Typography>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography color={"textSecondary"} marginRight={1}>
                  {t("labelNFTDescription")}
                </Typography>
                <Box flex={1}>
                  {metaData.description ? (
                    <TextareaAutosizeStyled
                      aria-label="NFT Description"
                      minRows={2}
                      maxRows={5}
                      disabled={true}
                      value={metaData.description}
                    />
                  ) : (
                    <Typography
                      color={"var(--color-text-third)"}
                      whiteSpace={"break-spaces"}
                      style={{ wordBreak: "break-all" }}
                      title={"ERC1155"}
                    >
                      {EmptyValueTag}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography variant={"body1"} color={"textSecondary"}>
                  {t("labelNFTProperty")}
                </Typography>
                {rawData.length ? (
                  <Box
                    marginTop={1}
                    sx={{ backgroundColor: "var(--color-global-bg)" }}
                  >
                    <TableStyle
                      className={"properties_table"}
                      rawData={rawData}
                      {...{
                        ...rest,
                        tReady: true,
                        t,
                        currentheight:
                          (rawData.length + 1) * RowConfig.rowHeight,
                        columnMode: [
                          {
                            key: "key",
                            name: t("labelMintPropertyKey"),
                            // formatter: ({ row }: any) => <>{row?.key}</>,
                          },
                          {
                            key: "value",
                            name: t("labelMintPropertyValue"),
                            // formatter: ({ row }: any) => <>{row?.value}</>,
                          },
                        ],
                        generateRows: (rawData: any) => rawData,
                        generateColumns: ({ columnsRaw }: any) =>
                          columnsRaw as Column<any, unknown>[],
                      }}
                    />
                  </Box>
                ) : (
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    title={"ERC1155"}
                  >
                    {EmptyValueTag}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={4} alignSelf={"stretch"}>
                <Button
                  fullWidth
                  variant={"outlined"}
                  size={"medium"}
                  sx={{ height: 40 }}
                  color={"primary"}
                  onClick={() => {
                    mintService.backMetaDataSetup();
                  }}
                >
                  {t("labelCancel")}
                </Button>
              </Grid>
              <Grid item xs={8} alignSelf={"stretch"}>
                <Button
                  fullWidth
                  variant={"contained"}
                  size={"medium"}
                  color={"primary"}
                  onClick={() => {
                    onNFTMintClick();
                  }}
                  loading={
                    !getDisabled && nftMintBtnStatus === TradeBtnStatus.LOADING
                      ? "true"
                      : "false"
                  }
                  disabled={
                    getDisabled || nftMintBtnStatus === TradeBtnStatus.LOADING
                  }
                >
                  {btnInfo
                    ? t(btnInfo.label, btnInfo.params)
                    : t(`labelNFTMintBtn`)}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </GridStyle>
    </Box>
  );
};
