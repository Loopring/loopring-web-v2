import { Box, Grid, Pagination, Typography } from "@mui/material";
import {
  EmptyValueTag,
  getShortAddr,
  NFTLimit,
  SoursURL,
  CollectionMeta,
  myLog,
} from "@loopring-web/common-resources";
import {
  CardStyleItem,
  EmptyDefault,
  NFTMedia,
} from "@loopring-web/component-lib";
import { getIPFSString, useSystem } from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";

const _StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
export const MyNFTList = withTranslation("common")(
  ({
    collectionMeta,
    t,
  }: {
    collectionMeta: CollectionMeta | undefined;
  } & WithTranslation) => {
    const {
      onDetail,
      nftList,
      isLoading,
      page,
      total,
      onPageChange: collectionPageChange,
    } = useMyNFT({ collectionMeta });
    const { baseURL } = useSystem();

    return (
      <Box
        flex={1}
        // className={"MuiPaper-elevation2"}
        marginTop={2}
        marginBottom={2}
        paddingX={2}
        display={"flex"}
        flexDirection={"column"}
      >
        {isLoading ? (
          <Box
            flex={1}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"90%"}
          >
            <img
              className="loading-gif"
              alt={"loading"}
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : nftList && nftList.length ? (
          <>
            {/*{total > NFTLimit && (*/}
            {/*  <Box*/}
            {/*    display={"flex"}*/}
            {/*    alignItems={"center"}*/}
            {/*    justifyContent={"right"}*/}
            {/*    marginRight={3}*/}
            {/*    marginBottom={2}*/}
            {/*  >*/}
            {/*    <Pagination*/}
            {/*      color={"primary"}*/}
            {/*      count={*/}
            {/*        parseInt(String(total / NFTLimit)) +*/}
            {/*        (total % NFTLimit > 0 ? 1 : 0)*/}
            {/*      }*/}
            {/*      page={page}*/}
            {/*      onChange={(_event, value) => {*/}
            {/*        collectionPageChange(Number(value));*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  </Box>*/}
            {/*)}*/}
            <Grid container spacing={2}>
              {nftList.map((item, index) => (
                <Grid
                  key={(item?.nftId ?? "") + index.toString()}
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  flex={"1 1 120%"}
                >
                  <CardStyleItem
                    // sx={{ maxWidth: 345 }}
                    onClick={() => {
                      myLog("item", item);
                      onDetail(item);
                    }}
                  >
                    <Box
                      position={"absolute"}
                      width={"100%"}
                      height={"100%"}
                      display={"flex"}
                      flexDirection={"column"}
                      justifyContent={"space-between"}
                    >
                      <NFTMedia
                        item={item}
                        index={index}
                        shouldPlay={false}
                        // onNFTReload={onNFTReload}
                        onNFTError={() => undefined}
                        isOrigin={false}
                        getIPFSString={getIPFSString}
                        baseURL={baseURL}
                      />
                      <Box
                        padding={2}
                        height={80}
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        sx={{ background: "var(--color-box-nft-label)" }}
                        // flexWrap={"wrap"}
                      >
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          width={"60%"}
                        >
                          <Typography
                            color={"text.primary"}
                            component={"h6"}
                            whiteSpace={"pre"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                          >
                            {item?.name ?? EmptyValueTag}
                          </Typography>
                          <Typography
                            color={"textSecondary"}
                            component={"p"}
                            paddingTop={1}
                            minWidth={164}
                            textOverflow={"ellipsis"}
                            title={item?.nftId?.toString()}
                          >
                            {t("labelNFTTokenID")} #
                            {" " + getShortAddr(item?.nftId ?? "")}
                          </Typography>
                        </Box>

                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          alignItems={"flex-end"}
                        >
                          <Typography
                            color={"textSecondary"}
                            component={"span"}
                            whiteSpace={"pre"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                          >
                            {t("labelNFTAmountValue", { value: item.total })}
                            {/*{item?.name ?? EmptyValueTag}*/}
                          </Typography>
                          <Typography
                            color={"--color-text-primary"}
                            component={"p"}
                            paddingTop={1}
                            whiteSpace={"pre-line"}
                            minWidth={1}
                            textOverflow={"ellipsis"}
                            title={item?.nftId?.toString()}
                          >
                            {"\n"}
                          </Typography>
                          {/*<Typography*/}
                          {/*  variant={""}*/}
                          {/*  component={"div"}*/}
                          {/*  height={40}*/}
                          {/*  paddingX={3}*/}
                          {/*  whiteSpace={"pre"}*/}
                          {/*  display={"inline-flex"}*/}
                          {/*  alignItems={"center"}*/}
                          {/*  color={"textPrimary"}*/}
                          {/*  style={{*/}
                          {/*    // background: "var(--field-opacity)",*/}
                          {/*    // borderRadius: "20px",*/}
                          {/*  }}*/}
                          {/*>*/}
                          {/*  × {item.total}*/}
                          {/*</Typography>*/}
                        </Box>
                      </Box>
                    </Box>
                  </CardStyleItem>
                </Grid>
              ))}
            </Grid>
            {total > NFTLimit && (
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"right"}
                marginRight={3}
                marginTop={1}
                marginBottom={2}
              >
                <Pagination
                  color={"primary"}
                  count={
                    parseInt(String(total / NFTLimit)) +
                    (total % NFTLimit > 0 ? 1 : 0)
                  }
                  page={page}
                  onChange={(_event, value) => {
                    collectionPageChange(Number(value));
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Box flex={1} alignItems={"center"}>
            <EmptyDefault
              message={() => (
                <Box
                  flex={1}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  No NFT
                </Box>
              )}
            />
          </Box>
        )}
      </Box>
    );
  }
);
