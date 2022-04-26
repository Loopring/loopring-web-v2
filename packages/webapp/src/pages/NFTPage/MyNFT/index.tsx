import styled from "@emotion/styled";
import {
  Box,
  Card,
  Grid,
  Modal as MuiModal,
  Pagination,
  Typography,
} from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  EmptyDefault,
  ModalCloseButton,
  SwitchPanelStyled,
  useSettings,
} from "@loopring-web/component-lib";
import { useMyNFT } from "./hook";
import { NFTDetail } from "../components/detail";
import {
  EmptyValueTag,
  getShortAddr,
  SoursURL,
} from "@loopring-web/common-resources";
import { NFTMedia } from "../components/nftMedia";
import { NFTLimit } from "stores/walletLayer2NFT/saga";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const CardStyle = styled(Card)`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0 0 calc(100% + 80px);
  position: relative;

  img {
    object-fit: contain;
  }
` as typeof Card;

export const MyNFTPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const { isMobile } = useSettings();
    const {
      popItem,
      onDetail,
      onDetailClose,
      isShow,
      nftList,
      // popNFTDeposit,
      // popNFTMint,
      etherscanBaseUrl,
      isLoading,
      page,
      total,
      onNFTError,
      onPageChange,
    } = useMyNFT();

    const modalContent = React.useMemo(() => {
      // @ts-ignore
      return (
        popItem && (
          <NFTDetail
            // onNFTReload={onNFTReload}
            onNFTError={onNFTError}
            etherscanBaseUrl={etherscanBaseUrl}
            onDetailClose={onDetailClose}
            popItem={popItem}
          />
        )
      );
    }, [popItem, onNFTError, etherscanBaseUrl, onDetailClose]);

    return (
      <>
        <MuiModal
          open={isShow}
          onClose={onDetailClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled
            // width={"80%"}
            width={isMobile ? "360px" : "80%"}
            position={"relative"}
            minWidth={isMobile ? "initial" : 1000}
            style={{ alignItems: "stretch" }}
          >
            <Box display={"flex"} width={"100%"} flexDirection={"column"}>
              <ModalCloseButton onClose={onDetailClose} t={t} {...rest} />
            </Box>
            <Box
              display={"flex"}
              flexDirection={isMobile ? "column" : "row"}
              flex={1}
              justifyContent={"stretch"}
            >
              {modalContent}
            </Box>
          </SwitchPanelStyled>
        </MuiModal>

        <StyledPaper
          flex={1}
          className={"MuiPaper-elevation2"}
          marginTop={0}
          marginBottom={2}
          display={"flex"}
          flexDirection={"column"}
        >
          <Box
            marginY={2}
            marginLeft={2}
            marginRight={3}
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
            >
              {t("labelNFTMyNFT")}
            </Typography>
            {/*{!isMobile && (*/}
            {/*  <Box display={"flex"}>*/}
            {/*    <Button*/}
            {/*      variant={"contained"}*/}
            {/*      size={"small"}*/}
            {/*      style={{ marginLeft: 4 }}*/}
            {/*      onClick={() => popNFTDeposit()}*/}
            {/*    >*/}
            {/*      {t("labelNFTDeposit")}*/}
            {/*    </Button>*/}
            {/*    <Button*/}
            {/*      disabled={false}*/}
            {/*      variant={"outlined"}*/}
            {/*      size={"medium"}*/}
            {/*      style={{ marginLeft: `${theme.unit}px` }}*/}
            {/*      onClick={() => popNFTMint()}*/}
            {/*    >*/}
            {/*      {t("nftMintBtn")}*/}
            {/*    </Button>*/}
            {/*  </Box>*/}
            {/*)}*/}
          </Box>
          <Box flex={1} display={"flex"} flexDirection={"column"}>
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
                {/*<LoadingIcon style={{ width: 32, height: 32 }} />*/}
              </Box>
            ) : nftList && nftList.length ? (
              <>
                {total > NFTLimit && (
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"right"}
                    marginRight={3}
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
                <Grid container spacing={2} paddingX={3} paddingBottom={3}>
                  {nftList.map((item, index) => (
                    <Grid
                      key={(item?.nftId ?? "") + index.toString()}
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      flex={"1 1 120%"}
                    >
                      <CardStyle
                        // sx={{ maxWidth: 345 }}
                        onClick={() => {
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
                            // onNFTReload={onNFTReload}
                            onNFTError={onNFTError}
                            isOrigin={false}
                          />
                          <Box
                            padding={2}
                            height={80}
                            display={"flex"}
                            flexDirection={"row"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                          >
                            <Box display={"flex"} flexDirection={"column"}>
                              <Typography
                                color={"text.secondary"}
                                component={"h6"}
                              >
                                {item?.name ?? EmptyValueTag}
                              </Typography>
                              <Typography
                                color={"--color-text-primary"}
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

                            <Box display={"inline-flex"} alignItems={"center"}>
                              <Typography
                                variant={"h4"}
                                component={"div"}
                                height={40}
                                paddingX={3}
                                whiteSpace={"pre"}
                                display={"inline-flex"}
                                alignItems={"center"}
                                color={"textPrimary"}
                                style={{
                                  background: "var(--field-opacity)",
                                  borderRadius: "20px",
                                }}
                              >
                                × {item.total}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardStyle>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Box flex={1}>
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
            <>
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
          </Box>
        </StyledPaper>
      </>
    );
  }
);
