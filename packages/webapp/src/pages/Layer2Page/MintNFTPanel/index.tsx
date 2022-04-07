import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import { IPFSSourceUpload, MintNFTBlock } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useChargeFees } from "../../../hooks/common/useChargeFees";
import * as sdk from "@loopring-web/loopring-sdk";
import { useNFTMint } from "../../../hooks/useractions/useNFTMint";
const MaxSize = 50;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const NFTMintPanel = () => {
  const ipfsMediaSource: File[] = [];
  const { nftMintProps, retryBtn } = useNFTMint();

  const { t } = useTranslation();
  // const {} = useChargeFees()
  // const {
  //   chargeFeeTokenList,
  //   isFeeNotEnough,
  //   checkFeeIsEnough,
  //   handleFeeChange,
  //   feeInfo,
  // } = useChargeFees({
  //   tokenAddress: tokenAddress?.toLowerCase(),
  //   requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
  //   updateData: (feeInfo, _chargeFeeList) => {
  //     updateNFTMintData({
  //       ...nftMintValue,
  //       fee: feeInfo,
  //     });
  //   },
  // });
  return (
    <Box flex={1} marginY={1}>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        <Grid item xs={12} md={6}>
          <StyleWrapper
            className={"MuiPaper-elevation2"}
            flex={1}
            display={"flex"}
            flexDirection={"column"}
            paddingBottom={5 / 2}
            height={"100%"}
          >
            <Typography component={"h3"} variant={"h5"} padding={5 / 2}>
              {t("labelLoadTitle", { types: TYPES })}
            </Typography>
            <Box paddingX={5 / 2} position={"relative"}>
              <IPFSSourceUpload
                value={ipfsMediaSource}
                onChange={() => {}}
                maxSize={MaxSize}
                types={TYPES}
              />
            </Box>
            <Box></Box>
          </StyleWrapper>
        </Grid>
        <Grid item xs={12} md={6} display={"flex"} flexDirection={"column"}>
          <StyleWrapper flex={1}>
            {/*<Typography component={"h3"} variant={"h4"} padding={5 / 2}>*/}
            {/*  {t("labelIPFSStep2")}*/}
            {/*</Typography>*/}
            {/*<Box flex={1}></Box>*/}
            <MintNFTBlock
              handleOnNFTDataChange={() => {}}
              onNFTMintClick={nftMintProps.onNFTMintClick}
              tradeData={{}}
              feeInfo={nftMintProps.feeInfo}
              handleFeeChange={nftMintProps.handleFeeChange}
            />
          </StyleWrapper>
        </Grid>
        <Grid item xs={12} md={6} display={"flex"} flexDirection={"column"}>
          <StyleWrapper flex={1} className={"MuiPaper-elevation2"}>
            <Typography component={"h3"} variant={"h4"} padding={5 / 2}>
              {t("labelIPFSStep2")}
            </Typography>
            <Box flex={1}></Box>
          </StyleWrapper>
        </Grid>
      </Grid>
    </Box>
  );
};
