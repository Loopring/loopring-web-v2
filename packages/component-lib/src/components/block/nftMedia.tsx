import {
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  NFTWholeINFO,
  RefreshIcon,
  SoursURL,
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
              <Box
                alignSelf={"stretch"}
                flex={1}
                display={"flex"}
                style={{
                  background:
                    (!!fullSrc && fullSrcHasLoaded) || !!previewSrc
                      ? "var(--field-opacity)"
                      : "",
                }}
              >
                {!!fullSrc && fullSrcHasLoaded ? (
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
            )}
          </>
        )}
      </BoxStyle>
    );
  }
);
