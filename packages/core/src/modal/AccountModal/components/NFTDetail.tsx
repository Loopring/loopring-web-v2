import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  Grid,
  IconButton,
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
  HideIcon,
  ViewIcon,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
  FavSolidIcon,
  FavHollowIcon,
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
  ToastType,
} from "@loopring-web/component-lib";
import { nftRefresh, store, useAccount, useSystem } from "../../../stores";
import React from "react";
import { getIPFSString } from "../../../utils";
import { LoopringAPI } from "../../../api_wrapper";
import { useToast } from "../../../hooks";
import { sanitize } from "dompurify";
import { StylePaper } from "../../../component";
import { DEPLOYMENT_STATUS, NFTType } from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";
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

const FavoriteBoxStyle = styled(Box)`
  .favHollow {
    &:hover {
      color: var(--color-error);
    }
  }

  .favSolid {
    &:hover {
      color: var(--color-text-secondary);
    }
  }
`;
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
    setNFTMetaNotReady,
    t,
  }: {
    popItem: Partial<NFTWholeINFO>;
    etherscanBaseUrl: string;
    baseURL: string;
    setNFTMetaNotReady: (props: any) => void;
    assetsRawData: AssetsRawDataItem[];
  } & WithTranslation) => {
    const { isMobile } = useSettings();
    const { chainId } = useSystem();
    const { account } = useAccount();
    const [iconLoading, setIconLoading] = React.useState(false);
    const {
      nftDataHashes: { nftDataHashes },
      updateNFTRefreshHash,
    } = nftRefresh.useNFTRefresh();

    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
    const { toastOpen, setToastOpen, closeToast } = useToast();
    const {
      toggle: { deployNFT },
    } = useToggle();
    const {
      setShowNFTDetail,
      setShowAccount,
      setShowNFTDeploy,
      setShowTradeIsFrozen,
      modals: { isShowNFTDetail },
    } = useOpenModals();
    const [zoom, setZoom] = React.useState(false);
    const [tabValue, setTabValue] = React.useState(NFTDetailTab.Detail);
    const [showFresh, setShowFresh] = React.useState(
      popItem?.nftData && nftDataHashes[popItem.nftData?.toLowerCase()]
        ? "loading"
        : "click"
    );
    myLog("showFresh", showFresh);
    const onFavoriteClick = React.useCallback(async () => {
      if (LoopringAPI.userAPI) {
        try {
          setIconLoading(true);
          const response = await LoopringAPI.userAPI.submitUpdateNFTGroup(
            {
              accountId: account.accountId,
              nftHashes: [popItem.nftData ?? ""],
              preferenceType: sdk.NFT_PREFERENCE_TYPE.fav,
              statusToUpdate: !popItem?.preference?.favourite,
            },
            chainId as any,
            account.apiKey,
            account.eddsaKey.sk
          );
          setIconLoading(false);
          if (
            response &&
            ((response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message)
          ) {
            const _response: sdk.RESULT_INFO = response as sdk.RESULT_INFO;
            throw new Error(
              t(
                _response.code && SDK_ERROR_MAP_TO_UI[_response.code]
                  ? SDK_ERROR_MAP_TO_UI[_response.code].messageKey
                  : SDK_ERROR_MAP_TO_UI[UIERROR_CODE.UNKNOWN].messageKey,
                { ns: "error", name: popItem.name?.trim() }
              )
            );
          } else {
            setToastOpen({
              open: true,
              type: ToastType.success,
              content: t(`labelFavouriteSuccess`, {
                favorite: !popItem?.preference?.favourite
                  ? t("labelfavourite")
                  : t("labelunfavourite"),
              }),
            });
            setShowNFTDetail({
              ...isShowNFTDetail,
              preference: {
                ...isShowNFTDetail.preference,
                favourite: !popItem?.preference?.favourite ?? false,
              } as any,
            });
          }
        } catch (error) {
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t(`labelFavouriteFailed`, {
                favorite: !popItem?.preference?.favourite
                  ? t("labelfavourite")
                  : t("labelunfavourite"),
              }) +
              `: ${
                (error as any)?.message
                  ? (error as any).message
                  : t("errorUnknown")
              }`,
          });
        }
      }
    }, [popItem]);
    const onHideClick = React.useCallback(async () => {
      if (LoopringAPI.userAPI) {
        try {
          setIconLoading(true);
          const response = await LoopringAPI.userAPI.submitUpdateNFTGroup(
            {
              accountId: account.accountId,
              nftHashes: [popItem.nftData ?? ""],
              preferenceType: sdk.NFT_PREFERENCE_TYPE.hide,
              statusToUpdate: !popItem?.preference?.hide,
            },
            chainId as any,
            account.apiKey,
            account.eddsaKey.sk
          );
          setIconLoading(false);
          if (
            response &&
            ((response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message)
          ) {
            const _response: sdk.RESULT_INFO = response as sdk.RESULT_INFO;
            throw new Error(
              t(
                _response.code && SDK_ERROR_MAP_TO_UI[_response.code]
                  ? SDK_ERROR_MAP_TO_UI[_response.code].messageKey
                  : SDK_ERROR_MAP_TO_UI[UIERROR_CODE.UNKNOWN].messageKey,
                { ns: "error", name: popItem.name?.trim() }
              )
            );
          } else {
            setToastOpen({
              open: true,
              type: ToastType.success,
              content: t(`labelHideSuccess`, {
                hide: !popItem?.preference?.hide
                  ? t("labelhide")
                  : t("labelunhide"),
              }),
            });
            setShowNFTDetail({
              ...isShowNFTDetail,
              preference: {
                ...isShowNFTDetail.preference,
                hide: !popItem?.preference?.hide ?? false,
              } as any,
            });
          }
        } catch (error) {
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              t(`labelHideFailed`, {
                hide: !popItem?.preference?.hide
                  ? t("labelhide")
                  : t("labelunhide"),
              }) +
              `: ${
                (error as any)?.message
                  ? (error as any).message
                  : t("errorUnknown")
              }`,
          });
        }
      }
    }, [popItem]);

    const handleRefresh = React.useCallback(async () => {
      setShowFresh("loading");
      setToastOpen({
        open: true,
        type: ToastType.success,
        content: t("labelNFTServerRefreshSubmit"),
      });
      if (popItem && popItem.nftData) {
        updateNFTRefreshHash(popItem.nftData);
        await LoopringAPI.nftAPI?.callRefreshNFT({
          network: "ETHEREUM",
          tokenAddress: popItem.tokenAddress ?? "",
          nftId: popItem?.nftId?.toString() ?? "",
          nftType: (popItem?.nftType?.toString() ?? "") as NFT_TYPE_STRING,
        });
        setToastOpen({
          open: true,
          type: ToastType.success,
          content: t("labelNFTServerRefreshSubmit"),
        });
      }
    }, []);
    // const [showDialog, setShowDialog] =
    //   React.useState<string | undefined>(undefined);
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
    const cid = LoopringAPI?.nftAPI?.ipfsNftIDToCid(popItem?.nftId ?? "");
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
              <FavoriteBoxStyle
                marginTop={2}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {popItem.preference && (
                  <Tooltip
                    title={t(
                      `labelFavouriteMethodTooltip${
                        popItem.preference.favourite
                          ? "unfavourite"
                          : "favourite"
                      }`
                    ).toString()}
                    placement={"top"}
                  >
                    <IconButton
                      aria-label={t(
                        `labelHideMethodTooltip${
                          popItem.preference.favourite
                            ? "favourite"
                            : "unfavourite"
                        }`
                      )}
                      size={"large"}
                      edge={"end"}
                      disabled={iconLoading}
                      color={"inherit"}
                      onClick={(_event) => {
                        onFavoriteClick();
                      }}
                      sx={{
                        minWidth: "initial",
                        padding: "4px",
                        marginRight: 1,
                      }}
                    >
                      {popItem.preference.favourite ? (
                        <FavSolidIcon
                          className={"favSolid"}
                          htmlColor={"var(--color-error)"}
                        />
                      ) : (
                        <FavHollowIcon className={"favHollow"} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip
                  title={t("labelNFTServerRefresh").toString()}
                  placement={"top"}
                >
                  <IconButton
                    aria-label={t("labelRefresh")}
                    disabled={showFresh !== "click"}
                    size={"large"}
                    edge={"end"}
                    color={"inherit"}
                    onClick={(_event) => {
                      handleRefresh();
                    }}
                    sx={{ minWidth: "initial", padding: "4px", marginRight: 1 }}
                  >
                    <RefreshIPFSIcon
                      color={showFresh !== "click" ? "disabled" : undefined}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("labelZoom").toString()} placement={"top"}>
                  <IconButton
                    aria-label={t("labelZoom")}
                    size={"large"}
                    edge={"end"}
                    color={"inherit"}
                    onClick={(_event) => {
                      setZoom(true);
                    }}
                    sx={{ minWidth: "initial", padding: "4px", marginRight: 1 }}
                  >
                    <ZoomIcon />
                  </IconButton>
                </Tooltip>
                {popItem.preference && (
                  <Tooltip
                    title={t(
                      `labelHideMethodTooltip${
                        popItem.preference.hide ? "unhide" : "hide"
                      }`
                    ).toString()}
                    placement={"top"}
                  >
                    <IconButton
                      aria-label={t(
                        `labelHideMethodTooltip${
                          popItem.preference.hide ? "hide" : "unhide"
                        }`
                      )}
                      size={"large"}
                      edge={"end"}
                      disabled={iconLoading}
                      color={"inherit"}
                      onClick={(_event) => {
                        onHideClick();
                      }}
                      sx={{
                        minWidth: "initial",
                        padding: "4px",
                        marginRight: 1,
                      }}
                    >
                      {popItem.preference.hide ? <HideIcon /> : <ViewIcon />}
                    </IconButton>
                  </Tooltip>
                )}
              </FavoriteBoxStyle>
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
                {popItem?.collectionInfo && (
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                    marginTop={2}
                  >
                    <>
                      {(
                        popItem?.collectionInfo?.cached?.tileUri ??
                        getIPFSString(
                          popItem?.collectionInfo?.tileUri ?? "",
                          baseURL
                        )
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
                          src={
                            popItem?.collectionInfo?.cached?.tileUri ??
                            getIPFSString(
                              popItem?.collectionInfo?.tileUri ?? "",
                              baseURL
                            )
                          }
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
                        {popItem?.collectionInfo
                          ? popItem?.collectionInfo?.name
                            ? popItem?.collectionInfo?.name
                            : t("labelUnknown") +
                              " - " +
                              getShortAddr(
                                popItem?.collectionInfo?.contractAddress ?? ""
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
                flexDirection={"row"}
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
                        : setNFTMetaNotReady({
                            isShow: true,
                            info: { method: "Send" },
                          })
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
                    <LinkIcon fontSize={"medium"} />
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
                    href={
                      popItem.deploymentStatus ===
                      DEPLOYMENT_STATUS.NOT_DEPLOYED
                        ? `${Explorer}collections/${popItem.tokenAddress}?a=${popItem.nftId}`
                        : `${etherscanBaseUrl}token/${popItem.tokenAddress}?a=${popItem.nftId}`
                    }
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
                    {t("labelNFTRoyaltyPercentage")}
                  </Typography>
                  <Typography
                    component={"span"}
                    color={"var(--color-text-secondary)"}
                    // title={popItem?.royaltyPercentage}
                  >
                    {popItem?.royaltyPercentage ?? EmptyValueTag + "%"}
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
                    {t("labelNFTMetadata")}
                  </Typography>

                  <Link
                    fontSize={"inherit"}
                    whiteSpace={"break-spaces"}
                    style={{ wordBreak: "break-all" }}
                    onClick={() => {
                      window.open(IPFS_LOOPRING_SITE + cid, "blank");
                      window.opener = null;
                    }}
                  >
                    {cid}
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
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
      </>
    );
  }
);
