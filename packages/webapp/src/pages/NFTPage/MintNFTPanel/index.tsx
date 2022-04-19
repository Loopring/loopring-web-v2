import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IpfsFile,
  IPFSSourceUpload,
  MintNFTBlock,
  FeeToggle,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { useNFTMint } from "hooks/useractions/useNFTMint";
import React from "react";
import { useIPFS, ipfsService, LoopringIPFSSite } from "services/ipfs";
import {
  EmptyValueTag,
  FeeInfo,
  NFTMETA,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
const MaxSize = 8000000;
const StyleWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Box;
const TYPES = ["jpeg", "jpg", "gif", "png"];
export const NFTMintPanel = <
  T extends Partial<NFTMETA>,
  C extends FeeInfo
>() => {
  const [ipfsMediaSources, setIpfsMediaSources] =
    React.useState<IpfsFile | null>(null);
  const { nftMintProps } = useNFTMint();
  const {
    feeInfo,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    handleOnNFTDataChange,
    tradeData,
  } = nftMintProps;
  const { ipfsProvides } = useIPFS({
    handleSuccessUpload: ({ cid, uniqueId, file }: any) => {
      setIpfsMediaSources((value) => {
        if (value && value?.uniqueId === uniqueId) {
          value.fullSrc = LoopringIPFSSite + `/ipfs/${cid}`;
          value.cid = cid;
          value.isProcessing = false;
        } else if (value) {
          value.error = {
            code: UIERROR_CODE.NOT_SAME_IPFS_RESOURCE,
            message: `current View ${value?.file.name} not equal to ipfsLoad ${file.name}`,
          };
          value.isProcessing = false;
        }
        return value;
      });
    },
    handleFailedUpload: () => {},
  });
  const { t } = useTranslation();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");

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
  const onFilesLoad = React.useCallback(
    (value: IpfsFile) => {
      ipfsService.addFile({
        ipfs: ipfsProvides.ipfs,
        file: value.file,
        uniqueId: value.uniqueId,
      });
      value.isUpdateIPFS = true;
    },
    [ipfsMediaSources]
  );
  const onDelete = React.useCallback(
    (index: number) => {
      setIpfsMediaSources(null);
    },
    [ipfsMediaSources]
  );
  return (
    <StyleWrapper
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      marginBottom={2}
    >
      <Typography component={"h3"} variant={"h4"} padding={5 / 2}>
        {t("labelMINTNFTTitle")}
      </Typography>
      <Grid container>
        <Grid item xs={12} md={5} paddingX={5 / 2} position={"relative"}>
          <Typography
            color={"var(--color-text-secondary)"}
            component={"h6"}
            variant={"body2"}
            minWidth={28}
            paddingBottom={1}
          >
            <Trans i18nKey={"labelIPFSUploadTitle"}>
              Upload Image
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"error"}
              >
                *
              </Typography>
            </Trans>
          </Typography>

          <IPFSSourceUpload
            fullSize={true}
            value={ipfsMediaSources}
            maxSize={MaxSize}
            types={TYPES}
            onChange={onFilesLoad}
            onDelete={onDelete}
          />

          <Box marginTop={1}>
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
                    {t("labelMINTNFTFee")}：
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
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
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
        </Grid>
      </Grid>
    </StyleWrapper>
  );
};
