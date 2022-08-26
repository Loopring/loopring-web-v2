import styled from "@emotion/styled";
import { Box, BoxProps, Link, Tooltip, Typography } from "@mui/material";
import {
  AssetsRawDataItem,
  EmptyValueTag,
  Explorer,
  getShortAddr,
  LinkIcon,
  LoadingIcon,
  myLog,
  NFT_TYPE_STRING,
  NFTWholeINFO,
  RefreshIPFSIcon,
  TOAST_TIME,
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
  Toast,
} from "@loopring-web/component-lib";
import { nftRefresh, store, useAccount, useSystem } from "../../../stores";
import React from "react";
import { DEPLOYMENT_STATUS, NFTType } from "@loopring-web/loopring-sdk";
import { useTheme } from "@emotion/react";
import { getIPFSString } from "../../../utils";
import { LoopringAPI } from "../../../api_wrapper";
import { useToast } from "../../../hooks";

const BoxNFT = styled(Box)`
  background: var(--color-global-bg);

  img {
    object-fit: contain;
  }
` as typeof Box;

const BoxStyle = styled(Box)<
  { isMobile: boolean; baseURL: string } & BoxProps & Partial<NFTWholeINFO>
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
    ${({ isMobile, image, baseURL }) => `
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
         background:url(${getIPFSString(image, baseURL)});
         no-repeat 50% 10px;
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

  .MuiSnackbar-root {
    top: ${({ theme }) => 4 * theme.unit}px !important;
  }
` as (
  props: { isMobile: boolean; baseURL: string } & BoxProps &
    Partial<NFTWholeINFO>
) => JSX.Element;

export const NFTDetail = withTranslation("common")(
  ({
    popItem,
    etherscanBaseUrl,
    baseURL,
    t,
  }: {
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
    baseURL: string;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const { chainId } = useSystem();
    const { account } = useAccount();
    const {
      nftDataHashes: { nftDataHashes },
      updateNFTRefreshHash,
    } = nftRefresh.useNFTRefresh();
    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
    const { toastOpen, setToastOpen, closeToast } = useToast();
    const {
      toggle: { deployNFT },
    } = useToggle();
    const { setShowAccount, setShowNFTDeploy, setShowTradeIsFrozen } =
      useOpenModals();
    const [showFresh, setShowFresh] = React.useState(
      popItem?.nftData && nftDataHashes[popItem.nftData?.toLowerCase()]
        ? "loading"
        : "click"
    );
    myLog("showFresh", showFresh);

    const handleRefresh = React.useCallback(async () => {
      setShowFresh("loading");
      setToastOpen({
        open: true,
        type: "success",
        content: t("labelNFTServerRefreshSubmit"),
      });
      if (popItem && popItem.nftData) {
        updateNFTRefreshHash(popItem.nftData);
        await LoopringAPI.nftAPI?.callRefreshNFT({
          network: "ETHEREUM",
          tokenAddress: popItem.tokenAddress ?? "",
          nftId: popItem?.nftId?.toString() ?? "", //new BigNumber(?? "0", 16).toString(),
          nftType: (popItem?.nftType?.toString() ?? "") as NFT_TYPE_STRING,
        });
        setToastOpen({
          open: true,
          type: "success",
          content: t("labelNFTServerRefreshSubmit"),
        });
      }
    }, []);
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

    const updateNFTStatus = React.useCallback(async () => {
      const nftDataHashes =
        store.getState().localStore.nftHashInfos[chainId]?.nftDataHashes;
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
      if (
        popItem.nftData &&
        nftDataHashes &&
        nftDataHashes[popItem.nftData.toLowerCase()]
      ) {
        updateNFTRefreshHash(popItem.nftData);
        nodeTimer.current = setTimeout(() => {
          updateNFTStatus();
          // updateNFTRefreshHash(popItem.nftData);
        }, 180000);
      } else {
        setShowFresh("click");
      }
      return () => {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      };
    }, [nodeTimer]);

    React.useEffect(() => {
      if (popItem?.nftData && nftDataHashes[popItem.nftData]) {
        updateNFTStatus();
      }
    }, [nftDataHashes, popItem.nftData]);

    const detailView = React.useMemo(() => {
      return (
        <Box
          flexDirection={"column"}
          display={"flex"}
          className={"detail-info"}
          maxWidth={isMobile ? "var(--mobile-full-panel-width)" : 550}
        >
          <Box marginBottom={2} display={"flex"} alignItems={"center"}>
            <Typography
              component={"h4"}
              color={"text.primar"}
              variant={"body1"}
              marginBottom={1}
            >
              {popItem?.collectionMeta
                ? popItem?.collectionMeta?.name
                  ? popItem?.collectionMeta?.name
                  : t("labelUnknown") +
                    " - " +
                    getShortAddr(popItem?.collectionMeta?.contractAddress ?? "")
                : EmptyValueTag}
            </Typography>
          </Box>
          <Box marginBottom={2} display={"flex"} alignItems={"center"}>
            <Typography color={"text.primary"} variant={"h2"}>
              {popItem?.name ?? EmptyValueTag}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
            marginBottom={2}
            paddingRight={3}
          >
            <Tooltip
              title={t("labelNFTServerRefresh").toString()}
              placement={"top"}
            >
              {showFresh === "click" ? (
                <Button
                  size={"small"}
                  aria-label={t("labelRefresh")}
                  // sx={{ backgroundColor: "var(--field-opacity)" }}
                  variant={"outlined"}
                  onClick={(_event) => {
                    handleRefresh();
                  }}
                  sx={{ minWidth: "initial", padding: "4px" }}
                >
                  <RefreshIPFSIcon color={"inherit"} fontSize={"medium"} />
                </Button>
              ) : (
                <LoadingIcon fontSize={"large"} />
              )}
            </Tooltip>
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
                  `nft/${popItem.minter?.toLowerCase()}-${
                    NFTType[popItem.nftType ?? 0]
                  }-${popItem.tokenAddress?.toLowerCase()}-${popItem.nftId?.toLowerCase()}-${
                    popItem.royaltyPercentage
                  }`
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
                style={{ padding: 0 }}
                value={`${popItem.description}` ?? EmptyValueTag}
              />
            </Box>
          </Box>

          <InformationForNoMetaNFT
            open={!!showDialog}
            method={showDialog}
            handleClose={(_e, isAgree) => {
              setShowDialog(undefined);
              if (isAgree && showDialog) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.SendNFTGateway,
                });
              }
            }}
          />
        </Box>
      );
    }, [
      isMobile,
      popItem,
      t,
      showFresh,
      account.accAddress,
      etherscanBaseUrl,
      properties,
      showDialog,
      handleRefresh,
      setShowAccount,
      deployNFT.enable,
      setShowNFTDeploy,
      setShowTradeIsFrozen,
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
              getIPFSString={getIPFSString}
              baseURL={baseURL}
            />
          </BoxNFT>
        )}
        <BoxStyle
          baseURL={baseURL}
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
          <Toast
            // snackbarOrigin={{
            //   vertical: "top",
            //   horizontal: "left",
            // }}
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? "success"}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />
        </BoxStyle>
      </>
    );
  }
);
