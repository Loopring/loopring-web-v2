import { Box, Checkbox, Grid, Pagination, Typography } from "@mui/material";
import {
  EmptyValueTag,
  getShortAddr,
  NFTLimit,
  sizeNFTConfig,
  SoursURL,
} from "@loopring-web/common-resources";
import { CardStyleItem, EmptyDefault, NFTMedia } from "../../index";
import { getIPFSString } from "@loopring-web/core";
import { WithTranslation, withTranslation } from "react-i18next";
import { sanitize } from "dompurify";
import { NFTWholeINFO } from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";

export const NFTList = withTranslation("common")(
  <NFT extends NFTWholeINFO>({
    baseURL,
    nftList,
    size = "large",
    onPageChange,
    total,
    page,
    isLoading,
    onClick,
    selected = [],
    isSelectOnly = false,
    t,
  }: {
    baseURL: string;
    nftList: Partial<NFT>[];
    etherscanBaseUrl?: string;
    size?: "large" | "medium" | "small";
    // onDetail?: (item: Partial<NFT>) => Promise<void>;
    onClick?: (item: Partial<NFT>) => Promise<void>;
    onNFTReload?: (item: Partial<NFT>, index: number) => Promise<void>;
    onPageChange: (page: number) => void;
    total: number;
    page: number;
    isLoading: boolean;
    isSelectOnly?: boolean;
    selected?: Partial<NFT>[];
    // onSelected: (item: Partial<NFT>) => void;
  } & WithTranslation) => {
    const sizeConfig = sizeNFTConfig(size);
    const { isMobile } = useSettings();
    return (
      <Box
        flex={1}
        // className={"MuiPaper-elevation2"}
        marginTop={2}
        marginBottom={2}
        paddingX={isMobile ? 0 : 2}
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
                  xs={sizeConfig.wrap_xs}
                  md={sizeConfig.wrap_md}
                  lg={sizeConfig.wrap_lg}
                  key={(item?.nftId ?? "") + index.toString()}
                  item
                  flex={"1 1 120%"}
                >
                  <CardStyleItem
                    contentHeight={sizeConfig.contentHeight}
                    onClick={() => {
                      onClick && onClick(item);
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
                        onNFTError={() => undefined}
                        isOrigin={false}
                        getIPFSString={getIPFSString}
                        baseURL={baseURL}
                      />
                      {isSelectOnly && (
                        <Checkbox
                          size={"medium"}
                          checked={
                            !!selected.find(
                              (_item) => item.tokenId === _item.tokenId
                            )
                          }
                          value={item.tokenId}
                          name="radio-nft"
                          inputProps={{ "aria-label": "selectNFT" }}
                        />
                      )}
                      <Box
                        padding={2}
                        height={sizeConfig.contentHeight}
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
                            dangerouslySetInnerHTML={{
                              __html:
                                sanitize(item?.name ?? EmptyValueTag) ?? "",
                            }}
                          />
                          <Typography
                            color={"textSecondary"}
                            component={"p"}
                            paddingTop={1}
                            variant={size == "small" ? "body2" : "body1"}
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
                            {t(
                              size == "small"
                                ? "labelNFTAmountSimpleValue"
                                : "labelNFTAmountValue",
                              { value: item.total }
                            )}
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
                    onPageChange(Number(value));
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
