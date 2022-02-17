import {
  IPFS_META_URL,
  NFTWholeINFO,
  RefreshIcon,
  SoursURL,
} from "@loopring-web/common-resources";
import { Theme, useTheme } from "@emotion/react";
import React from "react";
import { Box, BoxProps } from "@mui/material";
import { cssBackground, NftImage } from "@loopring-web/component-lib";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)}
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element;
export const NFTMedia = React.memo(
  ({
    item,
    onNFTReload,
    onNFTError,
    index,
  }: {
    item: Partial<NFTWholeINFO>;
    index?: number;
    onNFTReload: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
    onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
  }) => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    return (
      <BoxStyle
        theme={theme}
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {isLoading ? (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <img
              className="loading-git"
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : (
          <>
            {item && (!item.image || item.isFailedLoadMeta) ? (
              <Box
                flex={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                onClick={async (event) => {
                  event.stopPropagation();
                  setIsLoading(true);
                  await onNFTReload(item, index);
                  setIsLoading(false);
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
                <NftImage
                  {...item}
                  onError={() => onNFTError(item, index)}
                  alt={item.name ?? "NFT"}
                  src={
                    item?.image?.replace(
                      IPFS_META_URL,
                      LOOPRING_URLs.IPFS_META_URL
                    ) ?? ""
                  }
                />
              </Box>
            )}
          </>
        )}
      </BoxStyle>
    );
  }
);
