import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  Grid,
  Link,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AssetsRawDataItem,
  EmptyValueTag,
  Explorer,
  getShortAddr,
  ImageIcon,
  IPFS_LOOPRING_SITE,
  LinkIcon,
  myLog,
  NFT_TYPE_STRING,
  NFTWholeINFO,
  RefreshIPFSIcon,
  type,
  ZoomIcon,
  TOAST_TIME,
  htmlDecode,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  Button,
  TextareaAutosizeStyled,
  useOpenModals,
  useSettings,
  useToggle,
  NFTMedia,
  ZoomMedia,
  AccountStep,
  EmptyDefault,
  Toast,
  InformationForNoMetaNFT,
} from "@loopring-web/component-lib";
import { nftRefresh, store, useAccount, useSystem } from "../../../stores";
import React from "react";
import { getIPFSString } from "../../../utils";
import { LoopringAPI } from "../../../api_wrapper";
import { useToast } from "../../../hooks";
import { sanitize } from "dompurify";
import { StylePaper } from "../../../component/styled";
import { DEPLOYMENT_STATUS, NFTType } from "@loopring-web/loopring-sdk";
enum NFTDetailTab {
  Detail = "Detail",
  Property = "Property",
}
const BoxNFT = styled(Box)`
  background: var(--color-global-bg-opacity);
  img {
    object-fit: contain;
  }
` as typeof Box;

const BoxStyle = styled(Box)<
  { isMobile: boolean; baseURL: string } & BoxProps & Partial<NFTWholeINFO>
>`
  .objectFit {
    img {
      object-fit: contain;
    }
  }
  .line-clamp {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
` as (
  props: { isMobile?: boolean; baseURL?: string } & BoxProps &
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
    const [zoom, setZoom] = React.useState(false);
    const [tabValue, setTabValue] = React.useState(NFTDetailTab.Detail);
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
    const compileString = (str: any) => {
      const _type = type(str);
      let _str;
      if (["string", "number", "symbol"].includes(_type)) {
        _str = str;
      } else if (["array", "object"].includes(_type)) {
        _str = JSON.stringify(str, undefined, 2);
      }
      return sanitize(_str ?? EmptyValueTag);
    };
    const ref = React.useRef();
    return (
      <>
        <StylePaper
          display={"flex"}
          flexDirection={"row"}
          flex={1}
          paddingX={3}
          paddingTop={3}
          paddingBottom={2}
          marginTop={2}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={5}
              lg={5}
              display={"flex"}
              flexDirection={"column"}
            >
              <BoxNFT flex={1} position={"relative"} paddingTop={"100%"}>
                <Box
                  position={"absolute"}
                  top={0}
                  right={0}
                  bottom={0}
                  left={0}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
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
                </Box>
              </BoxNFT>
              <Box
                marginTop={2}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Tooltip
                  title={t("labelNFTServerRefresh").toString()}
                  placement={"top"}
                >
                  <Button
                    size={"small"}
                    aria-label={t("labelRefresh")}
                    disabled={showFresh !== "click"}
                    variant={"outlined"}
                    onClick={(_event) => {
                      handleRefresh();
                    }}
                    sx={{ minWidth: "initial", padding: "4px", marginRight: 1 }}
                  >
                    <RefreshIPFSIcon color={"inherit"} fontSize={"medium"} />
                  </Button>
                </Tooltip>
                <Tooltip
                  title={t("labelLinkMetaData").toString()}
                  placement={"top"}
                >
                  <Button
                    size={"small"}
                    aria-label={t("labelLinkMetaData")}
                    variant={"outlined"}
                    onClick={() => {
                      const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(
                        popItem?.nftId ?? ""
                      );
                      const uri = IPFS_LOOPRING_SITE + cid;
                      window.open(uri, "_blank");
                      window.opener = null;
                    }}
                    sx={{ minWidth: "initial", padding: "4px", marginRight: 1 }}
                  >
                    <LinkIcon color={"inherit"} fontSize={"medium"} />
                  </Button>
                </Tooltip>
                <Button
                  size={"small"}
                  aria-label={t("labelZoom")}
                  variant={"outlined"}
                  onClick={(_event) => {
                    setZoom(true);
                  }}
                  sx={{ minWidth: "initial", padding: "4px", marginRight: 1 }}
                >
                  <ZoomIcon color={"inherit"} fontSize={"medium"} />
                </Button>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={7}
              lg={7}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"space-between"}
            >
              <BoxStyle
                flexDirection={"column"}
                display={"flex"}
                paddingLeft={3}
                flex={1}
              >
                {popItem?.collectionMeta && (
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    marginTop={2}
                  >
                    <>
                      {getIPFSString(
                        popItem?.collectionMeta?.tileUri ?? "",
                        baseURL
                      ).startsWith("http") ? (
                        <Avatar
                          className={"objectFit"}
                          sx={{
                            bgcolor: "var(--color-global-bg-opacity)",
                            marginRight: 1,
                            width: "var(--svg-size-large)",
                            height: "var(--svg-size-large)",
                          }}
                          variant={"rounded"}
                          src={getIPFSString(
                            popItem?.collectionMeta?.tileUri ?? "",
                            baseURL
                          )}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            bgcolor: "var(--color-global-bg-opacity)",
                            marginRight: 1,
                            width: "var(--svg-size-large)",
                            height: "var(--svg-size-large)",
                            color: "var(--color-text-third)",
                          }}
                          variant={"rounded"}
                        >
                          <ImageIcon />
                        </Avatar>
                      )}
                      <Typography
                        component={"h4"}
                        whiteSpace={"pre-line"}
                        sx={{ wordBreak: "break-all" }}
                        color={"textPrimary"}
                        variant={"body1"}
                      >
                        {popItem?.collectionMeta
                          ? popItem?.collectionMeta?.name
                            ? popItem?.collectionMeta?.name
                            : t("labelUnknown") +
                              " - " +
                              getShortAddr(
                                popItem?.collectionMeta?.contractAddress ?? ""
                              )
                          : EmptyValueTag}
                      </Typography>
                    </>
                  </Box>
                )}
                <Box display={"flex"} alignItems={"center"} marginTop={2}>
                  <Tooltip
                    title={popItem?.name ?? EmptyValueTag}
                    placement={"top"}
                  >
                    <Typography
                      color={"textPrimary"}
                      variant={"h1"}
                      className={"line-clamp"}
                      whiteSpace={"pre-line"}
                      sx={{ wordBreak: "break-all" }}
                      dangerouslySetInnerHTML={{
                        __html: sanitize(popItem?.name ?? EmptyValueTag) ?? "",
                      }}
                    />
                  </Tooltip>
                </Box>
                <Box flex={1} marginTop={2} display={"flex"} marginBottom={2}>
                  <TextareaAutosizeStyled
                    aria-label="NFT Description"
                    maxRows={5}
                    disabled={true}
                    style={{ padding: 0, height: "auto" }}
                    value={
                      popItem?.description
                        ? htmlDecode(popItem.description ?? "").toString()
                        : EmptyValueTag
                    }
                  />
                </Box>
              </BoxStyle>
              <Box
                paddingLeft={3}
                display={"flex"}
                flexDirection={isMobile ? "column" : "row"}
                justifyContent={"space-between"}
                marginBottom={isMobile ? 2 : 5}
                paddingRight={3}
              >
                <Box className={isMobile ? "isMobile" : ""} width={"48%"}>
                  <Button
                    variant={"contained"}
                    size={"small"}
                    fullWidth
                    onClick={() =>
                      isKnowNFTNoMeta
                        ? setShowAccount({
                            isShow: true,
                            step: AccountStep.SendNFTGateway,
                            info: { ...popItem },
                          })
                        : setShowDialog("Send")
                    }
                  >
                    {t("labelNFTSendBtn")}
                  </Button>
                </Box>
                {!!(
                  popItem.isCounterFactualNFT &&
                  popItem.deploymentStatus === DEPLOYMENT_STATUS.NOT_DEPLOYED &&
                  popItem.minter?.toLowerCase() ===
                    account.accAddress.toLowerCase()
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
                          : setShowTradeIsFrozen({
                              isShow: true,
                              type: t("nftDeployDescription"),
                            })
                      }
                    >
                      {t("labelNFTDeployContract")}
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </StylePaper>
        <StylePaper display={"flex"} flexDirection={"row"} flex={1}>
          <Box
            paddingLeft={1}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Tabs
              value={tabValue}
              onChange={(_e, value) => setTabValue(value)}
              aria-label="NFT Detail Tab"
            >
              <Tab label={t("labelNFTDetailTab")} value={NFTDetailTab.Detail} />
              <Tab
                label={t("labelNFTPropertiesTab")}
                value={NFTDetailTab.Property}
              />
            </Tabs>
            {/*<InputSearch value={searchValue} onChange={handleSearchChange} />*/}
          </Box>
          <Divider style={{ marginTop: "-1px" }} />
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"stretch"}
            marginBottom={2}
            paddingX={3}
            flex={1}
          >
            {tabValue === NFTDetailTab.Detail && (
              <>
                <Typography
                  display={"inline-flex"}
                  flexDirection={"row"}
                  variant={"body1"}
                  marginTop={1}
                  justifyContent={"space-between"}
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
                  flexDirection={"row"}
                  justifyContent={"space-between"}
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
                    {"# " +
                      getShortAddr(
                        popItem?.nftIdView
                          ? popItem.nftIdView
                          : popItem.nftId ?? ""
                      )}
                    <LinkIcon color={"inherit"} fontSize={"medium"} />
                  </Link>
                </Typography>
                <Typography
                  display={"inline-flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
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
                  flexDirection={"row"}
                  justifyContent={"space-between"}
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
                  flexDirection={"row"}
                  justifyContent={"space-between"}
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
              </>
            )}
            {tabValue === NFTDetailTab.Property &&
              (!!properties ? (
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
                        component={"pre"}
                        key={JSON.stringify(key) + index}
                        marginTop={1}
                        display={"inline-flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        variant={"body1"}
                        dangerouslySetInnerHTML={{
                          __html: compileString(key) ?? "",
                        }}
                      />
                    ) : (
                      // JSON.stringify(key.toString())
                      <Typography
                        key={key.toString() + index}
                        marginTop={1}
                        display={"inline-flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        variant={"body1"}
                      >
                        <Typography
                          component={"pre"}
                          color={"var(--color-text-third)"}
                          width={150}
                          dangerouslySetInnerHTML={{
                            __html:
                              sanitize(key.toString() ?? EmptyValueTag) ?? "",
                          }}
                        />
                        <Typography
                          component={"pre"}
                          color={"var(--color-text-secondary)"}
                          title={key.toString()}
                          dangerouslySetInnerHTML={{
                            __html:
                              compileString(properties[key.toString()]) ?? "",
                          }}
                        />
                      </Typography>
                    );
                  })
                )
              ) : (
                <Box flex={1} height={"100%"} width={"100%"}>
                  <EmptyDefault
                    style={{ alignSelf: "center" }}
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
              ))}
          </Box>
        </StylePaper>
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
        <ZoomMedia
          onClose={() => {
            setZoom(false);
          }}
          getIPFSString={getIPFSString}
          baseURL={baseURL}
          open={zoom}
          nftItem={popItem as Partial<NFTWholeINFO>}
        />
        <Toast
          alertText={toastOpen?.content ?? ""}
          severity={toastOpen?.type ?? "success"}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
      </>

      //   <BoxStyle
      //     baseURL={baseURL}
      //     isMobile={isMobile}
      //     image={popItem.image}
      //     marginLeft={2}
      //     display={"flex"}
      //     flex={1}
      //     flexDirection={"column"}
      //     alignItems={"center"}
      //     className={"nft-detail"}
      //     whiteSpace={"break-spaces"}
      //     style={{ wordBreak: "break-all" }}
      //   >
      //     {/*{viewPage === 0 && detailView}*/}
      //     {detailView}
      //     <Toast
      //       // snackbarOrigin={{
      //       //   vertical: "top",
      //       //   horizontal: "left",
      //       // }}
      //       alertText={toastOpen?.content ?? ""}
      //       severity={toastOpen?.type ?? "success"}
      //       open={toastOpen?.open ?? false}
      //       autoHideDuration={TOAST_TIME}
      //       onClose={closeToast}
      //     />
      //   </BoxStyle>
      // </StylePaper>
    );
  }
);
