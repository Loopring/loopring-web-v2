import { Box, Button, Grid, Pagination, Typography } from "@mui/material";
import {
  EmptyValueTag,
  getShortAddr,
  NFTLimit,
  SoursURL,
  TOAST_TIME,
  TradeNFT,
} from "@loopring-web/common-resources";
import {
  CardStyleItem,
  CollectionCardList,
  EmptyDefault,
  NFTMedia,
  Toast,
} from "@loopring-web/component-lib";
import {
  getIPFSString,
  LoopringAPI,
  useAccount,
  useMyNFTCollection,
  useSystem,
} from "@loopring-web/core";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
export const MyNFTCollectionList = withTranslation("common")(
  ({ t }: WithTranslation) => {
    const history = useHistory();
    const { account } = useAccount();
    const { copyToastOpen, ...collectionListProps } = useMyNFTCollection();
    return (
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        <Box
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography
            component={"h3"}
            variant={"h4"}
            paddingX={5 / 2}
            paddingTop={5 / 2}
            paddingBottom={2}
          >
            {t("labelNFTMyNFTCollection")}
          </Typography>
          <Box display={"flex"} flexDirection={"row"} paddingX={5 / 2}>
            <Box marginLeft={1}>
              <Button
                variant={"contained"}
                size={"small"}
                color={"primary"}
                onClick={() => history.push("/nft/depositNFT")}
              >
                {t("labelL1toL2NFT")}
              </Button>
            </Box>
            <Box marginLeft={1}>
              <Button
                variant={"outlined"}
                color={"primary"}
                onClick={() => history.push("/nft/transactionNFT")}
              >
                {t("labelTransactionNFT")}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          paddingX={3}
          paddingBottom={2}
        >
          <CollectionCardList
            noEdit={true}
            account={account}
            onItemClick={(item) => {
              history.push({
                pathname: "/NFT/assetsNFT",
                search: `?collectionPage=${collectionListProps.page}`,
              });
            }}
            {...{ ...(collectionListProps as any) }}
          />
        </Box>
        <Toast
          alertText={
            copyToastOpen?.type === "json"
              ? t("labelCopyMetaClip")
              : copyToastOpen.type === "url"
              ? t("labelCopyUrlClip")
              : t("labelCopyAddClip")
          }
          open={copyToastOpen?.isShow}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            collectionListProps.setCopyToastOpen({ isShow: false, type: "" });
          }}
          severity={"success"}
        />
      </StyledPaper>
    );
  }
);
