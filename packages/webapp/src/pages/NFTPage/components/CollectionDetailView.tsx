import {
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  GET_IPFS_STRING,
  getShortAddr,
  ImageIcon,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import { Avatar, Box, BoxProps, Link, Typography } from "@mui/material";
import React from "react";
import { useTheme } from "@emotion/react";
import { useSettings } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
//--color-box
const HeaderBannerStyle = styled(Box)<BoxProps & { url: string }>`
  background-image: url(${({ url }) => url});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
` as (props: BoxProps & { url: string }) => JSX.Element;

export const CollectionDetailView = ({
  collectionDate,
  getIPFSString,
  baseURL,
  setCopyToastOpen,
}: {
  collectionDate: CollectionMeta;
  getIPFSString: GET_IPFS_STRING;
  baseURL: string;
  setCopyToastOpen: (props: { isShow: boolean; type: string }) => void;
}) => {
  const theme = useTheme();
  const { isMobile } = useSettings();
  const { t } = useTranslation();
  const lageSize = isMobile
    ? {
        icon: 36,
        move: 20,
        width: "var(--nft-small-avatar)",
      }
    : {
        icon: 48,
        move: 40,
        width: "var(--nft-large-avatar)",
      };
  return (
    <Box flex={1} display={"flex"} flexDirection={"column"}>
      <StyledPaper display={"flex"} flexDirection={"column"}>
        <Box
          width={"100%"}
          height={"calc(100vw / 3)"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ background: "var(--field-opacity)" }}
        >
          {getIPFSString(collectionDate?.banner ?? "", baseURL).startsWith(
            "http"
          ) ? (
            <HeaderBannerStyle
              url={getIPFSString(collectionDate?.banner ?? "", baseURL)}
            />
          ) : (
            <ImageIcon
              style={{
                height: lageSize.icon,
                width: lageSize.icon,
              }}
            />
          )}
        </Box>

        <Box padding={3} position={"relative"}>
          <Box
            position={"absolute"}
            top={-lageSize.move}
            left={lageSize.move}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            height={lageSize.width}
            width={lageSize.width}
            borderRadius={theme.unit}
            sx={{ background: "var(--color-pop-bg)" }}
          >
            {getIPFSString(collectionDate?.avatar ?? "", baseURL).startsWith(
              "http"
            ) ? (
              <Avatar
                sx={{ bgcolor: "var(--color-border-disable2)" }}
                variant={"rounded"}
                src={getIPFSString(collectionDate?.avatar ?? "", baseURL)}
              />
            ) : (
              <ImageIcon fontSize={"large"} />
              // <Avatar
              //   sx={{ bgcolor: "var(--color-border-disable2)" }}
              //   variant={"circular"}
              //   src={collectionDate?.avatar}
              // >
              //   <ImageIcon fontSize={"large"} />
              // </Avatar>
            )}
          </Box>
          <Box
            left={`calc(${lageSize.width} + ${lageSize.move}px)`}
            paddingLeft={2}
            position={"relative"}
          >
            <Typography
              variant={"h4"}
              component={"span"}
              whiteSpace={"pre"}
              overflow={"hidden"}
              display={"flex"}
              textOverflow={"ellipsis"}
            >
              {collectionDate.name}
            </Typography>
            <Link
              color={"textPrimary"}
              paddingTop={1}
              variant={"body1"}
              component={"span"}
              whiteSpace={"pre"}
              overflow={"hidden"}
              display={"flex"}
              textOverflow={"ellipsis"}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipBoard(collectionDate?.contractAddress ?? "");
                setCopyToastOpen({ isShow: true, type: "address" });
              }}
            >
              {getShortAddr(collectionDate?.contractAddress ?? "")}
              <CopyIcon color={"inherit"} />
            </Link>
            <Typography
              color={"textPrimary"}
              paddingTop={1}
              variant={"body1"}
              component={"span"}
              whiteSpace={"pre"}
              overflow={"hidden"}
              display={"flex"}
              textOverflow={"ellipsis"}
            >
              {t("labelCollectionItemValue", {
                value: collectionDate?.extends.count,
              })}
            </Typography>
            <Typography
              color={"textPrimary"}
              paddingTop={1}
              variant={"body1"}
              component={"span"}
              whiteSpace={"pre"}
              overflow={"hidden"}
              display={"flex"}
              textOverflow={"ellipsis"}
              title={collectionDate?.nftType}
            >
              {collectionDate?.nftType}
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Box>
  );
};
