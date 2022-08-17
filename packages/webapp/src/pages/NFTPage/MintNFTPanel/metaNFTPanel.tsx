import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  FormLabel,
  Grid,
  Typography,
} from "@mui/material";
import {
  DropdownIconStyled,
  IpfsFile,
  IPFSSourceUpload,
  MintNFTBlock,
  NFTMintProps,
  NFTMetaProps,
  NFTMetaBlockProps,
  TextareaAutosizeStyled,
  ImageUploadWrapper,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import {
  CheckBoxIcon,
  CheckedIcon,
  CollectionMeta,
  FeeInfo,
  MintTradeNFT,
  NFTMETA,
  TransErrorHelp,
} from "@loopring-web/common-resources";
import { LoopringAPI, NFT_MINT_VALUE, useSystem } from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";

const MaxSize = 10000000;

const TYPES = ["jpeg", "jpg", "gif", "png"];
export const MetaNFTPanel = <
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  Co extends CollectionMeta,
  I,
  C extends FeeInfo
>({
  nftMetaProps,
  nftMintProps,
  ipfsMediaSources,
  onFilesLoad,
  onDelete,
  nftMintValue,
  errorOnMeta,
}: // collectionInputProps,
Partial<NFTMetaBlockProps<Me, Co, Mi, C>> & {
  feeInfo: C;
  errorOnMeta: undefined | sdk.RESULT_INFO;
  nftMintValue: NFT_MINT_VALUE<I>;
  nftMintProps: NFTMintProps<Me, Mi, C>;
  nftMetaProps: NFTMetaProps<Me, Co, C>;
  onFilesLoad: (value: IpfsFile) => void;
  onDelete: () => void;
  ipfsMediaSources: IpfsFile | undefined;
}) => {
  const { t } = useTranslation("common");
  const { baseURL } = useSystem();
  const domain: string = LoopringAPI.delegate?.getCollectionDomain() ?? "";
  const [dropdownErrorStatus, setDropdownErrorStatus] =
    React.useState<"up" | "down">("down");

  return (
    <ImageUploadWrapper
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      marginBottom={2}
    >
      <Grid
        container
        spacing={5 / 2}
        paddingX={5 / 2}
        paddingTop={5 / 2}
        flex={1}
      >
        <Grid item xs={12} md={5} position={"relative"}>
          <FormLabel>
            <Typography variant={"body2"} marginBottom={1}>
              <Trans i18nKey={"labelIPFSUploadTitle"}>
                Upload Image
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"error"}
                >
                  {"\uFE61"}
                </Typography>
              </Trans>
            </Typography>
          </FormLabel>

          <IPFSSourceUpload
            fullSize={true}
            value={ipfsMediaSources}
            maxSize={MaxSize}
            types={TYPES}
            onChange={onFilesLoad}
            onDelete={onDelete}
          />
          <Box marginTop={1}>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={nftMetaProps.userAgree}
                  onChange={(_event: any, state: boolean) => {
                    nftMetaProps.handleUserAgree(state);
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color="default"
                />
              }
              label={t("labelUseIpfsMintAgree")}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={7} flex={1} display={"flex"}>
          <MintNFTBlock
            {...nftMetaProps}
            baseURL={baseURL}
            domain={domain}
            handleMintDataChange={nftMintProps.handleMintDataChange}
            nftMeta={nftMintValue.nftMETA as Me}
            mintData={nftMintValue.mintData as Mi}
            feeInfo={nftMintProps.feeInfo}
            handleFeeChange={nftMintProps.handleFeeChange}
          />
        </Grid>
        {errorOnMeta && (
          <Grid item xs={12} md={7} flex={1} display={"flex"}>
            <Typography
              marginX={3}
              whiteSpace={"pre-line"}
              variant={"body2"}
              color={"var(--color-text-third)"}
              component={"div"}
              marginBottom={2}
              alignSelf={"flex-center"}
              paddingX={1}
              marginY={1}
              textAlign={"center"}
            >
              <Typography
                variant={"inherit"}
                display={"inline-flex"}
                onClick={() =>
                  setDropdownErrorStatus((prev) =>
                    prev === "up" ? "down" : "up"
                  )
                }
              >
                {`${t("labelErrorTitle")}`}
                <TransErrorHelp error={errorOnMeta} />
                <DropdownIconStyled
                  status={dropdownErrorStatus}
                  fontSize={"medium"}
                />
              </Typography>

              {dropdownErrorStatus === "up" && (
                <TextareaAutosizeStyled
                  aria-label="NFT Description"
                  minRows={4}
                  disabled={true}
                  value={`${JSON.stringify(errorOnMeta)}}`}
                />
              )}

              {/*{\`Error Description:\\n {code: ${error?.code}, message:${error?.message}}\`}*/}
            </Typography>
          </Grid>
        )}
      </Grid>
    </ImageUploadWrapper>
  );
};
