import { NFTMintViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  IBData,
  IPFS_META_URL,
  MintTradeNFT,
  myLog,
  NFTMETA,
  NFTWholeINFO,
  SoursURL,
} from "@loopring-web/common-resources";
import {
  Button,
  EmptyDefault,
  InputSize,
  TextareaAutosizeStyled,
  // TGItemData,
} from "../../basic-lib";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import {
  LOOPRING_URLs,
  // NFTType
} from "@loopring-web/loopring-sdk";
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
// const NFT_TYPE: TGItemData[] = [
//   {
//     value: NFTType.ERC1155,
//     key: "ERC1155",
//     label: "ERC1155",
//     disabled: false,
//   },
// ];
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
  btnInfo,
  handleMintDataChange,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  onNFTMintClick,
}: NFTMintViewProps<ME, MI, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  // const styles = isMobile
  //   ? { flex: 1, width: "var(--swap-box-width)" }
  //   : { width: "var(--modal-width)" };

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
    <Box
      flex={1}
      flexDirection={"column"}
      display={"flex"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      alignContent={"space-between"}
      paddingTop={5 / 2}
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
                        flex={1}
                        display={"flex"}
                        alignItems={"center"}
                        height={"100%"}
                        justifyContent={"center"}
                      >
                        <img
                          alt={"NFT"}
                          width={"100%"}
                          height={"100%"}
                          src={metaData?.image?.replace(
                            IPFS_META_URL,
                            LOOPRING_URLs.IPFS_META_URL
                          )}
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
              <Grid item xs={12}>
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
                    handleMintDataChange({
                      ...data.tradeData,
                    } as MI)
                  }
                  nftMintData={
                    {
                      ...nftMintData,
                      belong: nftMintData.tokenAddress ?? "NFT",
                      balance: nftMintData.nftBalance,
                    } as any
                  }
                  walletMap={walletMap}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
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
                  <Typography
                    color={"var(--color-text-third)"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    title={nftMintData.nftId}
                  >
                    {nftMintData.nftId ? nftMintData?.nftIdView : ""}
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
                <Typography color={"textSecondary"} marginRight={1}>
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
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
                <Typography variant={"body1"} color={"textSecondary"}>
                  {t("labelNFTProperty")}
                </Typography>
                <Box marginTop={1}>
                  {metaData.properties?.map((item, index) => {
                    return (
                      item.key && (
                        <Typography
                          color={"var(--color-text-third)"}
                          whiteSpace={"break-spaces"}
                          style={{ wordBreak: "break-all" }}
                          component={"p"}
                          variant={"body1"}
                          key={index.toString() + item.key}
                        >
                          <Typography component={"span"} paddingRight={1}>
                            {item.key}:
                          </Typography>
                          <Typography component={"span"}>
                            {item.value}
                          </Typography>
                        </Typography>
                      )
                    );
                  })}
                </Box>
              </Grid>
              <Grid item xs={12} alignSelf={"stretch"}>
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
