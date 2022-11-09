import {
  AccountStatus,
  CollectionMeta,
  CopyIcon,
  copyToClipBoard,
  GET_IPFS_STRING,
  getShortAddr,
  ImageIcon,
  NFT_TYPE_STRING,
  RowInvestConfig,
} from "@loopring-web/common-resources";
import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import React from "react";
import { useTheme } from "@emotion/react";
import {
  InvestOverviewTable,
  NFTList,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { getIPFSString, useAccount } from "@loopring-web/core";
import { MyNFTList } from "../MyNFT/MyNFTList";
import { useLocation } from "react-router-dom";
import { usePublicNFTs } from "./usePublicNFTs";

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
  border-radius: ${({ theme }) => theme.unit}px;
  height: 100%;
  width: 100%;
` as (props: BoxProps & { url: string }) => JSX.Element;

export const CollectionItemPanel = <Co extends CollectionMeta>({
  collectionDate,
  getIPFSString,
  baseURL,
}: {
  collectionDate: Co;
  getIPFSString: GET_IPFS_STRING;
  baseURL: string;
}) => {
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const { t } = useTranslation();
  const { account } = useAccount();
  const nftPublicProps = usePublicNFTs({
    collection: collectionDate,
    page: searchParams?.get("totalPage")
      ? Number(searchParams?.get("totalPage"))
      : 1,
  });

  return (
    <Box flex={1} display={"flex"} flexDirection={"column"} paddingY={2}>
      {!!(account.readyState === AccountStatus.ACTIVATED) && (
        <>
          <Box display={"flex"} flexDirection={"column"}>
            <Typography variant={"h5"} marginBottom={1} marginX={3}>
              {t("labelTitleMyNFTSAvailable", { ns: "common" })}
            </Typography>
            <MyNFTList
              collectionMeta={collectionDate}
              size={"small"}
              myNFTPage={
                searchParams?.get("myNFTPage")
                  ? Number(searchParams?.get("myNFTPage"))
                  : 1
              }
            />
          </Box>
          <Box marginTop={3} marginBottom={2} marginX={2}>
            <Divider />
          </Box>
        </>
      )}

      <Box display={"flex"} flex={1} marginBottom={1} flexDirection={"column"}>
        <Typography variant={"h5"} marginBottom={1} marginX={3}>
          {t("labelTitleTotalAvailable", { ns: "common" })}
        </Typography>
        <NFTList
          onPageChange={(page: number) => {
            nftPublicProps.onFilterNFT({ ...nftPublicProps.filter, page });
          }}
          isSelectOnly={false}
          isMultipleSelect={false}
          getIPFSString={getIPFSString}
          baseURL={baseURL}
          nftList={nftPublicProps.listNFT}
          isLoading={nftPublicProps.isLoading}
          total={nftPublicProps.total}
          page={nftPublicProps.page}
          size={"small"}
          onClick={async (_item) => {
            nftPublicProps.onDetail();
          }}
        />
      </Box>
    </Box>
  );
};
