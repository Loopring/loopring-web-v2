import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import {
  IpfsFile,
  IPFSSourceUpload,
  MintNFTBlock,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useNFTMint } from "../../../hooks/useractions/useNFTMint";
import React from "react";
import { useIPFS } from "../../../services/ipfs/useIpfs";
import { myLog, UIERROR_CODE } from "@loopring-web/common-resources";
import { ipfsService } from "../../../services/ipfs/ipfsService";
const MaxSize = 8000000;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const NFTMintPanel = () => {
  const [ipfsMediaSources, setIpfsMediaSources] = React.useState<IpfsFile[]>(
    []
  );
  const { nftMintProps, retryBtn } = useNFTMint();
  const { ipfsProvides } = useIPFS({
    handleSuccessUpload: () => {},
    handleFailedUpload: () => {},
  });
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
  const onFilesAdd = React.useCallback(
    (value: IpfsFile[]) => {
      setIpfsMediaSources((state) => {
        return [
          ...state,
          ...value.map((value, index) => {
            if (!value.isUpdateIPFS) {
              ipfsService.addFile({
                ipfs: ipfsProvides.ipfs,
                file: value.file,
                uniqueId: value.uniqueId,
              });
              value.isUpdateIPFS = true;
            }
            return value;
          }),
        ];
      });
    },
    [ipfsMediaSources]
  );
  const onDelete = React.useCallback(
    (index: number) => {
      const files = [...ipfsMediaSources];
      files.splice(index, 1);
      setIpfsMediaSources((state) => {
        return files;
      });
      // onDropAccepted(files.map((file) => file.file));
      // onChange(files);
    },
    [ipfsMediaSources]
  );
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
            <Box paddingX={5 / 2} position={"relative"} flex={1}>
              <IPFSSourceUpload
                value={ipfsMediaSources}
                maxSize={MaxSize}
                types={TYPES}
                onChange={onFilesAdd}
                onDelete={onDelete}
              />
            </Box>
            {/*<Box>{ipfsMediaSources.map(() => {})}</Box>*/}
          </StyleWrapper>
        </Grid>
        <Grid item xs={12} md={6} display={"flex"} flexDirection={"column"}>
          <StyleWrapper flex={1}>
            <MintNFTBlock
              handleOnNFTDataChange={() => {}}
              onNFTMintClick={nftMintProps.onNFTMintClick}
              tradeData={{
                image:
                  "ipfs:///bafybeidfjqmasnpu6z7gvn7l6wthdcyzxh5uystkky3xvutddbapchbopi/no-time-to-explain.jpeg",
                name: "",
                // royaltyPercentage: 2, // 0 - 10 for UI
                // nftId: undefined,
                // nftIdView: undefined,
                // description: "",
                // nftBalance: undefined,
                // collection: undefined,
              }}
              feeInfo={nftMintProps.feeInfo}
              handleFeeChange={nftMintProps.handleFeeChange}
              type={"NFT"}
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
