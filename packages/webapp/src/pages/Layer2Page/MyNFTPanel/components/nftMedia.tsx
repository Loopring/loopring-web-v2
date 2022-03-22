import {
  IPFS_META_URL,
  NFTWholeINFO,
  RefreshIcon,
  SoursURL,
} from "@loopring-web/common-resources";
import { Theme, useTheme } from "@emotion/react";
import React from "react";
import { Box, BoxProps } from "@mui/material";
import {
  cssBackground,
  EmptyDefault,
  NftImage,
  useImage,
} from "@loopring-web/component-lib";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)}
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element;
export const NFTMedia = React.memo(
  ({
    item,
    // onNFTReload,
    onNFTError,
    index,
    isOrigin = false,
  }: {
    item: Partial<NFTWholeINFO>;
    index?: number;
    // onNFTReload: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
    onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
    isOrigin?: boolean;
  }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const fullSrc = isOrigin
      ? !!item?.metadata?.imageSize?.original
        ? item.metadata.imageSize.original
        : item?.image?.replace(IPFS_META_URL, LOOPRING_URLs.IPFS_META_URL)
      : item?.metadata?.imageSize["375-375"] ?? item.image;
    const { hasLoaded } = useImage(fullSrc ?? "");

    const [previewSrc, setPreviewSrc] = React.useState(() => {
      return (
        item?.metadata?.imageSize["32-32"] ??
        item?.image?.replace(IPFS_META_URL, LOOPRING_URLs.IPFS_META_URL) ??
        ""
      );
    });

    const { hasLoaded: preHasLoaded, hasError: preHasError } =
      useImage(previewSrc);

    return (
      <BoxStyle
        theme={theme}
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {!preHasLoaded ? (
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
            {item && preHasError ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                onClick={async (event) => {
                  event.stopPropagation();
                  setPreviewSrc(
                    item?.metadata?.imageSize["32-32"] ??
                      item?.image?.replace(
                        IPFS_META_URL,
                        LOOPRING_URLs.IPFS_META_URL
                      ) ??
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
                style={{ background: "var(--color-white)" }}
              >
                {hasLoaded && fullSrc ? (
                  <NftImage
                    {...item}
                    onError={() => onNFTError(item, index)}
                    alt={item.name ?? "NFT"}
                    src={fullSrc}
                  />
                ) : !!previewSrc ? (
                  <NftImage
                    {...item}
                    onError={() => onNFTError(item, index)}
                    alt={item.name ?? "NFT"}
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
