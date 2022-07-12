import styled from "@emotion/styled";
import { Box, BoxProps, Link, Typography } from "@mui/material";
import {
  AssetsRawDataItem,
  EmptyValueTag,
  Explorer,
  getShortAddr,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  LinkIcon,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  Button,
  InformationForNoMetaNFT,
  TextareaAutosizeStyled,
  useOpenModals,
  useSettings,
  useToggle,
  NFTMedia,
  AccountStep,
} from "@loopring-web/component-lib";
import { useAccount } from "../../../stores";
import React from "react";
import { DEPLOYMENT_STATUS, NFTType } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";

const BoxNFT = styled(Box)`
  background: var(--color-global-bg);
  img {
    object-fit: contain;
  }
` as typeof Box;

const BoxStyle = styled(Box)<
  { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
>`
  &.nft-detail {
    margin-top: -26px;
    .detail-info {
      max-height: 520px;
      overflow-y: scroll;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* Internet Explorer 10+ */
      &::-webkit-scrollbar {
        /* WebKit */
        width: 0;
      }
    }
    .react-swipeable-view-container {
      & > div {
        align-items: center;
        padding-bottom: 0;
        word-break: break-all;
        white-space: break-spaces;
        min-width: 400px;
      }
    }
    .transfer-wrap {
      padding-left: 0;
      padding-right: 0;
    }
    .nft-trade {
      max-height: 520px;
      .container {
        width: 320px;
      }
    }
    .MuiToolbar-root {
      .back-btn {
        margin-left: ${({ theme }) => -4 * theme.unit}px;
      }
    }
  }
  &.nft-detail {
    ${({ isMobile, image }) => `
     ${
       isMobile &&
       `
       .detail-info{
          max-height:  initial;
        }
       .react-swipeable-view-container {
          & > div {
             min-width:  initial;
          }
        }
       position:relative;    
       width:auto; 
       .MuiBox-root{
        z-index:2
       } 
       &:before{
         z-index:1;
         position:absolute;
         filter: blur(3px);
         background:url(${
           image ? image.replace(IPFS_META_URL, IPFS_LOOPRING_SITE) : ""
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
       .MuiToolbar-root {
        .back-btn {
          margin-left: 0px;
        }
       } 
       
     `
     }
  `}
  }
` as (
  props: { isMobile: boolean } & BoxProps & Partial<NFTWholeINFO>
) => JSX.Element;

export const NFTDetail = withTranslation("common")(
  ({
    popItem,
    etherscanBaseUrl,
    t,
  }: {
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const { account } = useAccount();
    const {
      toggle: { deployNFT },
    } = useToggle();
    const { setShowAccount, setShowNFTDeploy, setShowTradeIsFrozen } =
      useOpenModals();

    const [showDialog, setShowDialog] =
      React.useState<string | undefined>(undefined);
    const [isKnowNFTNoMeta, setIsKnowNFTNoMeta] = React.useState<boolean>(
      !!(popItem?.name !== "" && popItem.image && popItem.image !== "")
    );

    let properties = popItem.properties
      ? typeof popItem.properties === "string"
        ? JSON.parse(popItem.properties)
        : popItem.properties
      : undefined;
    React.useEffect(() => {
      setIsKnowNFTNoMeta((_state) => {
        return !!(popItem.name !== "" && popItem.image && popItem.image !== "");
      });
    }, [popItem.name, popItem.image]);

    const detailView = React.useMemo(() => {
      return (
        <Box
          flexDirection={"column"}
          display={"flex"}
          className={"detail-info"}
          maxWidth={isMobile ? "var(--mobile-full-panel-width)" : 550}
        >
          <InformationForNoMetaNFT
            open={!!showDialog}
            method={showDialog}
            handleClose={(_e, isAgress) => {
              setShowDialog(undefined);
              if (isAgress && showDialog) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.SendNFTGateway,
                });
              }
            }}
          />
          <Box marginBottom={3} display={"flex"} alignItems={"center"}>
            <Typography color={"text.primary"} variant={"h2"} marginBottom={1}>
              {popItem?.name ?? EmptyValueTag}
            </Typography>
          </Box>

          <Box
            display={"flex"}
            flexDirection={isMobile ? "column" : "row-reverse"}
            justifyContent={"space-between"}
            marginBottom={2}
            paddingRight={3}
          >
            <Box className={isMobile ? "isMobile" : ""} width={"48%"}>
              <Button
                variant={"contained"}
                size={"small"}
                fullWidth
                onClick={() =>
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.SendNFTGateway,
                    info: { ...popItem },
                  })
                }
              >
                {t("labelNFTSendBtn")}
              </Button>
            </Box>
            {!!(
              popItem.isCounterFactualNFT &&
              popItem.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED &&
              popItem.minter?.toLowerCase() === account.accAddress.toLowerCase()
            ) && (
              <Box className={isMobile ? "isMobile" : ""} width={"48%"}>
                <Button
                  variant={"contained"}
                  size={"small"}
                  fullWidth
                  onClick={() =>
                    deployNFT.enable
                      ? setShowNFTDeploy({
                          isShow: true,
                          info: { ...popItem },
                        })
                      : setShowTradeIsFrozen({ isShow: true })
                  }
                >
                  {t("labelNFTDeployContract")}
                </Button>
              </Box>
            )}
          </Box>

          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography
              component={"h6"}
              color={"text.primary"}
              variant={"h4"}
              marginBottom={1}
            >
              {t("labelNFTDetail")}
            </Typography>

            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginBottom={1}
            >
              <Typography
                component={"span"}
                color={"var(--color-text-third)"}
                width={150}
              >
                {t("labelNFTTOTAL")}
              </Typography>
              <Typography
                component={"span"}
                color={"var(--color-text-secondary)"}
                title={popItem?.total}
              >
                {Number(popItem.total) - Number(popItem.locked ?? 0)}
              </Typography>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography
                component={"span"}
                color={"var(--color-text-third)"}
                width={150}
              >
                {t("labelNFTID")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                display={"inline-flex"}
                alignItems={"center"}
                style={{ wordBreak: "break-all" }}
                target="_blank"
                rel="noopener noreferrer"
                href={
                  Explorer +
                  `nft/${popItem.minter}-${NFTType[popItem.nftType ?? 0]}-${
                    popItem.tokenAddress
                  }-${popItem.nftId}-${popItem.royaltyPercentage}`
                }
                title={popItem?.nftId}
                width={"fit-content"}
              >
                #
                {" " +
                  getShortAddr(
                    popItem?.nftIdView ? popItem.nftIdView : popItem.nftId ?? ""
                  )}{" "}
                <LinkIcon color={"inherit"} fontSize={"medium"} />
              </Link>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography
                component={"span"}
                color={"var(--color-text-third)"}
                width={150}
              >
                {t("labelNFTContractAddress")}
              </Typography>
              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                target="_blank"
                rel="noopener noreferrer"
                href={`${etherscanBaseUrl}token/${popItem.tokenAddress}?a=${popItem.nftId}`}
              >
                {popItem.tokenAddress}
              </Link>
            </Typography>
            <Typography
              display={"inline-flex"}
              flexDirection={isMobile ? "column" : "row"}
              variant={"body1"}
              marginTop={1}
            >
              <Typography
                component={"span"}
                color={"var(--color-text-third)"}
                width={150}
              >
                {t("labelNFTTYPE")}
              </Typography>
              <Typography
                component={"span"}
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
              marginTop={1}
            >
              <Typography
                component={"span"}
                color={"var(--color-text-third)"}
                width={150}
              >
                {t("labelNFTMinter")}
              </Typography>

              <Link
                fontSize={"inherit"}
                whiteSpace={"break-spaces"}
                style={{ wordBreak: "break-all" }}
                onClick={() => {
                  window.open(
                    `${etherscanBaseUrl}address/${popItem.minter}`,
                    "blank"
                  );
                  window.opener = null;
                }}
              >
                {popItem.minter}
              </Link>
            </Typography>
          </Box>

          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography
              component={"h6"}
              color={"text.primary"}
              variant={"h4"}
              marginBottom={1}
            >
              {t("labelNFTProperties")}
            </Typography>
            <Box
              flex={1}
              marginBottom={1}
              display={"flex"}
              flexDirection={"column"}
            >
              {!!properties ? (
                typeof properties === "string" ? (
                  <Typography
                    display={"inline-flex"}
                    flexDirection={isMobile ? "column" : "row"}
                    variant={"body1"}
                    marginTop={1}
                  >
                    {properties.toString()}
                  </Typography>
                ) : (
                  [
                    ...(Array.isArray(properties)
                      ? properties
                      : Object.keys(properties)),
                  ].map((key, index) => {
                    // @ts-ignore
                    return Array.isArray(properties) ? (
                      <Typography
                        key={key.toString() + index}
                        display={"inline-flex"}
                        flexDirection={isMobile ? "column" : "row"}
                        variant={"body1"}
                        marginTop={1}
                      >
                        {JSON.stringify(key)}
                      </Typography>
                    ) : (
                      <Typography
                        key={key.toString() + index}
                        display={"inline-flex"}
                        flexDirection={isMobile ? "column" : "row"}
                        variant={"body1"}
                        marginTop={1}
                      >
                        <Typography
                          component={"span"}
                          color={"var(--color-text-third)"}
                          width={150}
                        >
                          {key.toString()}
                        </Typography>
                        <Typography
                          component={"span"}
                          color={"var(--color-text-secondary)"}
                          title={key.toString()}
                        >
                          {
                            // @ts-ignore
                            properties[key.toString()] ?? EmptyValueTag
                          }
                        </Typography>
                      </Typography>
                    );
                  })
                )
              ) : (
                EmptyValueTag
              )}
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            marginBottom={2}
            paddingRight={3}
          >
            <Typography
              component={"h6"}
              color={"text.primary"}
              variant={"h4"}
              marginBottom={1}
            >
              {t("labelNFTDescription2")}
            </Typography>
            <Box flex={1}>
              <TextareaAutosizeStyled
                aria-label="NFT Description"
                minRows={2}
                maxRows={5}
                disabled={true}
                value={`${popItem.description}` ?? EmptyValueTag}
              />
            </Box>
          </Box>

          {/*<Box marginBottom={3} display={"flex"} alignItems={"center"}>*/}
          {/*  <Typography color={"text.primary"} variant={"h2"} marginBottom={1}>*/}
          {/*    # {" " + getShortAddr(popItem?.nftId ?? "")}*/}
          {/*  </Typography>*/}
          {/*</Box>*/}
        </Box>
      );
    }, [showDialog, popItem, t, isKnowNFTNoMeta, etherscanBaseUrl]);
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
    const ref = React.useRef();
    return (
      <>
        {!isMobile && (
          <BoxNFT
            display={"flex"}
            style={style}
            alignItems={"center"}
            justifyContent={"center"}
            position={"relative"}
          >
            <NFTMedia
              ref={ref}
              item={popItem as Partial<NFTWholeINFO>}
              shouldPlay={true}
              onNFTError={() => undefined}
              isOrigin={true}
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
          {/*{viewPage === 0 && detailView}*/}
          {detailView}
        </BoxStyle>
      </>
    );
  }
);
