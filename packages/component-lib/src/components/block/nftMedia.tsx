import {
  AudioIcon,
  hexToRGB,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  Media,
  myLog,
  NFTWholeINFO,
  PlayIcon,
  RefreshIcon,
  SoursURL,
  VideoIcon,
} from "@loopring-web/common-resources";
import { Theme, useTheme } from "@emotion/react";
import React from "react";
import { Box, BoxProps } from "@mui/material";
import { cssBackground, EmptyDefault, NftImage, useImage } from "../../index";
import { NFT_IMAGE_SIZES } from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)};
  width: 100%;
  //height: 100vw;
  position: relative;
  overflow: hidden;
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element;
const PlayIconStyle = styled(PlayIcon)`
  color: ${({ theme }) => hexToRGB(theme.colorBase.box, ".8")};
`;
export const NFTMedia = React.memo(
  ({
    item,
    onNFTError,
    index,
    isOrigin = false,
  }: {
    item: Partial<NFTWholeINFO>;
    index?: number;
    onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
    isOrigin?: boolean;
  }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [play, setPlay] = React.useState(false);
    const [previewSrc, setPreviewSrc] = React.useState(
      (isOrigin
        ? item?.metadata?.imageSize[NFT_IMAGE_SIZES.original]
        : item?.metadata?.imageSize[NFT_IMAGE_SIZES.small]) ??
        item?.image?.replace(IPFS_META_URL, IPFS_LOOPRING_SITE)
    );
    const { hasLoaded: previewSrcHasLoaded, hasError: previewSrcHasError } =
      useImage(previewSrc ?? "");
    const fullSrc =
      (isOrigin
        ? item?.image?.replace(IPFS_META_URL, IPFS_LOOPRING_SITE)
        : item?.metadata?.imageSize[NFT_IMAGE_SIZES.original]) ??
      item?.image?.replace(IPFS_META_URL, IPFS_LOOPRING_SITE);
    const { hasLoaded: fullSrcHasLoaded } = useImage(fullSrc ?? "");
    // if()
    // myLog("item.__mediaType__", item.__mediaType__, item.animationUrl);
    const typeSvg = React.useMemo(() => {
      myLog("item.__mediaType__", item.__mediaType__);
      switch (item.__mediaType__) {
        case Media.Audio:
          return (
            <>
              <Box
                position={"absolute"}
                left={theme.unit}
                top={theme.unit}
                borderRadius={"50%"}
                sx={{ background: "var(--color-box)" }}
                padding={3 / 2}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"center"}
                zIndex={100}
              >
                <AudioIcon fontSize={"large"} htmlColor={"var(--text-third)"} />
              </Box>
              {item.animationUrl && (
                <Box
                  position={"absolute"}
                  left={"50%"}
                  bottom={theme.unit}
                  sx={{ transform: "translateX(-50%)" }}
                  zIndex={100}
                >
                  <audio
                    src={item.animationUrl?.replace(
                      IPFS_META_URL,
                      IPFS_LOOPRING_SITE
                    )}
                    controls
                    loop
                    className="w-full rounded-none h-12"
                    controlsList="nodownload"
                  />
                </Box>
              )}
            </>
          );
        case Media.Video:
          return (
            <>
              <Box
                position={"absolute"}
                left={theme.unit}
                top={theme.unit}
                borderRadius={"50%"}
                sx={{ background: "var(--color-box)" }}
                padding={3 / 2}
                display={"inline-flex"}
                alignItems={"center"}
                justifyContent={"center"}
                zIndex={100}
              >
                <VideoIcon fontSize={"large"} htmlColor={"var(--text-third)"} />
              </Box>

              {item.animationUrl && !play && (
                <Box
                  position={"absolute"}
                  left={"50%"}
                  top={"50%"}
                  zIndex={100}
                  sx={{
                    transform: "translate(-50% , -50%)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlay(true);
                  }}
                >
                  <PlayIconStyle
                    sx={{ minHeight: 72, minWidth: 72 }}
                    // width={60}
                    // height={60}
                    // htmlColor={"var(--color-text-disable)"}
                  />
                </Box>
              )}
            </>
          );
        default:
          return <></>;
      }
    }, [item.__mediaType__, item.animationUrl, play, theme.unit]);

    return (
      <BoxStyle
        theme={theme}
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {!previewSrcHasLoaded ? (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <img
              className="loading-gif"
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : (
          <>
            {item && previewSrcHasError ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                onClick={async (event) => {
                  event.stopPropagation();
                  setPreviewSrc(
                    item?.metadata?.imageSize["160-160"] ??
                      item?.image?.replace(IPFS_META_URL, IPFS_LOOPRING_SITE) ??
                      ""
                  );
                }}
              >
                <RefreshIcon style={{ height: 36, width: 36 }} />
              </Box>
            ) : (
              <>
                {typeSvg}
                <Box
                  alignSelf={"stretch"}
                  position={"relative"}
                  flex={1}
                  display={"flex"}
                  style={{
                    background:
                      (!!fullSrc && fullSrcHasLoaded) || !!previewSrc
                        ? "var(--field-opacity)"
                        : "",
                  }}
                >
                  {play ? (
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      flex={1}
                    >
                      <video
                        src={item.animationUrl?.replace(
                          IPFS_META_URL,
                          IPFS_LOOPRING_SITE
                        )}
                        autoPlay
                        muted
                        controls
                        loop
                        controlsList="nodownload"
                        style={{ width: "100%" }}
                      />
                    </Box>
                  ) : !!fullSrc && fullSrcHasLoaded ? (
                    <NftImage
                      alt={item?.image}
                      {...item}
                      onError={() => undefined}
                      src={fullSrc}
                    />
                  ) : !!previewSrc ? (
                    <NftImage
                      alt={item?.image}
                      {...item}
                      onError={() => onNFTError(item, index)}
                      src={previewSrc}
                    />
                  ) : (
                    <EmptyDefault
                      style={{ flex: 1 }}
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
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </BoxStyle>
    );
  }
);
