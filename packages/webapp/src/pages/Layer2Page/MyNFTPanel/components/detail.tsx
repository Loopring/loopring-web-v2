import { Box, Link, TextareaAutosize, Typography } from "@mui/material";
import {
  EmptyValueTag,
  getShortAddr,
  LoadingIcon,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import {
  Button,
  ModalBackButton,
  TransferPanel,
  WithdrawPanel,
  DeployNFTWrap,
  useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { useNFTTransfer } from "hooks/useractions/useNFTTransfer";
import { useNFTWithdraw } from "hooks/useractions/useNFTWithdraw";
import { useNFTDeploy } from "hooks/useractions/useNFTDeploy";
import { useGetAssets } from "../../AssetPanel/hook";
import { NFTMedia } from "./nftMedia";

const BoxNFT = styled(Box)`
  background: var(--color-global-bg);
  img {
    object-fit: contain;
  }
` as typeof Box;
const TextareaAutosizeStyled = styled(TextareaAutosize)`
  &:disabled {
    line-height: 1.5em;
    border: 0;
    background: (var(--opacity));
    color: var(--color-text-third);
  }
  font-family: inherit;
  width: 100%;
` as typeof TextareaAutosize;
const BoxStyle = styled(Box)`
  &.nft-detail {
    .react-swipeable-view-container {
      & > div {
        min-width: 400px;
        padding-bottom: 0;
        word-break: break-all;
        white-space: break-spaces;
      }
    }
    .transfer-wrap {
      padding-left: 0;
      padding-right: 0;
    }
  }
` as typeof Box;
export const NFTDetail = withTranslation("common")(
  ({
    popItem,
    etherscanBaseUrl,
    onDetailClose,
    onNFTError,
    onNFTReload,
    t,
    ...rest
  }: {
    onDetailClose: () => void;
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
    onNFTReload: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
    onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
  } & WithTranslation) => {
    const { assetsRawData } = useGetAssets();

    const [viewPage, setViewPage] = React.useState<number>(0);

    const { nftTransferProps } = useNFTTransfer({
      isLocalShow: viewPage === 1,
      doTransferDone: onDetailClose,
    });
    const { nftWithdrawProps } = useNFTWithdraw({
      isLocalShow: viewPage === 2,
      doWithdrawDone: onDetailClose,
    });
    const { nftDeployProps } = useNFTDeploy({
      isLocalShow: viewPage === 3,
      doDeployDone: onDetailClose,
    });

    const handleChangeIndex = (index: number) => {
      setViewPage(index);
    };
    const detailView = React.useMemo(() => {
      return (
        <Box flexDirection={"column"} display={"flex"}>
          <Box marginBottom={3} display={"flex"} alignItems={"center"}>
            <Typography color={"text.primary"} variant={"h2"} marginTop={2}>
              # {" " + getShortAddr(popItem?.nftId ?? "")}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={4}
            paddingRight={3}
          >
            <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
              {t("labelNFTDetail")}
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTName")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.name}
              >
                {popItem?.name ?? EmptyValueTag}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTTOTAL")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.name}
              >
                {popItem?.total}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTID")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                maxWidth={300}
                title={popItem?.nftId}
              >
                {popItem?.nftIdView ?? ""}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTTYPE")}
              </Typography>
              <Typography
                color={"var(--color-text-third)"}
                title={popItem?.nftType}
              >
                {popItem?.nftType}
              </Typography>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTContractAddress")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() =>
                  window.open(
                    `${etherscanBaseUrl}token/${popItem.tokenAddress}?a=${popItem.nftId}`
                  )
                }
              >
                {popItem.tokenAddress}
              </Link>
            </Typography>
            <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTMinter")}
              </Typography>

              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() =>
                  window.open(`${etherscanBaseUrl}address/${popItem.minter}`)
                }
              >
                {popItem.minter}
              </Link>
            </Typography>

            <Typography
              display={"inline-flex"}
              variant={"body1"}
              marginTop={2}
              flex={1}
            >
              <Typography color={"var(--color-text-third)"} width={160}>
                {t("labelNFTDescription")}
              </Typography>
              <Box flex={1}>
                <TextareaAutosizeStyled
                  aria-label="NFT Description"
                  minRows={5}
                  disabled={true}
                  value={popItem.description ?? EmptyValueTag}
                />
              </Box>
            </Typography>

            <Typography
              display={"inline-flex"}
              alignItems={"center"}
              variant={"body1"}
              marginTop={3}
              justifyContent={"space-between"}
            >
              <Box display={"flex"} flexDirection={"row"}>
                <Typography minWidth={100} marginRight={2}>
                  {popItem.isDeployed === "yes" ? (
                    // popItem.
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      disabled={true}
                      onClick={() => handleChangeIndex(2)}
                    >
                      {t("labelNFTWithdraw")}
                    </Button>
                  ) : popItem.isDeployed === "no" ? (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      disabled={true}
                      onClick={() => handleChangeIndex(3)}
                    >
                      {t("labelNFTDeployContract")}
                    </Button>
                  ) : (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      disabled={true}
                    >
                      <LoadingIcon
                        color={"primary"}
                        style={{ width: 18, height: 18, marginRight: "8px" }}
                      />{" "}
                      {t("labelNFTDeploying")}
                    </Button>
                  )}
                </Typography>
                <Typography minWidth={100}>
                  <Button
                    variant={"contained"}
                    size={"small"}
                    color={"primary"}
                    fullWidth
                    disabled={true}
                    onClick={() => handleChangeIndex(1)}
                  >
                    {t("labelNFTTransfer")}
                  </Button>
                </Typography>
              </Box>
            </Typography>
          </Box>
        </Box>
      );
    }, [t, popItem, etherscanBaseUrl]);

    return (
      <>
        <BoxNFT
          display={"flex"}
          width={570}
          height={570}
          margin={1}
          marginTop={-4}
          alignItems={"center"}
          justifyContent={"center"}
          style={{ cursor: "pointer" }}
        >
          <NFTMedia
            // ref={popItem.tokenId}
            item={popItem}
            onNFTReload={onNFTReload}
            onNFTError={onNFTError}
          />
        </BoxNFT>
        <BoxStyle
          marginLeft={2}
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          alignItems={"center"}
          className={"nft-detail"}
          whiteSpace={"break-spaces"}
          style={{ wordBreak: "break-all" }}
        >
          {viewPage !== 0 && (
            <ModalBackButton
              marginTop={-3.5}
              onBack={() => handleChangeIndex(0)}
              {...{ ...rest, t }}
            />
          )}

          {viewPage === 0 && detailView}
          {viewPage === 1 && (
            <TransferPanel<any, any>
              {...{
                _width: 416,
                type: "NFT",
                _height: 540,
                isThumb: false,

                ...{
                  ...nftTransferProps,
                  tradeData: {
                    ...popItem,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                },
                assetsData: assetsRawData,
              }}
            />
          )}

          {viewPage === 2 && (
            <WithdrawPanel<any, any>
              {...{
                _width: 400,
                type: "NFT",
                _height: 540,
                isThumb: false,

                ...{
                  ...nftWithdrawProps,
                  tradeData: {
                    ...popItem,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                },
                assetsData: assetsRawData,
              }}
            />
          )}
          {viewPage === 3 && (
            <Box height={540} width={"100%"} paddingX={3} flex={1}>
              <DeployNFTWrap
                {...{
                  ...nftDeployProps,
                  tradeData: {
                    ...nftDeployProps.tradeData,
                    belong: popItem.nftData,
                    balance: Number(popItem?.nftBalance),
                  },
                  assetsData: assetsRawData,
                }}
              />
            </Box>
          )}
        </BoxStyle>
      </>
    );
  }
);
