import {
  Box,
  BoxProps,
  Link,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import {
  EmptyValueTag,
  getShortAddr,
  IPFS_META_URL,
  LoadingIcon,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import {
  Button,
  ModalBackButton,
  TransferPanel,
  WithdrawPanel,
  DeployNFTWrap,
  InformationForNoMetaNFT,
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
import { useTheme } from "@emotion/react";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";

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
const BoxStyle = styled(Box)<
  { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
>`
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
    .nft-trade {
      .container {
        width: 320px;
      }
    }
  }
  ${({ isMobile, image }) => `
     ${
       isMobile &&
       `
       position:relative; 
       margin-top: -10px;
      
       .MuiBox-root{
        z-index:2
       } 
       &:before{
         z-index:1;
         position:absolute;
         filter: blur(3px);
         background:url(${
           image
             ? image.replace(IPFS_META_URL, LOOPRING_URLs.IPFS_META_URL)
             : ""
         }) no-repeat 50% 10px;
          background-size: contain;
         opacity: 0.08;
         content:'';
         height: 100vh;
         width: 50%;
         display:block;
         height:100%;
         width:100%;
         
       }
       
       
     `
     }
  `}
` as (
  props: { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
) => JSX.Element;
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
    const { isMobile } = useSettings();

    const [showDialog, setShowDialog] =
      React.useState<string | undefined>(undefined);
    const [viewPage, setViewPage] = React.useState<number>(0);
    const [isKnowNFTNoMeta, setIsKnowNFTNoMeta] = React.useState<boolean>(
      !!(popItem?.name !== "" && popItem.image && popItem.image !== "")
    );
    React.useEffect(() => {
      setIsKnowNFTNoMeta((_state) => {
        return !!(popItem.name !== "" && popItem.image && popItem.image !== "");
      });
    }, [popItem.name, popItem.image]);

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
          <InformationForNoMetaNFT
            open={!!showDialog}
            method={showDialog}
            handleClose={(e, isAgress) => {
              setShowDialog(undefined);
              if (isAgress && showDialog) {
                switch (showDialog?.toLowerCase()) {
                  case "withdraw":
                    handleChangeIndex(2);
                    break;
                  case "transfer":
                    handleChangeIndex(1);
                    break;
                }
              }
            }}
          />

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
                title={popItem?.name}
              >
                {popItem?.name ?? EmptyValueTag}
              </Typography>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={2}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTTOTAL")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                title={popItem?.name}
              >
                {popItem?.total}
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
              <Typography
                color={"var(--color-text-secondary)"}
                title={popItem?.nftId}
                width={"fit-content"}
              >
                {popItem?.nftIdView ?? ""}
              </Typography>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={2}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
                {t("labelNFTTYPE")}
              </Typography>
              <Typography
                color={"var(--color-text-secondary)"}
                title={popItem?.nftType}
              >
                {popItem?.nftType}
              </Typography>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={2}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
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
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={2}
            >
              <Typography color={"var(--color-text-third)"} width={150}>
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
                  value={popItem.description ?? EmptyValueTag}
                />
              </Box>
            </Typography>

            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              alignItems={"center"}
              variant={"body1"}
              marginTop={3}
              justifyContent={"space-between"}
            >
              <Box display={"flex"} flexDirection={"row"}>
                <Typography minWidth={100} marginRight={2}>
                  {popItem.isDeployed === "yes" ? (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
                      onClick={() => {
                        isKnowNFTNoMeta
                          ? handleChangeIndex(2)
                          : setShowDialog("Withdraw");
                      }}
                    >
                      {t("labelNFTWithdraw")}
                    </Button>
                  ) : popItem.isDeployed === "no" ? (
                    <Button
                      variant={"outlined"}
                      size={"medium"}
                      fullWidth
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
                      />
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
                    // disabled={isKnowNFTNoMeta ? true : false}
                    onClick={() =>
                      isKnowNFTNoMeta
                        ? handleChangeIndex(1)
                        : setShowDialog("Transfer")
                    }
                  >
                    {t("labelNFTTransfer")}
                  </Button>
                </Typography>
              </Box>
            </Typography>
          </Box>
        </Box>
      );
    }, [
      showDialog,
      popItem.nftId,
      popItem.name,
      popItem.total,
      popItem.nftIdView,
      popItem.nftType,
      popItem.tokenAddress,
      popItem.minter,
      popItem.description,
      popItem.isDeployed,
      t,
      isKnowNFTNoMeta,
      etherscanBaseUrl,
    ]);
    const theme = useTheme();
    const style = isMobile
      ? {
          width: 300,
          height: 300,
          margin: theme.unit,
          marginTop: 0,
          cursor: "pointer",
        }
      : {
          margin: theme.unit,
          marginTop: -4 * theme.unit,
          width: 570,
          height: 570,
          cursor: "pointer",
        };
    return (
      <>
        {!isMobile && (
          <BoxNFT
            display={"flex"}
            style={style}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <NFTMedia
              // ref={popItem.tokenId}
              item={popItem}
              onNFTReload={onNFTReload}
              onNFTError={onNFTError}
            />
          </BoxNFT>
        )}
        <BoxStyle
          isMobile={isMobile}
          image={popItem.image}
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
            <Box
              flex={1}
              width={320}
              className={"nft-trade"}
              paddingBottom={isMobile ? 3 : 0}
              marginTop={isMobile ? -4 : 0}
            >
              <TransferPanel<any, any>
                {...{
                  _width: 320,
                  type: "NFT",
                  _height: isMobile ? "auto" : 540,
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
            </Box>
          )}

          {viewPage === 2 && (
            <Box
              flex={1}
              width={320}
              className={"nft-trade"}
              paddingBottom={isMobile ? 2 : 0}
              marginTop={isMobile ? -4 : 0}
            >
              <WithdrawPanel<any, any>
                {...{
                  _width: 320,
                  type: "NFT",
                  _height: isMobile ? "auto" : 540,
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
              />{" "}
            </Box>
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
